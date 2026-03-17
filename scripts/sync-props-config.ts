import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { parse as parseSFC } from '@vue/compiler-sfc';
import { Marked } from "marked";
import markedAlert from "marked-alert";
import markedShiki from "marked-shiki";
import { codeToHtml } from "shiki";

// This script updates the demo component props config with the component's props.
// It also updates the demo docs from a JSDoc comment at the top of the script tag.
// Run this script after updating the component's props.
//
// Only props with a JSDoc @demo tag are included in the demo config.
// The @demo tag can optionally specify the default value shown in the interactive demo.

const packagesDir = 'packages';
const demosDir = 'demo/components/demo';

const marked = new Marked();
marked.use(markedAlert()).use(
    markedShiki({
        async highlight(code, lang) {
            return await codeToHtml(code, {
                lang,
                theme: "light-plus",
            });
        },
        container: `<figure class="highlighted-code">
%s
</figure>
`,
    }),
);

function toLabel(name: string) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}

function getJSDocCommentText(comment: ts.JSDoc['comment']): string {
    if (!comment) return '';
    if (typeof comment === 'string') return comment;
    return comment.map((c) => (c.kind === ts.SyntaxKind.JSDocText ? c.text : '')).join('');
}

function splitJSDocText(text: string): { label: string | null; instructions: string | null } {
    const lines = text.trim().split('\n');
    const firstNonEmpty = lines.findIndex((line) => line.trim().length > 0);
    if (firstNonEmpty < 0) {
        return { label: null, instructions: null };
    }
    const label = lines[firstNonEmpty].trim() || null;
    const rest = lines.slice(firstNonEmpty + 1).join('\n').trim() || null;
    return { label, instructions: rest };
}

