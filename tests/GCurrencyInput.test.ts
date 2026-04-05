import { describe, it, expect } from "vitest";
import GCurrencyInput from "../packages/grad-vue/src/components/GCurrencyInput.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GCurrencyInput", () => {
    describe("Functional Tests", () => {
        it("renders with dollar sign prefix", async () => {
            const wrapper = mnt(GCurrencyInput, {
                props: {
                    label: "Amount",
                    modelValue: "",
                },
            });

            await expect.element(wrapper.instance.getByText("$")).toBeInTheDocument();
        });

        it("has number input type attributes", async () => {
            const wrapper = mnt(GCurrencyInput, {
                props: {
                    label: "Amount",
                    modelValue: "",
                },
            });

            const input = wrapper.instance.getByRole("spinbutton", { name: "Amount" });
            await expect.element(input).toHaveAttribute("type", "number");
            await expect.element(input).toHaveAttribute("step", "0.01");
            await expect.element(input).toHaveAttribute("min", "0");
        });

        it("sets required when required", async () => {
            const wrapper = mnt(GCurrencyInput, {
                props: {
                    label: "Amount",
                    required: true,
                    modelValue: "",
                },
            });

            const input = wrapper.instance.getByRole("spinbutton", { name: "Amount" });
            await expect.element(input).toHaveAttribute("required");
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic props", async () => {
            await testAccessibility(GCurrencyInput, {
                label: "Amount",
                modelValue: "",
            });
        });

        it("passes accessibility tests with error", async () => {
            await testAccessibility(GCurrencyInput, {
                label: "Amount",
                error: "Invalid amount",
                modelValue: "",
            });
        });

        it("passes accessibility tests with required", async () => {
            await testAccessibility(GCurrencyInput, {
                label: "Amount",
                required: true,
                modelValue: "",
            });
        });
    });
});
