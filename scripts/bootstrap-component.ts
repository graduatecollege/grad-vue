import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

interface Options {
    force: boolean;
    dryRun: boolean;
}

function usage(): string {
    return [
        "Usage:",
        "  node --experimental-strip-types scripts/bootstrap-component.ts <ComponentName> [--force] [--dry-run]",
        "",
        "Example:",
        "  node --experimental-strip-types scripts/bootstrap-component.ts GMyNewComponent",
        "",
        "Notes:",
        "  - Creates packages/grad-vue/src/components/<ComponentName>.vue",
        "  - Creates tests/<ComponentName>.test.ts",
        "  - Updates packages/grad-vue/src/grad-vue.ts exports + plugin registration",
        "  - Updates playground/App.vue menu + adds a section",
        "  - Creates demo/components/demo/<ComponentName>Demo.vue and adds it to demo/components/Main.vue",
    ].join("\n");
}

function parseArgs(argv: string[]): {
    componentName: string | null;
    options: Options;
} {
    const options: Options = {
        force: false,
        dryRun: false,
    };

    const positional: string[] = [];
    for (const arg of argv) {
        if (arg === "--help" || arg === "-h") {
            return { componentName: null, options };
        }
        if (arg === "--force" || arg === "-f") {
            options.force = true;
            continue;
        }
        if (arg === "--dry-run") {
            options.dryRun = true;
            continue;
        }
        positional.push(arg);
    }

    if (positional.length === 0) {
        return { componentName: null, options };
    }

    return { componentName: positional[0], options };
}

function normalizeComponentName(input: string): string {
    let name = input.trim();
    name = name.replace(/\.vue$/i, "");
    if (!name.startsWith("G")) {
        name = `G${name}`;
    }
    return name;
}

function validateComponentName(componentName: string): void {
    if (!/^G[A-Z][A-Za-z0-9]*$/.test(componentName)) {
        throw new Error(
            `Invalid component name: ${componentName}. Expected PascalCase starting with "G" (e.g., GMyComponent).`,
        );
    }
}

function pascalToWords(name: string): string {
    const base = name.startsWith("G") ? name.slice(1) : name;
    return base
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
        .trim();
}

function pascalToKebab(name: string): string {
    const base = name.startsWith("G") ? name.slice(1) : name;
    return base
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();
}

async function ensureDir(dirPath: string, options: Options): Promise<void> {
    if (options.dryRun) {
        return;
    }
    await mkdir(dirPath, { recursive: true });
}

async function writeFileSafe(
    filePath: string,
    content: string,
    options: Options,
): Promise<void> {
    if (existsSync(filePath) && !options.force) {
        throw new Error(
            `Refusing to overwrite existing file: ${filePath}. Use --force to overwrite.`,
        );
    }
    if (options.dryRun) {
        return;
    }
    await writeFile(filePath, content, "utf-8");
}

function insertOnceBefore(
    content: string,
    anchor: string,
    insertion: string,
): { content: string; changed: boolean } {
    if (content.includes(insertion.trim())) {
        return { content, changed: false };
    }
    const idx = content.indexOf(anchor);
    if (idx === -1) {
        throw new Error(`Could not find anchor in file: ${anchor}`);
    }
    return {
        content: content.slice(0, idx) + insertion + content.slice(idx),
        changed: true,
    };
}

function insertOnceIntoNamedExportBlock(
    content: string,
    exportName: string,
): { content: string; changed: boolean } {
    const exportStart = content.indexOf("export {");
    if (exportStart === -1) {
        throw new Error("Could not find named export block (export { ... }).");
    }
    const exportEnd = content.indexOf("};", exportStart);
    if (exportEnd === -1) {
        throw new Error("Could not find end of named export block (};).");
    }

    const exportBlock = content.slice(exportStart, exportEnd);
    if (new RegExp(`\\b${exportName}\\b`).test(exportBlock)) {
        return { content, changed: false };
    }

    const insertion = `    ${exportName},\n`;
    return {
        content:
            content.slice(0, exportEnd) + insertion + content.slice(exportEnd),
        changed: true,
    };
}

