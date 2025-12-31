import fs from 'node:fs';
import path from 'node:path';
import { marked } from "marked";

const componentsDir = 'src/components';
const demosDir = 'demo/components/demo';

function toLabel(name: string) {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}

function parseProps(content: string) {
    const props: Record<string, any> = {};

    // Match component documentation
    const docMatch = content.match(/<script[^>]*>\s*\/\*\*\s*\*\s*([\s\S]*?)\s*\*\//);
    const componentDocs = docMatch ? docMatch[1].replace(/^\s*\* ?/gm, '').trim() : null;

    // Match interface or type Props
    const propsMatch = content.match(/(?:interface|type) Props\s*(?:=)?\s*{([\s\S]*?)}/);
    if (!propsMatch) return props;

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

        props[name] = {
            type,
            label: jsDoc || toLabel(name),
            default: demoDefault
        };
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

    return { props, docs: componentDocs };
}

function updateDemo(componentName: string, propsConfig: Record<string, any>, docs: string | null) {
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
        const html = marked(docs);
        newContent = newContent.replace(
            /<template #docs>.*?<\/template>/s,
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

const files = fs.readdirSync(componentsDir);
for (const file of files) {
    if (file.endsWith('.vue')) {
        const componentName = file.replace('.vue', '');
        const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
        const { props, docs } = parseProps(content);
        if (Object.keys(props).length > 0) {
            updateDemo(componentName, props, docs);
        }
    }
}
