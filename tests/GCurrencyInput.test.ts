import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GCurrencyInput from "../src/components/GCurrencyInput.vue";
import { testAccessibility } from "./test-utils";

describe("GCurrencyInput", () => {
    describe("Functional Tests", () => {
        it("renders with dollar sign prefix", () => {
            const wrapper = mount(GCurrencyInput, {
                props: {
                    label: "Amount",
                    modelValue: "",
                },
            });

            const prefix = wrapper.find(".g-text-input-prefix");
            expect(prefix.exists()).toBe(true);
            expect(prefix.text()).toBe("$");
        });

        it("has number input type attributes", () => {
            const wrapper = mount(GCurrencyInput, {
                props: {
                    label: "Amount",
                    modelValue: "",
                },
            });

            const input = wrapper.find("input");
            expect(input.attributes("type")).toBe("number");
            expect(input.attributes("step")).toBe("0.01");
            expect(input.attributes("min")).toBe("0");
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
    });
});
