import { describe, it, expect } from "vitest";
import GEmailInput from "../src/components/GEmailInput.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GEmailInput", () => {
    describe("Functional Tests", () => {
        it("has email input type", async () => {
            const wrapper = mnt(GEmailInput, {
                props: {
                    label: "Email",
                    modelValue: "",
                },
            });

            const input = wrapper.instance.getByRole("textbox", { name: "Email" });
            await expect.element(input).toHaveAttribute("type", "email");
        });

        it("renders with placeholder", async () => {
            const wrapper = mnt(GEmailInput, {
                props: {
                    label: "Email",
                    placeholder: "user@example.com",
                    modelValue: "",
                },
            });

            const input = wrapper.instance.getByRole("textbox", { name: "Email" });
            await expect.element(input).toHaveAttribute("placeholder", "user@example.com");
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
