export interface ComponentTestResult {
    title: string;
    status: "passed" | "failed" | "skipped" | "pending" | "todo" | "disabled";
    ancestors: string[];
}

export interface ComponentResult {
    component: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    status: string;
    tests: ComponentTestResult[];
}

export interface SummaryResult {
    totalComponents: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    components: Record<string, ComponentResult>;
}