/**
 * Generates TypeScript type declarations and a Custom Elements Manifest (CEM)
 * for the grad-vue web components from their Vue SFC sources.
 *
 * Outputs:
 *   packages/grad-vue/src/custom-elements.ts  – compiled by vue-tsc → dist/custom-elements.d.ts
 *   packages/grad-vue/custom-elements.json    – CEM 2.0.0 for editors that support it
 *
 * Run: node --experimental-strip-types scripts/generate-custom-element-types.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { parse as parseSFC } from '@vue/compiler-sfc';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../..');
const PACKAGE_DIR = path.join(REPO_ROOT, 'packages/grad-vue');
const SRC_DIR = path.join(PACKAGE_DIR, 'src');
const WEB_COMPONENTS_SRC = path.join(SRC_DIR, 'web-components.ts');
const OUTPUT_TYPES = path.join(SRC_DIR, 'grad-vue-elements.ts');
const OUTPUT_MANIFEST = path.join(PACKAGE_DIR, 'custom-elements.json');

// ── Types ─────────────────────────────────────────────────────────────────────

interface TagEntry {
    tag: string;
    componentName: string;
    /** Import path as written in web-components.ts, e.g. "./components/GButton.vue" */
    importPath: string;
}

interface PropInfo {
    name: string;
    type: string;
    optional: boolean;
    description?: string;
    defaultValue?: string;
}

interface ModelInfo {
    name: string;
    type: string;
}

interface EmitInfo {
    name: string;
}

interface ComponentEntry extends TagEntry {
    isGeneric: boolean;
    props: PropInfo[];
    models: ModelInfo[];
    emits: EmitInfo[];
    neededImports: Array<{ name: string; from: string }>;
}

// ── Step 1: parse web-components.ts ──────────────────────────────────────────

function parseWebComponentsFile(): TagEntry[] {
    const content = fs.readFileSync(WEB_COMPONENTS_SRC, 'utf8');
    const source = ts.createSourceFile(
        'web-components.ts',
        content,
        ts.ScriptTarget.Latest,
        true,
    );

    const importMap: Record<string, string> = {};
    ts.forEachChild(source, (node) => {
        if (
            ts.isImportDeclaration(node) &&
            ts.isStringLiteral(node.moduleSpecifier) &&
            node.importClause?.name
        ) {
            importMap[node.importClause.name.text] = node.moduleSpecifier.text;
        }
    });

    const entries: TagEntry[] = [];

    const addEntry = (tag: string, componentName: string | null) => {
        if (!componentName || !importMap[componentName]) return;
        entries.push({ tag, componentName, importPath: importMap[componentName] });
    };

    // Current pattern: iterate a `components` tuple array and call customElements.define.
    // Parse that array directly so generation remains robust to registration refactors.
    ts.forEachChild(source, (node) => {
        if (!ts.isVariableStatement(node)) return;
        for (const decl of node.declarationList.declarations) {
            if (!ts.isIdentifier(decl.name) || decl.name.text !== 'components') continue;
            if (!decl.initializer || !ts.isArrayLiteralExpression(decl.initializer)) continue;

            for (const el of decl.initializer.elements) {
                if (!ts.isArrayLiteralExpression(el) || el.elements.length < 2) continue;
                const [tagExpr, componentExpr] = el.elements;
                if (!ts.isStringLiteral(tagExpr)) continue;

                let componentName: string | null = null;
                if (ts.isIdentifier(componentExpr)) {
                    componentName = componentExpr.text;
                } else if (ts.isAsExpression(componentExpr) && ts.isIdentifier(componentExpr.expression)) {
                    componentName = componentExpr.expression.text;
                }

                addEntry(tagExpr.text, componentName);
            }
        }
    });

    if (entries.length > 0) {
        return entries;
    }

    // Backward-compatible fallback: direct customElements.define("tag", defineCustomElement(Component)).
    function visit(node: ts.Node): void {
        if (
            ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.text === 'customElements' &&
            node.expression.name.text === 'define' &&
            node.arguments.length === 2 &&
            ts.isStringLiteral(node.arguments[0])
        ) {
            const tag = node.arguments[0].text;
            const secondArg = node.arguments[1];
            let componentName: string | null = null;

            if (ts.isCallExpression(secondArg) && secondArg.arguments.length > 0) {
                const inner = secondArg.arguments[0];
                if (ts.isIdentifier(inner)) {
                    componentName = inner.text;
                } else if (ts.isAsExpression(inner) && ts.isIdentifier(inner.expression)) {
                    componentName = inner.expression.text;
                }
            }

            addEntry(tag, componentName);
        }
        ts.forEachChild(node, visit);
    }

    visit(source);
    return entries;
}

