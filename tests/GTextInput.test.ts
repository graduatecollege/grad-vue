import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GTextInput from "../src/components/GTextInput.vue";
import { testAccessibility } from "./test-utils";

describe("GTextInput", () => {
    describe("Functional Tests", () => {
        it("renders with placeholder", () => {
            const wrapper = mount(GTextInput, {
                props: {
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
                    disabled: true,
                    modelValue: "",
                },
            });

            const input = wrapper.find("input");
            expect(input.attributes("disabled")).toBeDefined();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic props", async () => {
            await testAccessibility(GTextInput, {
                placeholder: "Enter text",
                modelValue: "",
            });
        });

        it("passes accessibility tests with aria-label", async () => {
            await testAccessibility(
                GTextInput,
                {
                    placeholder: "Enter text",
                    modelValue: "",
                    "aria-label": "Text input field",
                }
            );
        });

        it("passes accessibility tests with error state", async () => {
            await testAccessibility(GTextInput, {
                error: "This field is required",
                modelValue: "",
            });
        });
    });
});
