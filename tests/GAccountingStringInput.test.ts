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

        it("accepts input without dashes", async () => {
            const modelValue = ref("");
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                },
                model: modelValue,
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            await userEvent.type(input, "1234567890123456789");
            input.blur();

            expect(modelValue.value).toBe("1234567890123456789");
        });

        it("shows status message for incomplete CFOP", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "123456",
                },
            });

            const status = container.element().querySelector(".status-message");
            expect(status).toBeTruthy();
            expect(status!.textContent).toContain("more character");
            expect(status!.textContent).toContain("CFOP");
        });

        it("shows status message for complete CFOP", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "1234567890123456789",
                },
            });

            const status = container.element().querySelector(".status-message");
            expect(status).toBeTruthy();
            expect(status!.textContent).toContain("Complete CFOP format");
        });

        it("shows status message for incomplete CFOAP", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "12345678901234567890",
                },
            });

            const status = container.element().querySelector(".status-message");
            expect(status).toBeTruthy();
            expect(status!.textContent).toContain("more character");
            expect(status!.textContent).toContain("CFOAP");
        });

        it("shows status message for complete CFOAP", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "1234567890123456789012345",
                },
            });

            const status = container.element().querySelector(".status-message");
            expect(status).toBeTruthy();
            expect(status!.textContent).toContain("Complete CFOAP format");
        });

        it("shows status message for too many characters", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "12345678901234567890123456",
                },
            });

            const status = container.element().querySelector(".status-message");
            expect(status).toBeTruthy();
            expect(status!.textContent).toContain("too many");
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
                    error: "Server validation failed",
                    modelValue: "",
                },
            });

            expect(container.element().querySelector(".error-message")!.textContent).toContain("Server validation failed");
        });

        it("uses cfop format when specified", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    format: "cfop" as const,
                    modelValue: "1234567890123456789",
                },
            });

            const status = container.element().querySelector(".status-message");
            expect(status!.textContent).toContain("Complete CFOP format");
        });

        it("uses cfoap format when specified", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    format: "cfoap" as const,
                    modelValue: "1234567890123456789012345",
                },
            });

            const status = container.element().querySelector(".status-message");
            expect(status!.textContent).toContain("Complete CFOAP format");
        });

        it("supports alphanumeric characters", async () => {
            const modelValue = ref("");
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                },
                model: modelValue,
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            await userEvent.type(input, "1A2B3C7890123456789");
            input.blur();

            expect(modelValue.value).toBe("1A2B3C7890123456789");
        });

        it("strips special characters from model value", async () => {
            const modelValue = ref("");
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                },
                model: modelValue,
            });

            const input = container.element().querySelector("input")! as HTMLInputElement;
            await userEvent.type(input, "1@2#3$4");
            input.blur();

            // Special characters should be stripped
            expect(modelValue.value).toBe("1234");
        });

        it("has pattern attribute for HTML5 validation", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "",
                },
            });

            const input = container.element().querySelector("input")!;
            expect(input.hasAttribute("pattern")).toBe(true);
        });

        it("includes status message in aria-describedby", () => {
            const { container } = mnt(GAccountingStringInput, {
                props: {
                    label: "Accounting String",
                    modelValue: "123456",
                },
            });

            const input = container.element().querySelector("input")!;
            const describedBy = input.getAttribute("aria-describedby");
            expect(describedBy).toContain("status-");
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
                error: "Server validation failed",
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

        it("with status message", async () => {
            await testAccessibility(GAccountingStringInput, {
                label: "Accounting String",
                modelValue: "123456",
            });
        });

        it("with label and instructions and error state", async () => {
            await testAccessibility(GAccountingStringInput, {
                label: "Accounting String",
                instructions: "Enter a CFOP (19 chars) or CFOAP (25 chars) accounting string",
                error: "Server validation failed",
            });
        });
    });
});
