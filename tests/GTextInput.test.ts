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

        it("renders with prefix", () => {
            const wrapper = mount(GTextInput, {
                props: {
                    label: "Text Input",
                    prefix: "$",
                    modelValue: "",
                },
            });

            const prefix = wrapper.find(".g-text-input-prefix");
            expect(prefix.exists()).toBe(true);
            expect(prefix.text()).toBe("$");
        });

        it("renders with suffix", () => {
            const wrapper = mount(GTextInput, {
                props: {
                    label: "Text Input",
                    suffix: "USD",
                    modelValue: "",
                },
            });

            const suffix = wrapper.find(".g-text-input-suffix");
            expect(suffix.exists()).toBe(true);
            expect(suffix.text()).toBe("USD");
        });

        it("renders with both prefix and suffix", () => {
            const wrapper = mount(GTextInput, {
                props: {
                    label: "Text Input",
                    prefix: "$",
                    suffix: "USD",
                    modelValue: "",
                },
            });

            const prefix = wrapper.find(".g-text-input-prefix");
            const suffix = wrapper.find(".g-text-input-suffix");
            expect(prefix.exists()).toBe(true);
            expect(prefix.text()).toBe("$");
            expect(suffix.exists()).toBe(true);
            expect(suffix.text()).toBe("USD");
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

        it("with prefix", async () => {
            await testAccessibility(GTextInput, {
                label: "Text Input",
                prefix: "$",
                modelValue: "",
            });
        });

        it("with suffix", async () => {
            await testAccessibility(GTextInput, {
                label: "Text Input",
                suffix: "USD",
                modelValue: "",
            });
        });

        it("with prefix and suffix", async () => {
            await testAccessibility(GTextInput, {
                label: "Text Input",
                prefix: "$",
                suffix: "USD",
                modelValue: "",
            });
        });
    });
});
