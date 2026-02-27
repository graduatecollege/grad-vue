import { describe, expect, it } from "vitest";
import { h, ref, computed } from "vue";
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

        it("provides slot props for form state", async () => {
            const slotProps = ref<any>(null);
            
            const wrapper = mnt(GForm, {
                props: {
                    modelValue: {},
                },
                slots: {
                    default: (props: any) => {
                        slotProps.value = props;
                        return h(GTextInput, {
                            name: "email",
                            label: "Email",
                        });
                    },
                },
            });

            await expect.poll(() => slotProps.value).toBeTruthy();
            await expect.poll(() => slotProps.value?.isSubmitting).toBe(false);
            await expect.poll(() => slotProps.value?.hasErrors).toBe(false);
            await expect.poll(() => typeof slotProps.value?.values).toBe("object");
            await expect.poll(() => typeof slotProps.value?.errors).toBe("object");
        });

        it("supports multiple errors per field", async () => {
            const fieldErrors = ref<string[]>(["Error 1", "Error 2", "Error 3"]);
            
            const wrapper = mnt(GForm, {
                props: {
                    modelValue: {},
                },
                slots: {
                    default: () => [
                        h(GTextInput, {
                            name: "email",
                            label: "Email",
                            errors: fieldErrors.value,
                        }),
                    ],
                },
            });

            // All errors should be displayed
            await expect.element(wrapper.instance.getByText("Error 1")).toBeInTheDocument();
            await expect.element(wrapper.instance.getByText("Error 2")).toBeInTheDocument();
            await expect.element(wrapper.instance.getByText("Error 3")).toBeInTheDocument();
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
