import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import GTextInput from "../src/components/GTextInput.vue";
import { testAccessibility } from "./test-utils";

describe("GTextInput", () => {
    describe("Functional Tests", () => {
        it("renders with placeholder", () => {
            const wrapper = mount(GTextInput, {
                props: {
                    label: "Text Input",
                    placeholder: "Enter text",
                    modelValue: "",
                },
            });

            const input = wrapper.find("input");
            expect(input.attributes("placeholder")).toBe("Enter text");
        });

        it("renders with disabled state", () => {
            const wrapper = mount(GTextInput, {
                props: {
                    label: "Text Input",
                    disabled: true,
                    modelValue: "",
                },
            });

            const input = wrapper.find("input");
            expect(input.attributes("disabled")).toBeDefined();
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            await testAccessibility(GTextInput, {
                label: "Text Input",
                placeholder: "Enter text",
                modelValue: "",
            });
        });

        it("with aria-label", async () => {
            await testAccessibility(GTextInput, {
                label: "Text Input",
                placeholder: "Enter text",
                modelValue: "",
                "aria-label": "Text input field",
            });
        });

        it("with error state", async () => {
            await testAccessibility(GTextInput, {
                label: "Text Input",
                error: "This field is required",
                modelValue: "",
                "aria-label": "Text input field",
            });
        });

        it("with label", async () => {
            await testAccessibility(GTextInput, {
                label: "Text Input",
                placeholder: "Enter text",
                modelValue: "",
            });
        });

        it("with label and instructions", async () => {
            await testAccessibility(GTextInput, {
                label: "Text Input",
                instructions: "Enter text here",
                placeholder: "Enter text",
            });
        });

        it("with label and instructions and error state", async () => {
            await testAccessibility(GTextInput, {
                label: "Text Input",
                instructions: "Enter text here",
                error: "This field has an error",
            });
        });
    });
});
