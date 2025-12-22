import { describe, it } from "vitest";
import GSidebarMenu from "../src/components/GSidebarMenu.vue";
import { testAccessibility } from "./test-utils";

describe("GSidebarMenu", () => {
    const menuItems = [
        { label: "Home", url: "/" },
        { label: "About", url: "/about" },
    ];

    describe("Functional Tests", () => {
        it("renders with default props", () => {
            // Basic rendering test
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with menu items", async () => {
            await testAccessibility(GSidebarMenu, {
                items: menuItems,
            });
        });

        it("passes accessibility tests with nested menu items", async () => {
            const nestedItems = [
                {
                    label: "Section",
                    children: [
                        { label: "Item 1", url: "/1" },
                        { label: "Item 2", url: "/2" },
                    ],
                },
            ];

            await testAccessibility(GSidebarMenu, {
                items: nestedItems,
            });
        });
    });
});
