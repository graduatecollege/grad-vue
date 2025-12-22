#!/usr/bin/env node
/**
 * Transform Vitest JSON results into a component-grouped format for the demo page
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
    const resultsPath = resolve(__dirname, '../test-results/results.json');
    const outputPath = resolve(__dirname, '../test-results/component-results.json');

    const results = JSON.parse(readFileSync(resultsPath, 'utf-8'));

    // Group tests by component
    const componentResults = {};

    results.testResults.forEach((testFile) => {
        const fileName = testFile.name.split('/').pop().replace('.test.ts', '');
        const componentName = fileName;

        const totalTests = testFile.assertionResults.length;
        const passedTests = testFile.assertionResults.filter(t => t.status === 'passed').length;
        const failedTests = testFile.assertionResults.filter(t => t.status === 'failed').length;
        const skippedTests = testFile.assertionResults.filter(t => t.status === 'skipped' || t.status === 'pending' || t.status === 'todo').length;

        componentResults[componentName] = {
            component: componentName,
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            skipped: skippedTests,
            status: failedTests > 0 ? 'failed' : (skippedTests === totalTests ? 'skipped' : 'passed'),
            duration: testFile.endTime - testFile.startTime,
            tests: testFile.assertionResults.map(test => ({
                title: test.title,
                status: test.status,
                duration: test.duration || 0,
            })),
        };
    });

    const summary = {
        totalComponents: Object.keys(componentResults).length,
        totalTests: results.numTotalTests,
        passedTests: results.numPassedTests,
        failedTests: results.numFailedTests,
        skippedTests: results.numPendingTests + results.numTodoTests,
        components: componentResults,
    };

    writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`✓ Component test results written to ${outputPath}`);
    console.log(`  ${summary.totalTests} tests across ${summary.totalComponents} components`);
    console.log(`  ${summary.passedTests} passed, ${summary.failedTests} failed, ${summary.skippedTests} skipped`);
} catch (error) {
    console.error('Error transforming test results:', error.message);
    process.exit(1);
}
