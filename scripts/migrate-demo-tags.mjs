/**
 * One-time migration script: converts @demo JSDoc tags inside Props to
 * trailing // @demo line comments.
 *
 * Before:
 *   /**
 *    * Description
 *    * @demo [value]
 *    *\/
 *   propName?: type;
 *
 * After (single-line description):
 *   /** Description *\/
 *   propName?: type; // @demo [value]
 *
 * After (multi-line description):
 *   /**
 *    * Short
 *    *
 *    * Long
 *    *\/
 *   propName?: type; // @demo [value]
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse as parseSFC } from '@vue/compiler-sfc';
import { fileURLToPath } from 'node:url';

const packagesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'packages');

/**
 * Given the full source of a <script setup> block, transform all
 * JSDoc @demo tags on Props members to trailing // @demo comments.
 */
function transformSetupScript(setupContent) {
    // The key constraint: description lines each look like "\n    * text"
    // where * is NOT followed by /  (that would be the closing */).
    // We use \*(?!\/) to prevent crossing a */ boundary.
    //
    // Pattern groups:
    //   1. Indentation (spaces/tabs before /**)
    //   2. Zero or more description lines between /** and * @demo
    //   3. Demo value (possibly empty)
    //   4. Property declaration line (up to ;)
    const pattern = /([ \t]+)\/\*\*((?:\n[ \t]+ \*(?!\/)[^\n]*)*)\n[ \t]+ \* @demo[ \t]*(.*?)\n[ \t]+ \*\/\n(\1\S[^\n]*;)/g;

    return setupContent.replace(pattern, (_match, indent, descBlock, demoValue, propLine) => {
        // descBlock is zero or more lines like "\n     * text" or "\n     *"
        // Split and strip the " * " prefix from each line.
        const descLines = descBlock === ''
            ? []
            : descBlock
                .split('\n')
                .filter((_, i) => i > 0) // remove empty element before first \n
                .map((l) => l.replace(/^[ \t]+ \* ?/, ''))
                .map((l) => l.trimEnd());

        // Remove trailing empty lines
        while (descLines.length > 0 && descLines[descLines.length - 1] === '') {
            descLines.pop();
        }

        const trailingComment = demoValue.trim()
            ? ` // @demo ${demoValue.trim()}`
            : ' // @demo';

        if (descLines.length === 0) {
            // No description — just drop the JSDoc block entirely
            return `${propLine}${trailingComment}`;
        }

        if (descLines.length === 1) {
            // Collapse to single-line JSDoc
            return `${indent}/** ${descLines[0]} */\n${propLine}${trailingComment}`;
        }

        // Multi-line JSDoc — reconstruct without the @demo line
        const newJsdoc = [
            `${indent}/**`,
            ...descLines.map((l) => (l === '' ? `${indent} *` : `${indent} * ${l}`)),
            `${indent} */`,
        ].join('\n');

        return `${newJsdoc}\n${propLine}${trailingComment}`;
    });
}

function transformVueFile(filePath) {
    const original = fs.readFileSync(filePath, 'utf8');
    const { descriptor } = parseSFC(original);

    if (!descriptor.scriptSetup?.content) return false;
    if (!/@demo/.test(descriptor.scriptSetup.content)) return false;

    const setup = descriptor.scriptSetup;
    const transformed = transformSetupScript(setup.content);
    if (transformed === setup.content) return false;

    // Replace only the script setup block content in the original file
    const newContent =
        original.slice(0, setup.loc.start.offset) +
        transformed +
        original.slice(setup.loc.end.offset);

    fs.writeFileSync(filePath, newContent);
    return true;
}

// Discover and transform all .vue files in all packages
const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

for (const pkg of packages) {
    const componentsDir = path.join(packagesDir, pkg, 'src', 'components');
    if (!fs.existsSync(componentsDir)) continue;

    for (const file of fs.readdirSync(componentsDir)) {
        if (!file.endsWith('.vue')) continue;
        const filePath = path.join(componentsDir, file);
        if (transformVueFile(filePath)) {
            console.log(`Updated: ${filePath}`);
        }
    }
}

console.log('Migration complete.');