// ── Step 2: SFC parsing helpers ───────────────────────────────────────────────

function getJSDocText(node: ts.Node): string | undefined {
    const docs = ts.getJSDocCommentsAndTags(node);
    if (!docs.length) return undefined;
    const doc = docs[0];
    if (!ts.isJSDoc(doc) || !doc.comment) return undefined;
    const c = doc.comment;
    const raw = typeof c === 'string' ? c : c.map((x) => (x.kind === ts.SyntaxKind.JSDocText ? x.text : '')).join('');
    return raw.trim() || undefined;
}

/** Escape a string for use as a literal pattern inside a RegExp. */
function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Split a comma-separated generic parameter list, respecting angle-bracket depth. */
function splitOnTopLevelCommas(s: string): string[] {
    const result: string[] = [];
    let depth = 0;
    let cur = '';
    for (const ch of s) {
        if (ch === '<' || ch === '(' || ch === '{') depth++;
        else if (ch === '>' || ch === ')' || ch === '}') depth--;
        else if (ch === ',' && depth === 0) {
            result.push(cur);
            cur = '';
            continue;
        }
        cur += ch;
    }
    if (cur.trim()) result.push(cur);
    return result;
}

/**
 * Parse "T extends TableRow, C extends TableColumn<T>" into
 * { T: "TableRow", C: "TableColumn<TableRow>" } (cross-references resolved).
 * Handles multi-line generic attribute values by normalising whitespace first.
 */
function parseGenericSubstitutions(generic: string): Record<string, string> {
    // Collapse all whitespace sequences to a single space so multi-line generic
    // attributes (e.g. in <script setup generic="\n  T extends {...}\n">) are
    // parsed correctly.
    const normalized = generic.replace(/\s+/g, ' ').trim();
    const subs: Record<string, string> = {};
    for (const part of splitOnTopLevelCommas(normalized)) {
        const m = part.trim().match(/^(\w+)\s+extends\s+(.+)$/);
        if (m) {
            let constraint = m[2].trim();
            // Apply already-resolved substitutions so C can reference T
            for (const [k, v] of Object.entries(subs)) {
                constraint = constraint.replace(new RegExp(`\\b${escapeRegex(k)}\\b`, 'g'), v);
            }
            subs[m[1]] = constraint;
        }
    }
    return subs;
}

function applySubstitutions(typeStr: string, subs: Record<string, string>): string {
    const keys = Object.keys(subs).sort((a, b) => b.length - a.length);
    let result = typeStr;
    for (const key of keys) {
        result = result.replace(new RegExp(`\\b${escapeRegex(key)}\\b`, 'g'), subs[key]);
    }
    return result;
}

/**
 * Known external types that may appear in component props.
 * Maps type name → module specifier relative to src/.
 */