function insertOnceIntoInstall(
    content: string,
    componentName: string,
): { content: string; changed: boolean } {
    const installStart = content.indexOf("install(app: App)");
    if (installStart === -1) {
        throw new Error("Could not find install(app: App) block.");
    }
    const installBodyStart = content.indexOf("{", installStart);
    if (installBodyStart === -1) {
        throw new Error("Could not find start of install block body.");
    }
    const installEnd = content.indexOf("\n    },", installBodyStart);
    if (installEnd === -1) {
        throw new Error("Could not find end of install block.");
    }

    const installBody = content.slice(installBodyStart, installEnd);
    const registrationLine = `        app.component(\"${componentName}\", ${componentName});`;
    if (installBody.includes(registrationLine)) {
        return { content, changed: false };
    }

    if (!installBody.includes("app.component(")) {
        throw new Error(
            "Could not find any app.component(...) calls in install block.",
        );
    }

    const insertion = `\n${registrationLine}`;
    return {
        content:
            content.slice(0, installEnd) +
            insertion +
            content.slice(installEnd),
        changed: true,
    };
}

async function updateGradVue(
    root: string,
    componentName: string,
    options: Options,
): Promise<void> {
    const filePath = path.join(root, "packages", "grad-vue", "src", "grad-vue.ts");
    const original = await readFile(filePath, "utf-8");
    let content = original;
    let changed = false;

    const importLine = `import ${componentName} from \"./components/${componentName}.vue\";\n`;
    const importAnchor = '\nimport "./css/main.css";\n';
    const r1 = insertOnceBefore(content, importAnchor, importLine);
    content = r1.content;
    changed = changed || r1.changed;

    const r2 = insertOnceIntoNamedExportBlock(content, componentName);
    content = r2.content;
    changed = changed || r2.changed;

    if (changed && !options.dryRun) {
        await writeFile(filePath, content, "utf-8");
    }
}

async function updatePlugin(
    root: string,
    componentName: string,
    options: Options,
): Promise<void> {
    const filePath = path.join(root, "packages", "grad-vue", "src", "plugin.ts");
    const original = await readFile(filePath, "utf-8");
    let content = original;
    let changed = false;

    const r = insertOnceIntoInstall(content, componentName);
    content = r.content;
    changed = changed || r.changed;

    const r2 = insertOnceBefore(content, "VGtooltip,", componentName + ",\n    ");
    content = r2.content;
    changed = changed || r2.changed;

    if (changed && !options.dryRun) {
        await writeFile(filePath, content, "utf-8");
    }
}

function insertIntoPlaygroundItems(
    content: string,
    label: string,
    anchorId: string,
): { content: string; changed: boolean } {
    const itemsStart = content.indexOf(':items="[');
    if (itemsStart === -1) {
        throw new Error(
            'Could not find :items="[ ... ]" in playground/App.vue',
        );
    }
    const itemsEnd = content.indexOf(']"', itemsStart);
    if (itemsEnd === -1) {
        throw new Error(
            "Could not find end of :items array in playground/App.vue",
        );
    }

    const arrayText = content.slice(itemsStart, itemsEnd);
    const newItem = `                        { label: '${label}', href: '#${anchorId}' },\n`;
    if (arrayText.includes(newItem.trim())) {
        return { content, changed: false };
    }

    return {
        content: content.slice(0, itemsEnd) + newItem + content.slice(itemsEnd),
        changed: true,
    };
}

