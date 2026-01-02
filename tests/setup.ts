import '../src/css/main.css';
import { beforeEach } from "vitest";

beforeEach(() => {
    // Without this the tests tend to be fragile, because exceptions
    // in one test may prevent cleanup and then affect other tests.
    document.body.innerHTML = "";
});