const KNOWN_EXTERNAL_TYPES: Record<string, string> = {
    VNode: 'vue',
    TableColumn: './components/table/TableColumn.ts',
    TableRow: './components/table/TableColumn.ts',
    UseFilteringReturn: './compose/useFiltering.ts',
    UseTableChangesReturn: './compose/useTableChanges.ts',
    CellChangePayload: './compose/useTableChanges.ts',
    BulkAction: './components/GTable.vue',
    GSearchGroup: './components/GSearch.vue',
    TreeMenuItem: './components/tree-menu/GTreeMenuList.vue',
};

function detectNeededImports(typeStr: string): Array<{ name: string; from: string }> {
    return Object.entries(KNOWN_EXTERNAL_TYPES)
        .filter(([name]) => new RegExp(`\\b${escapeRegex(name)}\\b`).test(typeStr))
        .map(([name, from]) => ({ name, from }));
}

// ── Step 3: parse a single Vue SFC ───────────────────────────────────────────

function parseSFCFile(sfcAbsPath: string): Omit<ComponentEntry, keyof TagEntry> {
    const content = fs.readFileSync(sfcAbsPath, 'utf8');
    const { descriptor } = parseSFC(content);

    const props: PropInfo[] = [];
    const models: ModelInfo[] = [];
    const emits: EmitInfo[] = [];
    const neededImports: Array<{ name: string; from: string }> = [];

    const isGeneric = !!(descriptor.scriptSetup?.attrs?.generic);
    const genericSubstitutions = isGeneric
        ? parseGenericSubstitutions(String(descriptor.scriptSetup!.attrs!.generic))
        : {};

    if (!descriptor.scriptSetup?.content) {
        return { isGeneric, props, models, emits, neededImports };
    }

    const setupCode = descriptor.scriptSetup.content;
    const source = ts.createSourceFile('setup.ts', setupCode, ts.ScriptTarget.Latest, true);

    // --- Pass 1: collect withDefaults to mark optional props ---
    const withDefaultsMap = new Map<string, string>();
    function collectWithDefaults(node: ts.Node): void {
        if (
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'withDefaults' &&
            node.arguments.length >= 2 &&
            ts.isObjectLiteralExpression(node.arguments[1])
        ) {
            for (const prop of (node.arguments[1] as ts.ObjectLiteralExpression).properties) {
                if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                    withDefaultsMap.set(prop.name.text, prop.initializer.getText(source));
                }
            }
            return;
        }
        ts.forEachChild(node, collectWithDefaults);
    }
    collectWithDefaults(source);

    // --- Pass 2: collect Props type members ---
    function collectProps(node: ts.Node): void {
        const isPropsDecl =
            (ts.isTypeAliasDeclaration(node) && node.name.text === 'Props') ||
            (ts.isInterfaceDeclaration(node) && node.name.text === 'Props');

        if (isPropsDecl) {
            const members: ts.NodeArray<ts.TypeElement> =
                ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)
                    ? node.type.members
                    : ts.isInterfaceDeclaration(node)
                        ? node.members
                        : ([] as unknown as ts.NodeArray<ts.TypeElement>);

            for (const member of members) {
                if (!ts.isPropertySignature(member)) continue;
                const name = ts.isIdentifier(member.name)
                    ? member.name.text
                    : member.name.getText(source);
                const optional = !!member.questionToken || withDefaultsMap.has(name);
                let typeStr = member.type?.getText(source) ?? 'unknown';

                if (isGeneric) {
                    typeStr = applySubstitutions(typeStr, genericSubstitutions);
                }

                // Detect needed external type imports
                for (const imp of detectNeededImports(typeStr)) {
                    if (!neededImports.some((i) => i.name === imp.name)) {
                        neededImports.push(imp);
                    }
                }

                // Strip @demo annotations from JSDoc, normalise to a single line
                const rawDoc = getJSDocText(member);
                const description = rawDoc
                    ?.replace(/@demo\b.*$/gm, '')
                    .replace(/\s*\n\s*/g, ' ')
                    .trim() || undefined;
                const defaultValue = withDefaultsMap.get(name);
                props.push({ name, type: typeStr, optional, description, defaultValue });
            }
            return;
        }
        ts.forEachChild(node, collectProps);
    }
    collectProps(source);

    // --- Pass 3: collect defineModel calls ---
    function collectModels(node: ts.Node): void {
        if (
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'defineModel'
        ) {
            let modelName = 'modelValue';
            let modelType = 'unknown';

            if (node.typeArguments?.length) {
                let t = node.typeArguments[0].getText(source);
                if (isGeneric) t = applySubstitutions(t, genericSubstitutions);
                modelType = t;
            }
            if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
                modelName = node.arguments[0].text;
            }
            models.push({ name: modelName, type: modelType });
        }
        ts.forEachChild(node, collectModels);
    }
    collectModels(source);

    // --- Pass 4: collect defineEmits ---
    function collectEmits(node: ts.Node): void {
        if (
            ts.isCallExpression(node) &&
            ts.isIdentifier(node.expression) &&
            node.expression.text === 'defineEmits'
        ) {
            // Array form: defineEmits(["cancel", "confirm"])
            if (node.arguments.length > 0 && ts.isArrayLiteralExpression(node.arguments[0])) {
                for (const el of node.arguments[0].elements) {
                    if (ts.isStringLiteral(el)) emits.push({ name: el.text });
                }
            }

            if (node.typeArguments?.length) {
                const typeArg = node.typeArguments[0];
                if (ts.isTypeLiteralNode(typeArg)) {
                    for (const member of typeArg.members) {
                        // Method / property signature form: { submit: [values: any] }
                        if (
                            (ts.isMethodSignature(member) || ts.isPropertySignature(member)) &&
                            (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
                        ) {
                            const name = ts.isIdentifier(member.name)
                                ? member.name.text
                                : (member.name as ts.StringLiteral).text;
                            emits.push({ name });
                        }

                        // Call-signature form: (e: "row-click", link: string): void
                        if (
                            ts.isCallSignatureDeclaration(member) &&
                            member.parameters.length > 0 &&
                            member.parameters[0].type &&
                            ts.isLiteralTypeNode(member.parameters[0].type) &&
                            ts.isStringLiteral(member.parameters[0].type.literal)
                        ) {
                            emits.push({ name: member.parameters[0].type.literal.text });
                        }
                    }
                }
            }
        }
        ts.forEachChild(node, collectEmits);
    }
    collectEmits(source);

    return { isGeneric, props, models, emits, neededImports };
}

