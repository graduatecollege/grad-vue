import '../packages/grad-vue/src/css/main.css';
import { beforeEach } from "vitest";
import { mnt } from "./test-utils";

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