function insertIntoPlaygroundSections(
    content: string,
    label: string,
    anchorId: string,
    componentName: string,
): { content: string; changed: boolean } {
    const sectionSnippet = `<section id=\"${anchorId}\">`;
    if (content.includes(sectionSnippet)) {
        return { content, changed: false };
    }

    const mainClose = "\n            </main>";
    const idx = content.indexOf(mainClose);
    if (idx === -1) {
        throw new Error("Could not find </main> in playground/App.vue");
    }

    const insertion = [
        "",
        `                <section id=\"${anchorId}\">`,
        `                    <h2>${label}</h2>`,
        `                    <${componentName} label=\"${label}\">`,
        "                        <p>Example content</p>",
        `                    </${componentName}>`,
        "                </section>",
    ].join("\n");

    return {
        content: content.slice(0, idx) + insertion + content.slice(idx),
        changed: true,
    };
}

async function updatePlayground(
    root: string,
    componentName: string,
    options: Options,
): Promise<void> {
    const filePath = path.join(root, "playground", "App.vue");
    const original = await readFile(filePath, "utf-8");
    let content = original;
    let changed = false;

    const label = pascalToWords(componentName);
    const anchorId = pascalToKebab(componentName);

    const r1 = insertIntoPlaygroundItems(content, label, anchorId);
    content = r1.content;
    changed = changed || r1.changed;

    const r2 = insertIntoPlaygroundSections(
        content,
        label,
        anchorId,
        componentName,
    );
    content = r2.content;
    changed = changed || r2.changed;

    if (changed && !options.dryRun) {
        await writeFile(filePath, content, "utf-8");
    }
}

function insertIntoDemoMainImports(
    content: string,
    demoImportName: string,
    demoImportPath: string,
) {
    const importLine = `import ${demoImportName} from \"${demoImportPath}\";\n`;
    if (content.includes(importLine.trim())) {
        return { content, changed: false };
    }
    const anchor = "import { onMounted";
    return insertOnceBefore(content, anchor, importLine);
}

function insertIntoDemoComponentsArray(
    content: string,
    label: string,
    demoImportName: string,
) {
    const arrayStart = content.indexOf("const demoComponents = [");
    if (arrayStart === -1) {
        throw new Error(
            "Could not find demoComponents array in demo/components/Main.vue",
        );
    }
    const arrayEnd = content.indexOf("];", arrayStart);
    if (arrayEnd === -1) {
        throw new Error(
            "Could not find end of demoComponents array in demo/components/Main.vue",
        );
    }

    const arrayText = content.slice(arrayStart, arrayEnd);
    const entryLine = `    { label: \"${label}\", component: ${demoImportName} },`;
    if (arrayText.includes(entryLine)) {
        return { content, changed: false };
    }

    const insertion = `    { label: \"${label}\", component: ${demoImportName} },\n`;
    return {
        content:
            content.slice(0, arrayEnd) + insertion + content.slice(arrayEnd),
        changed: true,
    };
}

async function updateDemoMain(
    root: string,
    componentName: string,
    options: Options,
): Promise<void> {
    const filePath = path.join(root, "demo", "components", "Main.vue");
    const original = await readFile(filePath, "utf-8");
    let content = original;
    let changed = false;

    const label = pascalToWords(componentName);
    const demoImportName = `${componentName}Demo`;
    const demoImportPath = `~/components/demo/${demoImportName}.vue`;

    const r1 = insertIntoDemoMainImports(
        content,
        demoImportName,
        demoImportPath,
    );
    content = r1.content;
    changed = changed || r1.changed;

    const r2 = insertIntoDemoComponentsArray(content, label, demoImportName);
    content = r2.content;
    changed = changed || r2.changed;

    if (changed && !options.dryRun) {
        await writeFile(filePath, content, "utf-8");
    }
}

