import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import GAccountingStringInput from "../src/components/GAccountingStringInput.vue";
import { testAccessibility } from "./test-utils";

describe("GAccountingStringInput", () => {
    describe("Functional Tests", () => {
        it("renders with label and placeholder", () => {
            const wrapper = mount(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    placeholder: "Enter CFOP or CFOAP",
                    modelValue: "",
                },
            });

            const input = wrapper.find("input");
            expect(input.attributes("placeholder")).toBe("Enter CFOP or CFOAP");
            expect(wrapper.find("label").text()).toBe("Accounting String");
        });

        it("renders with disabled state", () => {
            const wrapper = mount(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    disabled: true,
                    modelValue: "",
                },
            });

            const input = wrapper.find("input");
            expect(input.attributes("disabled")).toBeDefined();
        });

        it("formats CFOP value with dashes on display", () => {
            const wrapper = mount(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "1234567890123456789",
                },
            });

            const input = wrapper.find("input");
            // Should display with dashes
            expect(input.element.value).toBe("1-234567-890123-456789");
        });

        it("formats CFOAP value with dashes on display", () => {
            const wrapper = mount(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "1234567890123456789012345",
                },
            });

            const input = wrapper.find("input");
            // Should display with dashes
            expect(input.element.value).toBe("1-234567-890123-456789-012345");
        });

        it("strips dashes from model value", async () => {
            let updatedValue = "";
            const wrapper = mount(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "",
                    "onUpdate:modelValue": (value: string) => {
                        updatedValue = value;
                    },
                },
            });

            const input = wrapper.find("input");
            // Type with dashes
            await input.setValue("1-234567-890123-456789");
            await input.trigger("blur");

            // Model should have dashes stripped
            expect(updatedValue).toBe("1234567890123456789");
        });

        it("emits change event on blur", async () => {
            const changes: any[] = [];
            const wrapper = mount(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "",
                    "onUpdate:modelValue": () => {},
                    onChange: (event: any) => {
                        changes.push(event);
                    },
                },
            });

            const input = wrapper.find("input");
            await input.setValue("1234567890123456789");
            await input.trigger("blur");

            expect(changes.length).toBeGreaterThan(0);
            expect(changes[changes.length - 1].to).toBe("1234567890123456789");
        });

        it("displays error message", () => {
            const wrapper = mount(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    error: "Invalid accounting string",
                    modelValue: "",
                },
            });

            expect(wrapper.find(".error-message").text()).toContain("Invalid accounting string");
        });

        it("uses cfop format when specified", () => {
            const wrapper = mount(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    format: "cfop" as const,
                    modelValue: "1234567890123456789",
                },
            });

            const input = wrapper.find("input");
            // Should format as CFOP
            expect(input.element.value).toBe("1-234567-890123-456789");
        });

        it("uses cfoap format when specified", () => {
            const wrapper = mount(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    format: "cfoap" as const,
                    modelValue: "1234567890123456789012345",
                },
            });

            const input = wrapper.find("input");
            // Should format as CFOAP
            expect(input.element.value).toBe("1-234567-890123-456789-012345");
        });

        it("supports alphanumeric characters", () => {
            const wrapper = mount(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "1A2B3C7890123456789",
                },
            });

            const input = wrapper.find("input");
            // Should format with alphanumeric
            expect(input.element.value).toBe("1-A2B3C7-890123-456789");
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            await testAccessibility(GAccountingStringInput, {
                label: "Accounting String",
                placeholder: "Enter CFOP or CFOAP",
                modelValue: "",
            });
        });

        it("with aria-label", async () => {
            await testAccessibility(GAccountingStringInput, {
                label: "Accounting String",
                placeholder: "Enter CFOP or CFOAP",
                modelValue: "",
                "aria-label": "Accounting string input",
            });
        });

        it("with error state", async () => {
            await testAccessibility(GAccountingStringInput, {
                label: "Accounting String",
                error: "Invalid accounting string",
                modelValue: "",
                "aria-label": "Accounting string input",
            });
        });

        it("with label and instructions", async () => {
            await testAccessibility(GAccountingStringInput, {
                label: "Accounting String",
                instructions: "Enter a CFOP (19 chars) or CFOAP (25 chars) accounting string",
                placeholder: "Enter CFOP or CFOAP",
            });
        });

        it("with label and instructions and error state", async () => {
            await testAccessibility(GAccountingStringInput, {
                label: "Accounting String",
                instructions: "Enter a CFOP (19 chars) or CFOAP (25 chars) accounting string",
                error: "Invalid format",
            });
        });
    });
});
