import fs from 'node:fs';
import path from 'node:path';
import { Marked } from "marked";
import markedAlert from "marked-alert";
import markedShiki from "marked-shiki";
import { codeToHtml } from "shiki";

// This script updates the demo component props config with the component's props.
// It also updates the demo docs from a JSDoc comment at the top of the script tag.
// Run this script after updating the component's props.

const componentsDir = 'src/components';
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

function parseJsDoc(jsDocRaw: string) {
    const cleaned = jsDocRaw.replace(/^\s*\* ?/gm, '').trim();
    if (!cleaned) {
        return { label: null as string | null, instructions: null as string | null };
    }

    const lines = cleaned.split(/\r?\n/);
    const firstLineIndex = lines.findIndex((line) => line.trim().length > 0);
    if (firstLineIndex < 0) {
        return { label: null as string | null, instructions: null as string | null };
    }

    const label = lines[firstLineIndex].trim();
    const rest = lines.slice(firstLineIndex + 1).join('\n').trim();
    return {
        label: label || null,
        instructions: rest || null,
    };
}

function parseProps(content: string) {
    const props: Record<string, any> = {};
    const slots: string[] = [];

    // Match component documentation
    const docMatch = content.match(/<script.*>\s+\/\*\*\s*\*\s*([\s\S]*?)\s*\*\//s);
    const componentDocs = docMatch ? docMatch[1].replace(/^\s*\* ?/gm, '').trim() : null;

    // Match interface or type Props
    const propsMatch = content.match(/(?:interface|type) Props\s*(?:=)?\s*{([\s\S]*?)}/);
    const rawProps = propsMatch ? `interface Props {${propsMatch[1]}}` : null;
    
    // Parse slots from template
    const slotRegex = /<slot\s+[^>]*name=["']([^"']+)["'][^>]*>|<slot(?:\s+|>)/g;
    let sm;
    while ((sm = slotRegex.exec(content)) !== null) {
        const slotName = sm[1] || 'default';
        if (!slots.includes(slotName)) {
            slots.push(slotName);
        }
    }

    if (propsMatch) {
        const propsContent = propsMatch[1];
        const propRegex = /(\/\*\*\s*\*\s*([\s\S]*?)\*\/)?\s*(\w+)\??\s*:\s*([^;]+);\s*(\/\/\s*Demo: ([^\n\r]+))?/g;
        let m;

        while ((m = propRegex.exec(propsContent)) !== null) {
            const jsDoc = m[2]?.trim();
            const name = m[3];
            let typeStr = m[4].trim();
            const demoDefault = m[6];

            if (!jsDoc) continue;

            if (name === 'modelValue') continue;

            let type = 'string';
            let options: string[] | undefined = undefined;

            if (typeStr === 'boolean') {
                type = 'boolean';
            } else if (typeStr.includes('|')) {
                const parts = typeStr.split('|').map(s => s.trim().replace(/['"]/g, ''));
                if (parts.every(p => p === 'true' || p === 'false')) {
                    type = 'boolean';
                } else if (parts.every(p => !p.includes('<') && !p.includes('['))) {
                    type = 'select';
                    options = parts.filter(p => p !== 'undefined' && p !== 'null');
                }
            } else if (typeStr.includes('boolean')) {
                type = 'boolean';
            } else if (typeStr.includes('number')) {
                type = 'number';
            } else if (typeStr.includes('string')) {
                type = 'string';
            }

            const { label, instructions } = parseJsDoc(jsDoc);

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

        // Parse defaults
        const defaultsMatch = content.match(/withDefaults\(defineProps<Props>\(\),\s*{([\s\S]*?)}\)/);
        if (defaultsMatch) {
            const defaultsContent = defaultsMatch[1];
            for (const name in props) {
                const defaultRegex = new RegExp(`${name}\\s*:\\s*([^,}\\n]+)`);
                const dm = defaultsContent.match(defaultRegex);
                if (dm) {
                    let valStr = dm[1].trim();
                    let val: any = valStr.replace(/['"]/g, '');
                    if (props[name].type === 'boolean') {
                        val = val === 'true';
                    } else if (props[name].type === 'number') {
                        val = valStr === 'undefined' ? null : Number(val);
                    } else if (valStr === 'undefined') {
                        val = null;
                    }
                    props[name].default = val;
                }
            }
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
    const files = fs.readdirSync(componentsDir);
    for (const file of files) {
        if (file.endsWith('.vue')) {
            const componentName = file.replace('.vue', '');
            const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
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
    generateApiMarkdown(apiData);
})();