function componentTemplate(componentName: string): string {
    const label = pascalToWords(componentName);
    const baseClass = `g-${pascalToKebab(componentName)}`;

    return `<script setup lang=\"ts\">
/**
 * Documentation for the component that will be used in the demo website.
 * 
 * This can use **markdown** and \`code blocks\`.
 */
interface Props {
   /**
    * Accessible label 
    */
    label?: string;
}

const props = withDefaults(defineProps<Props>(), {
    label: \"${label}\",
});
</script>

<template>
    <div class=\"${baseClass}\">
        <div v-if=\"props.label\" class=\"${baseClass}__label\">{{ props.label }}</div>
        <div class=\"${baseClass}__content\">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.${baseClass} {
    display: block;
}

.${baseClass}__label {
    font-weight: 600;
}

.${baseClass}__content {
    margin-top: 0.5rem;
}
</style>
`;
}

function testTemplate(componentName: string): string {
    const label = pascalToWords(componentName);
    // language=typescript
    return `import { describe, it } from \"vitest\";
import ${componentName} from \"../packages/grad-vue/src/components/${componentName}.vue\";
import { testAccessibility } from \"./test-utils\";

describe(\"${componentName}\", () => {
    describe(\"Accessibility Tests\", () => {
        it(\"passes accessibility tests with default content\", async () => {
            await testAccessibility(
                ${componentName},
                { label: \"${label}\" },
                { default: \"<p>Example content</p>\" },
            );
        });
    });
});
`;
}

function demoTemplate(componentName: string): string {
    const label = pascalToWords(componentName);
    const anchorId = pascalToKebab(componentName);

    return `<script setup lang=\"ts\">
import ComponentDemo from \"../ComponentDemo.vue\";
</script>

<template>
    <section id=\"${anchorId}\" class=\"demo-section\">
        <h2 class=\"demo-section__title\">${label}</h2>
        <ComponentDemo
            name=\"Basic ${label}\"
            description=\"Scaffolded demo for ${componentName}.\"
            component=\"${componentName}\"
            :props-config=\"{
                label: {
                    type: 'string',
                    label: 'Label',
                    default: '${label}'
                }
            }\"
        >
            <template #docs></template>
            <template #default=\"{ props }\">
                <${componentName} v-bind=\"props\">
                    <p>Example content</p>
                </${componentName}>
            </template>
        </ComponentDemo>
    </section>
</template>
`;
}

async function main() {
    const { componentName: rawName, options } = parseArgs(
        process.argv.slice(2),
    );
    if (!rawName) {
        console.log(usage());
        process.exit(1);
    }

    const componentName = normalizeComponentName(rawName);
    validateComponentName(componentName);

    const root = process.cwd();

    const componentFilePath = path.join(
        root,
        "packages",
        "grad-vue",
        "src",
        "components",
        `${componentName}.vue`,
    );
    const testFilePath = path.join(root, "tests", `${componentName}.test.ts`);
    const demoDir = path.join(root, "demo", "components", "demo");
    const demoFilePath = path.join(demoDir, `${componentName}Demo.vue`);

    await ensureDir(path.dirname(componentFilePath), options);
    await ensureDir(path.dirname(testFilePath), options);
    await ensureDir(demoDir, options);

    await writeFileSafe(
        componentFilePath,
        componentTemplate(componentName),
        options,
    );
    await writeFileSafe(testFilePath, testTemplate(componentName), options);
    await writeFileSafe(demoFilePath, demoTemplate(componentName), options);

    await updateGradVue(root, componentName, options);
    await updatePlugin(root, componentName, options);
    await updatePlayground(root, componentName, options);
    await updateDemoMain(root, componentName, options);

    const summary = [
        `✓ Component created: packages/grad-vue/src/components/${componentName}.vue`,
        `✓ Test created: tests/${componentName}.test.ts`,
        `✓ Exported + registered: packages/grad-vue/src/grad-vue.ts`,
        `✓ Added to playground: playground/App.vue`,
        `✓ Demo created + wired: demo/components/demo/${componentName}Demo.vue + demo/components/Main.vue`,
    ];

    if (options.dryRun) {
        console.log("(dry-run) No files were written.");
    }
    console.log(summary.join("\n"));
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
