import { describe, expect, it } from "vitest";
import GTextInput from "../packages/grad-vue/src/components/GTextInput.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GTextInput", () => {
    describe("Functional Tests", () => {
        it("renders with placeholder", async () => {
            const wrapper = mnt(GTextInput, {
                props: {
                    label: "Text Input",
                    placeholder: "Enter text",
                    modelValue: "",
                },
            });

            const input = wrapper.instance.getByRole("textbox", { name: "Text Input" });
            await expect.element(input).toHaveAttribute("placeholder", "Enter text");
        });

        it("renders with disabled state", async () => {
            const wrapper = mnt(GTextInput, {
                props: {
                    label: "Text Input",
                    disabled: true,
                    modelValue: "",
                },
            });

            const input = wrapper.instance.getByRole("textbox", { name: "Text Input" });
            await expect.element(input).toBeDisabled();
        });

        it("renders with prefix", async () => {
            const wrapper = mnt(GTextInput, {
                props: {
                    label: "Text Input",
                    prefix: "$",
                    modelValue: "",
                },
            });

            await expect.element(wrapper.instance.getByText("$")).toBeInTheDocument();
        });

        it("renders with suffix", async () => {
            const wrapper = mnt(GTextInput, {
                props: {
                    label: "Text Input",
                    suffix: "USD",
                    modelValue: "",
                },
            });

            await expect.element(wrapper.instance.getByText("USD")).toBeInTheDocument();
        });

        it("renders with both prefix and suffix", async () => {
            const wrapper = mnt(GTextInput, {
                props: {
                    label: "Text Input",
                    prefix: "$",
                    suffix: "USD",
                    modelValue: "",
                },
            });

            await expect.element(wrapper.instance.getByText("$")).toBeInTheDocument();
            await expect.element(wrapper.instance.getByText("USD")).toBeInTheDocument();
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
