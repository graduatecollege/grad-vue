import '../packages/grad-vue/src/css/main.css';
import { beforeEach, expect } from "vitest";
import { mnt } from "./test-utils";
import { Locator } from "vitest/browser";

export const mounts = [] as ( () => void)[];

beforeEach(() => {
    mounts.forEach(m => m());
    mounts.length = 0;

    // Without this the tests tend to be fragile, because exceptions
    // in one test may prevent cleanup and then affect other tests.
    document.body.innerHTML = "";
});

const style = document.createElement('style');
style.innerHTML = `
  *,
  *:before,
  *:after {
    transition-property: none !important;
    animation: none !important;
    transition: none !important;
  }
`;
document.head.appendChild(style);


expect.extend({
    async toBeInView(locator: Locator) {
        let pass: boolean;
        let error: any;

        try {
            // We use 0.98 to account for sub-pixel/rounding issues
            // common in popovers near viewport edges
            await expect.element(locator).toBeInViewport({ ratio: 0.98 });
            pass = true;
        } catch (e: any) {
            pass = false;
            error = e;
        }

        return {
            pass,
            message: () =>
                pass
                    ? `Expected element NOT to be in viewport, but it was.`
                    : `Expected element to be in viewport (ratio > 0.98).\n${error?.message || ''}`,
        };
    },
});
import '@vitest/expect'; // Important: must import to allow augmentation

interface CustomMatchers<R = unknown> {
    toBeInView(): Promise<R>;
}

declare module '@vitest/expect' {
    interface Assertion<T = any> extends CustomMatchers<T> {}
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}