// ── Step 4: generate src/custom-elements.ts ───────────────────────────────────

function generateTypesFile(entries: ComponentEntry[]): string {
    const lines: string[] = [
        '// Generated by scripts/generate-custom-element-types.ts — do not edit manually.',
        '// Run `npm run generate:types` to regenerate after modifying component props.',
        '',
    ];

    const nonGeneric = entries.filter((e) => !e.isGeneric);
    const generic = entries.filter((e) => e.isGeneric);

    // Merge all needed external imports, grouping by module specifier
    const externalImportMap = new Map<string, Set<string>>();
    if (nonGeneric.length > 0) {
        // CEProps helper requires these from vue
        if (!externalImportMap.has('vue')) externalImportMap.set('vue', new Set());
        externalImportMap.get('vue')!.add('AllowedComponentProps');
        externalImportMap.get('vue')!.add('VNodeProps');
    }
    for (const entry of generic) {
        for (const imp of entry.neededImports) {
            if (!externalImportMap.has(imp.from)) externalImportMap.set(imp.from, new Set());
            externalImportMap.get(imp.from)!.add(imp.name);
        }
    }

    // Emit external type imports
    for (const [from, names] of externalImportMap) {
        lines.push(`import type { ${[...names].sort().join(', ')} } from '${from}';`);
    }
    if (externalImportMap.size > 0) lines.push('');

    // Emit per-component type imports for non-generic components
    if (nonGeneric.length > 0) {
        for (const entry of nonGeneric) {
            lines.push(`import type ${entry.componentName} from '${entry.importPath}';`);
        }
        lines.push('');

        lines.push(
            '/** Extracts the declared props from a Vue component, stripping Vue-internal VNode props. */',
        );
        lines.push(
            'type CEProps<C extends abstract new (...args: any[]) => { $props: any }> =',
        );
        lines.push(
            "    Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps>;",
        );
        lines.push('');
    }

    // Emit element interfaces
    for (const entry of entries) {
        const ifaceName = `${entry.componentName}Element`;
        if (!entry.isGeneric) {
            // Use a type intersection rather than interface inheritance to avoid
            // TS2320 errors when component props share names with HTMLElement properties
            // (e.g. `title`, `prefix`).
            lines.push(
                `export type ${ifaceName} = HTMLElement & CEProps<typeof ${entry.componentName}>;`,
            );
        } else {
            lines.push(`export interface ${ifaceName} extends HTMLElement {`);
            for (const prop of entry.props) {
                if (prop.description) lines.push(`    /** ${prop.description} */`);
                lines.push(`    ${prop.name}${prop.optional ? '?' : ''}: ${prop.type};`);
            }
            for (const model of entry.models) {
                lines.push(`    ${model.name}?: ${model.type};`);
            }
            lines.push('}');
        }
    }

    lines.push('');
    lines.push('declare global {');
    lines.push('    interface HTMLElementTagNameMap {');
    for (const entry of entries) {
        lines.push(`        '${entry.tag}': ${entry.componentName}Element;`);
    }
    lines.push('    }');
    lines.push('}');
    lines.push('');

    return lines.join('\n');
}

