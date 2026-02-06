import { describe, expect, it } from "vitest";
import { ref } from "vue";
import GAccountingStringInput from "../src/components/GAccountingStringInput.vue";
import { mnt, testAccessibility } from "./test-utils";
import { userEvent } from "vitest/browser";

describe("GAccountingStringInput", () => {
    describe("Functional Tests", () => {
        it("renders with label and placeholder", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    placeholder: "Enter CFOP or CFOAP",
                    modelValue: "",
                },
            });

            const input = container.element().querySelector("input")!;
            expect(input.getAttribute("placeholder")).toBe("Enter CFOP or CFOAP");
            expect(container.element().querySelector("label")!.textContent).toBe("Accounting String");
        });

        it("renders with disabled state", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    disabled: true,
                    modelValue: "",
                },
            });

            const input = container.element().querySelector("input")!;
            expect(input.hasAttribute("disabled")).toBe(true);
        });

        it("formats CFOP value with dashes on display", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "1234567890123456789",
                },
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            // Should display with dashes
            expect(input.value).toBe("1-234567-890123-456789");
        });

        it("formats CFOAP value with dashes on display", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "1234567890123456789012345",
                },
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            // Should display with dashes
            expect(input.value).toBe("1-234567-890123-456789-012345");
        });

        it("strips dashes from model value", async () => {
            const modelValue = ref("");
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                },
                model: modelValue,
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            // Type with dashes
            await userEvent.type(input, "1-234567-890123-456789");
            input.blur();

            // Model should have dashes stripped
            expect(modelValue.value).toBe("1234567890123456789");
        });

        it("emits change event on blur", async () => {
            let emittedValue = "";
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "",
                    onChange: (event: any) => {
                        emittedValue = event.to;
                    },
                },
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            await userEvent.type(input, "1234567890123456789");
            input.blur();

            expect(emittedValue).toBe("1234567890123456789");
        });

        it("displays error message", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    error: "Invalid accounting string",
                    modelValue: "",
                },
            });

            expect(container.element().querySelector(".error-message")!.textContent).toContain("Invalid accounting string");
        });

        it("uses cfop format when specified", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    format: "cfop" as const,
                    modelValue: "1234567890123456789",
                },
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            // Should format as CFOP
            expect(input.value).toBe("1-234567-890123-456789");
        });

        it("uses cfoap format when specified", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    format: "cfoap" as const,
                    modelValue: "1234567890123456789012345",
                },
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            // Should format as CFOAP
            expect(input.value).toBe("1-234567-890123-456789-012345");
        });

        it("supports alphanumeric characters", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "1A2B3C7890123456789",
                },
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            // Should format with alphanumeric
            expect(input.value).toBe("1-A2B3C7-890123-456789");
        });

        it("filters out special characters", async () => {
            const modelValue = ref("");
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                },
                model: modelValue,
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            // Type with special characters
            await userEvent.type(input, "1@2#3$4%5^6&7*8(9)0!1+2=3");
            input.blur();

            // Special characters should be filtered out
            expect(modelValue.value).toBe("1234567890123");
        });

        it("handles paste with special characters", async () => {
            const modelValue = ref("");
            const { container, vm } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                },
                model: modelValue,
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            input.focus();
            
            // Simulate paste event with special characters
            const pasteEvent = new ClipboardEvent("paste", {
                clipboardData: new DataTransfer(),
            });
            (pasteEvent.clipboardData as DataTransfer).setData("text", "1@2#3-4$5%6^7&8*9(0)1!2+3=4");
            input.dispatchEvent(pasteEvent);
            await vm.$nextTick();

            // Special characters should be filtered out, only alphanumeric and dashes remain
            expect(input.value).toBe("1-234567-890123-4");
        });

        it("formats input correctly as user types", async () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "",
                },
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            
            // Type first character
            await userEvent.type(input, "1");
            expect(input.value).toBe("1");
            
            // Type more to reach first dash
            await userEvent.type(input, "234567");
            expect(input.value).toBe("1-234567");
            
            // Continue typing to add second segment
            await userEvent.type(input, "890123");
            expect(input.value).toBe("1-234567-890123");
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
