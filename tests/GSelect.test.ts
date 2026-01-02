import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import GSelect from "../src/components/GSelect.vue";
import { testAccessibility } from "./test-utils";

describe("GSelect", () => {
    const options = ["Option 1", "Option 2", "Option 3"];

    describe("Functional Tests", () => {
        it("renders with label and options", () => {
            const wrapper = mount(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    modelValue: null,
                },
            });

            expect(wrapper.text()).toContain("Select option");
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            await testAccessibility(GSelect, {
                label: "Select option",
                options,
                modelValue: null,
            });
        });

        it("with selected value", async () => {
            await testAccessibility(GSelect, {
                label: "Select option",
                options,
                modelValue: "Option 2",
            });
        });

        it("with object options", async () => {
            const objectOptions = [
                { label: "First", value: 1 },
                { label: "Second", value: 2 },
            ];

            await testAccessibility(GSelect, {
                label: "Select option",
                options: objectOptions,
                modelValue: 1,
            });
        });

        it("with searchable enabled", async () => {
            await testAccessibility(GSelect, {
                label: "Select option",
                options,
                modelValue: null,
                searchable: true,
            });
        });
    });
});
