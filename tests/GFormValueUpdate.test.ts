import { describe, expect, it } from "vitest";
import { h, nextTick, ref } from "vue";
import GForm from "../packages/grad-vue/src/components/GForm.vue";
import GTextInput from "../packages/grad-vue/src/components/GTextInput.vue";
import { mnt } from "./test-utils";

describe("GForm Value Updates", () => {
    it("updates form.values when typing in GTextInput", async () => {
        const modelValue = ref({});
        
        const wrapper = mnt(GForm, {
            props: {
                modelValue: modelValue.value,
                "onUpdate:modelValue": (val: any) => {
                    modelValue.value = val;
                },
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
        
        // Type in the input
        await input.fill("test@example.com");
        
        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 150));
        await nextTick();
        
        // Check that the input value updated
        await expect.element(input).toHaveValue("test@example.com");
        
        // Check that modelValue updated
        await expect.poll(() => {
            return modelValue.value.email;
        }).toBe("test@example.com");
    });

    it("updates v-model when typing in multiple GTextInputs", async () => {
        const modelValue = ref({});
        
        const wrapper = mnt(GForm, {
            props: {
                modelValue: modelValue.value,
                "onUpdate:modelValue": (val: any) => {
                    modelValue.value = val;
                },
            },
            slots: {
                default: () => [
                    h(GTextInput, {
                        name: "firstName",
                        label: "First Name",
                    }),
                    h(GTextInput, {
                        name: "lastName",
                        label: "Last Name",
                    }),
                ],
            },
        });

        const firstNameInput = wrapper.instance.getByLabelText("First Name");
        const lastNameInput = wrapper.instance.getByLabelText("Last Name");
        
        // Type in the inputs
        await firstNameInput.fill("John");
        await lastNameInput.fill("Doe");
        
        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 150));
        await nextTick();
        
        // Check that modelValue updated
        await expect.poll(() => {
            return modelValue.value.firstName;
        }).toBe("John");
        
        await expect.poll(() => {
            return modelValue.value.lastName;
        }).toBe("Doe");
    });
});
