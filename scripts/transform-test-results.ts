#!/usr/bin/env node
/**
 * Transform Vitest JSON results into a component-grouped format for the demo page
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { type JsonTestResults } from "vitest/reporters";

interface Result {
    component: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    status: string;
    tests: {
        title: string;
        status:
            | "passed"
            | "failed"
            | "skipped"
            | "pending"
            | "todo"
            | "disabled";
        ancestors: string[];
    }[];
}

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
    const resultsPath = resolve(__dirname, '../test-results/results.json');
    const outputPath = resolve(__dirname, '../test-results/component-results.json');

    const results: JsonTestResults = JSON.parse(readFileSync(resultsPath, 'utf-8'));

    // Group tests by component
    const componentResults: Record<string, Result> = {};

    for (let testFile of results.testResults) {
        if (!testFile) {
            continue;
        }

        const totalTests = testFile.assertionResults.length;

        if (totalTests === 0) {
            continue;
        }

        const componentName = testFile.assertionResults[0].ancestorTitles[0];

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
            tests: testFile.assertionResults.map(test => ({
                title: test.title,
                status: test.status,
                ancestors: test.ancestorTitles.slice(1)
            })),
        };
    }

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
    console.error('Error transforming test results:', error);
    process.exit(1);
}
