import { describe, expect, it } from "vitest";
import GSubmitButton from "../packages/grad-vue/src/components/GSubmitButton.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GSubmitButton", () => {
    describe("Functional Tests", () => {
        it("renders a submit button", async () => {
            const wrapper = mnt(GSubmitButton, {
                props: {},
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
            await expect.element(wrapper.instance).toHaveAttribute("type", "submit");
            await expect.element(wrapper.instance).toHaveTextContent("Submit");
        });

        it("can be disabled", async () => {
            const wrapper = mnt(GSubmitButton, {
                props: {
                    disabled: true,
                },
            });

            await expect.element(wrapper.instance).toBeDisabled();
        });

        it("shows custom text via slot", async () => {
            const wrapper = mnt(GSubmitButton, {
                slots: {
                    default: () => "Save Changes",
                },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
            await expect.element(wrapper.instance).toHaveTextContent("Save Changes");
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            await testAccessibility(GSubmitButton, {});
        });

        it("when disabled", async () => {
            await testAccessibility(GSubmitButton, {
                disabled: true,
            });
        });
    });
});
