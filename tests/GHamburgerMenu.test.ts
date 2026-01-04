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

    it("uses baseId for aria attributes", () => {
        const wrapper = mount(GHamburgerMenu, {
            props: {
                baseId: "test-id",
                open: true,
            },
        });
        const button = wrapper.find("button");
        expect(button.attributes("id")).toBe("test-id-hamburger");
        expect(button.attributes("aria-controls")).toBe("test-id-sidebar");
        expect(button.attributes("aria-expanded")).toBe("true");
    });
});
