import "@sa11y/vitest";
import { A11yCheckableContext } from "@sa11y/assert";
import { A11yConfig } from "@sa11y/common";

declare module "vitest" {
    interface Assertion {
        toBeAccessible(config?: A11yConfig): Promise<void>;
    }
    interface AsymmetricMatchersContaining {
        toBeAccessible(config?: A11yConfig): Promise<void>;
    }
}
