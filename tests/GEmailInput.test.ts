import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import GEmailInput from "../src/components/GEmailInput.vue";
import { testAccessibility } from "./test-utils";

describe("GEmailInput", () => {
    describe("Functional Tests", () => {
        it("has email input type", () => {
            const wrapper = mount(GEmailInput, {
                props: {
                    label: "Email",
                    modelValue: "",
                },
            });

            const input = wrapper.find("input");
            expect(input.attributes("type")).toBe("email");
        });

        it("renders with placeholder", () => {
            const wrapper = mount(GEmailInput, {
                props: {
                    label: "Email",
                    placeholder: "user@example.com",
                    modelValue: "",
                },
            });

            const input = wrapper.find("input");
            expect(input.attributes("placeholder")).toBe("user@example.com");
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic props", async () => {
            await testAccessibility(GEmailInput, {
                label: "Email",
                modelValue: "",
            });
        });

        it("passes accessibility tests with error", async () => {
            await testAccessibility(GEmailInput, {
                label: "Email",
                error: "Invalid email address",
                modelValue: "",
            });
        });
    });
});