function parseProps(content: string) {
    const props: Record<string, any> = {};

    const { descriptor } = parseSFC(content);

    // Extract component docs from the non-setup script block.
    // We use raw text extraction (not the TS AST) to preserve @ symbols
    // inside code blocks that the TS JSDoc parser would misinterpret as tags.
    let componentDocs: string | null = null;
    if (descriptor.script?.content) {
        const firstJSDoc = descriptor.script.content.match(/\/\*\*([\s\S]*?)\*\//);
        if (firstJSDoc) {
            const text = firstJSDoc[1].replace(/^\s*\* ?/gm, '').trim();
            if (text) componentDocs = text;
        }
    }

    // Extract Props declaration text for the API reference
    let rawProps: string | null = null;

    // Parse the setup script block using the TypeScript AST
    if (descriptor.scriptSetup?.content) {
        const setupCode = descriptor.scriptSetup.content;
        const setupSource = ts.createSourceFile(
            'setup.ts',
            setupCode,
            ts.ScriptTarget.Latest,
            true,
        );

        // --- Pass 1: collect withDefaults defaults ---
        const withDefaultsMap: Record<string, string | boolean | number> = {};

        function visitForWithDefaults(node: ts.Node): void {
            if (
                ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.text === 'withDefaults' &&
                node.arguments.length >= 2 &&
                ts.isObjectLiteralExpression(node.arguments[1])
            ) {
                const defaults = node.arguments[1] as ts.ObjectLiteralExpression;
                for (const prop of defaults.properties) {
                    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
                        const propName = prop.name.text;
                        const init = prop.initializer;
                        if (ts.isStringLiteral(init)) {
                            withDefaultsMap[propName] = init.text;
                        } else if (ts.isNumericLiteral(init)) {
                            withDefaultsMap[propName] = Number(init.text);
                        } else if (init.kind === ts.SyntaxKind.TrueKeyword) {
                            withDefaultsMap[propName] = true;
                        } else if (init.kind === ts.SyntaxKind.FalseKeyword) {
                            withDefaultsMap[propName] = false;
                        }
                        // Skip undefined, arrow functions, and other non-literal values.
                    }
                }
                return;
            }
            ts.forEachChild(node, visitForWithDefaults);
        }

        visitForWithDefaults(setupSource);

        // --- Pass 2: collect props from the Props type/interface ---
        function visitForProps(node: ts.Node): void {
            const isPropsDecl =
                (ts.isTypeAliasDeclaration(node) && node.name.text === 'Props') ||
                (ts.isInterfaceDeclaration(node) && node.name.text === 'Props');

            if (isPropsDecl) {
                // Strip @demo tags (with or without a value) from the raw source text
                // since they are only used by sync-props and not part of the public API docs.
                rawProps = node.getText(setupSource).replace(/^\s*\*\s+@demo\b.*\n/gm, '');

                const members: ts.NodeArray<ts.TypeElement> =
                    ts.isTypeAliasDeclaration(node) && ts.isTypeLiteralNode(node.type)
                        ? node.type.members
                        : ts.isInterfaceDeclaration(node)
                            ? node.members
                            : ([] as unknown as ts.NodeArray<ts.TypeElement>);

                for (const member of members) {
                    if (!ts.isPropertySignature(member)) continue;

                    const name = member.name.getText(setupSource);
                    if (name === 'modelValue') continue;

                    // Only include props that have a @demo tag in their JSDoc.
                    const demoTag = ts.getJSDocTags(member).find((t) => t.tagName.text === 'demo');
                    if (!demoTag) continue;

                    const jsDocs = ts.getJSDocCommentsAndTags(member);
                    const commentText = jsDocs.length && ts.isJSDoc(jsDocs[0])
                        ? getJSDocCommentText(jsDocs[0].comment)
                        : '';
                    const { label, instructions } = splitJSDocText(commentText);

                    // A non-empty @demo value is used as the pre-filled demo default.
                    // An empty @demo tag falls back to the withDefaults value if one exists,
                    // otherwise the prop is shown with no pre-filled value (null).
                    const demoValue = getJSDocCommentText(demoTag.comment).trim();
                    const demoDefault: string | boolean | number | null =
                        demoValue.length > 0
                            ? demoValue
                            : (name in withDefaultsMap ? withDefaultsMap[name] : null);

                    const typeStr = member.type?.getText(setupSource) ?? 'unknown';
                    let type = 'string';
                    let options: string[] | undefined;

                    if (typeStr === 'boolean') {
                        type = 'boolean';
                    } else if (typeStr.includes('|')) {
                        const parts = typeStr.split('|').map((s) => s.trim().replace(/['"]/g, ''));
                        if (parts.every((p) => p === 'true' || p === 'false')) {
                            type = 'boolean';
                        } else if (parts.every((p) => !p.includes('<') && !p.includes('['))) {
                            type = 'select';
                            options = parts.filter((p) => p !== 'undefined' && p !== 'null');
                        }
                    } else if (typeStr.includes('boolean')) {
                        type = 'boolean';
                    } else if (typeStr.includes('number')) {
                        type = 'number';
                    } else if (typeStr.includes('string')) {
                        type = 'string';
                    }

                    props[name] = {
                        type,
                        label: label || toLabel(name),
                        default: demoDefault,
                    };
                    if (instructions) {
                        props[name].instructions = instructions;
                    }
                    if (options && options.length > 0) {
                        props[name].options = options;
                    }
                }
                return; // Don't recurse into the Props declaration itself
            }

            ts.forEachChild(node, visitForProps);
        }

        visitForProps(setupSource);
    }

    // Parse slots from the template block
    const slots: string[] = [];
    if (descriptor.template?.content) {
        const slotRegex = /<slot\s+[^>]*name=["']([^"']+)["'][^>]*>|<slot(?:\s+|>)/g;
        let sm;
        while ((sm = slotRegex.exec(descriptor.template.content)) !== null) {
            const slotName = sm[1] || 'default';
            if (!slots.includes(slotName)) slots.push(slotName);
        }
    }

    return { props, docs: componentDocs, rawProps, slots };
}

async function updateDemo(componentName: string, propsConfig: Record<string, any>, docs: string | null) {
    const demoPath = path.join(demosDir, `${componentName}Demo.vue`);
    if (!fs.existsSync(demoPath)) return;

    let content = fs.readFileSync(demoPath, 'utf8');

    const config: Record<string, any> = { ...propsConfig };

    const propsConfigStr = JSON.stringify(config, null, 4)
        .replace(/"([^"]+)":/g, '$1:') // remove quotes from keys
        .replace(/"/g, "'"); // use single quotes

    // Indent the config string
    const indentedConfig = propsConfigStr.split('\n').map((line, i) => i === 0 ? line : '            ' + line).join('\n');

    let newContent = content.replace(/:props-config="\{[\s\S]*?\}"/, `:props-config="${indentedConfig}"`);
    
    if (docs) {
        // Some characters cause problems with the way we're inserting this into the demo.
        // First, &lt; is replaced with < because the doc can't have a </script> due to how
        // Vue.js parses the file, so it must be "&lt;/script>"
        // Secondly, open curly braces are replaced with &lcub; to avoid Vue.js parsing issues.
        const html = (await marked.parse(docs.replace(/&lt;/g, "<")))
            .replace(/{/g, "&lcub;");

        newContent = newContent.replace(
            /<template #docs\s*>.*?<\/template>/s,
            `<template #docs>${html}</template>`,
        );
    }

    if (content !== newContent) {
        fs.writeFileSync(demoPath, newContent);
        console.log(`Updated ${demoPath}`);
    } else {
        console.log(`No changes for ${demoPath}`);
    }
}

function generateApiMarkdown(apiData: any[]) {
    let md = '# API Reference\n\n';
    md += 'This file is automatically generated. Do not edit it manually.\n\n';

    for (const data of apiData) {
        md += `## ${data.name}\n\n`;
        if (data.docs) {
            md += `${data.docs.replace(/&lt;/g, "<")}\n\n`;
        }
        if (data.rawProps) {
            md += `### Props\n\n\`\`\`typescript\n${data.rawProps}\n\`\`\`\n\n`;
        }
        if (data.slots && data.slots.length > 0) {
            md += `### Slots\n\n`;
            for (const slot of data.slots) {
                md += `- \`${slot}\`\n`;
            }
            md += '\n';
        }
        md += '---\n\n';
    }

    fs.writeFileSync('API.md', md.trim() + '\n');
    console.log('Updated API.md');
}

(async () => {
    const apiData: any[] = [];
    
    // Discover all packages with components
    const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    
    for (const packageName of packages) {
        const componentsDir = path.join(packagesDir, packageName, 'src', 'components');
        
        // Skip if this package doesn't have a components directory
        if (!fs.existsSync(componentsDir)) {
            continue;
        }
        
        const files = fs.readdirSync(componentsDir);
        for (const file of files) {
            if (file.endsWith('.vue')) {
                const componentName = file.replace('.vue', '');
                const componentPath = path.join(componentsDir, file);
                const content = fs.readFileSync(componentPath, 'utf8');
                const { props, docs, rawProps, slots } = parseProps(content);
                
                if (Object.keys(props).length > 0) {
                    await updateDemo(componentName, props, docs);
                }
                
                apiData.push({
                    name: componentName,
                    docs,
                    rawProps,
                    slots,
                });
            }
        }
    }
    
    generateApiMarkdown(apiData);
})();
