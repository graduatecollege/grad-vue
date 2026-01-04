import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GHamburgerMenu from "../src/components/GHamburgerMenu.vue";
import { testAccessibility } from "./test-utils";

describe("GHamburgerMenu", () => {
    describe("Accessibility Tests", () => {
        it("passes accessibility tests with default content", async () => {
            await testAccessibility(
                GHamburgerMenu,
                { label: "Hamburger Menu" },
                { default: "<p>Example content</p>" },
            );
        });
    });
});
