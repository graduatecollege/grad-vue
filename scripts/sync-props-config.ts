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
// Props can include a JSDoc @demo tag to specify the default value shown in
// the interactive demo. For example:
//
//   /**
//    * Modal label
//    * @demo Basic Modal
//    */
//   label: string;

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

        // --- Pass 1: collect props from the Props type/interface ---
        function visitForProps(node: ts.Node): void {
            const isPropsDecl =
                (ts.isTypeAliasDeclaration(node) && node.name.text === 'Props') ||
                (ts.isInterfaceDeclaration(node) && node.name.text === 'Props');

            if (isPropsDecl) {
                // Strip @demo tags from the raw source text - they are only used by sync-props
                rawProps = node.getText(setupSource).replace(/^\s*\*\s+@demo\s.*\n/gm, '');

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

                    const jsDocs = ts.getJSDocCommentsAndTags(member);
                    if (!jsDocs.length || !ts.isJSDoc(jsDocs[0])) continue;

                    const commentText = getJSDocCommentText(jsDocs[0].comment);
                    const { label, instructions } = splitJSDocText(commentText);
                    if (!label) continue;

                    // Read @demo tag for the demo default value
                    const demoTag = ts.getJSDocTags(member).find((t) => t.tagName.text === 'demo');
                    const demoDefault = demoTag
                        ? getJSDocCommentText(demoTag.comment).trim() || undefined
                        : undefined;

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

        // --- Pass 2: fill in defaults from withDefaults() ---
        function visitForDefaults(node: ts.Node): void {
            if (
                ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.text === 'withDefaults'
            ) {
                const defaultsArg = node.arguments[1];
                if (defaultsArg && ts.isObjectLiteralExpression(defaultsArg)) {
                    for (const prop of defaultsArg.properties) {
                        if (!ts.isPropertyAssignment(prop)) continue;
                        const key = prop.name.getText(setupSource);
                        if (!(key in props) || props[key].default !== undefined) continue;

                        const valStr = prop.initializer.getText(setupSource).trim();
                        // Skip factory functions used for array/object defaults
                        if (valStr.startsWith('()') || valStr.startsWith('function')) continue;

                        let val: any = valStr.replace(/['"]/g, '');
                        if (props[key].type === 'boolean') {
                            val = val === 'true';
                        } else if (props[key].type === 'number') {
                            val = valStr === 'undefined' ? null : Number(val);
                        } else if (valStr === 'undefined') {
                            val = null;
                        }
                        props[key].default = val;
                    }
                }
            }
            ts.forEachChild(node, visitForDefaults);
        }

        visitForDefaults(setupSource);
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