// ── Step 5: generate custom-elements.json (CEM 2.0.0) ────────────────────────

function generateManifest(entries: ComponentEntry[]): object {
    return {
        schemaVersion: '2.0.0',
        modules: entries.map((entry) => ({
            kind: 'javascript-module',
            path: 'dist/web-components.js',
            declarations: [
                {
                    kind: 'custom-element',
                    name: `${entry.componentName}Element`,
                    tagName: entry.tag,
                    members: [
                        ...entry.props.map((p) => ({
                            kind: 'field',
                            name: p.name,
                            type: { text: p.type },
                            optional: p.optional,
                            ...(p.description ? { description: p.description } : {}),
                            ...(p.defaultValue !== undefined ? { default: p.defaultValue } : {}),
                        })),
                        ...entry.models.map((m) => ({
                            kind: 'field',
                            name: m.name,
                            type: { text: m.type },
                            optional: true,
                        })),
                    ],
                    events: entry.emits.map((e) => ({
                        name: e.name,
                        type: { text: 'CustomEvent' },
                    })),
                },
            ],
        })),
    };
}

// ── Main ──────────────────────────────────────────────────────────────────────

const tagEntries = parseWebComponentsFile();
const componentEntries: ComponentEntry[] = [];

for (const entry of tagEntries) {
    const absImportPath = path.resolve(SRC_DIR, entry.importPath);
    const sfcPath = absImportPath.endsWith('.vue') || absImportPath.endsWith('.ts')
        ? absImportPath
        : absImportPath + '.vue';

    if (!fs.existsSync(sfcPath)) {
        console.warn(`[generate-custom-element-types] Component not found: ${sfcPath}`);
        continue;
    }

    const parsed = parseSFCFile(sfcPath);
    componentEntries.push({ ...entry, ...parsed });
}

const typesContent = generateTypesFile(componentEntries);
fs.writeFileSync(OUTPUT_TYPES, typesContent);
console.log(`Generated ${path.relative(REPO_ROOT, OUTPUT_TYPES)}`);

const manifest = generateManifest(componentEntries);
fs.writeFileSync(OUTPUT_MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated ${path.relative(REPO_ROOT, OUTPUT_MANIFEST)}`);
