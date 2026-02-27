import { describe, expect, it } from "vitest";
import { h } from "vue";
import GForm from "../packages/grad-vue/src/components/GForm.vue";
import GTextInput from "../packages/grad-vue/src/components/GTextInput.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GForm", () => {
    describe("Functional Tests", () => {
        it("renders a form element", async () => {
            const wrapper = mnt(GForm, {
                props: {
                    modelValue: {},
                },
            });

            await expect.element(wrapper.instance).toBeInTheDocument();
            await expect.element(wrapper.instance).toHaveAttribute("novalidate");
        });

        it("renders with child inputs", async () => {
            const wrapper = mnt(GForm, {
                props: {
                    modelValue: {},
                },
                slots: {
                    default: () => [
                        h(GTextInput, {
                            name: "email",
                            label: "Email",
                        }),
                    ],
                },
            });

            const input = wrapper.instance.getByLabelText("Email");
            await expect.element(input).toBeInTheDocument();
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            await testAccessibility(
                GForm,
                {
                    modelValue: {},
                },
                {
                    default: () => [
                        h(GTextInput, {
                            name: "email",
                            label: "Email",
                        }),
                    ],
                },
            );
        });
    });
});
