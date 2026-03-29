import { describe, expect, it, vi } from "vitest";
import { ref, nextTick } from "vue";
import GCheckboxGroup from "../packages/grad-vue/src/components/GCheckboxGroup.vue";
import { mnt, testAccessibility } from "./test-utils";

const options = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C", value: "c", disabled: true },
    { label: "Option D", value: "d", hint: "A helpful hint" },
];

describe("GCheckboxGroup", () => {
    describe("Functional Tests", () => {
        it("renders all options", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: { label: "Pick one", options, modelValue: [] },
            });

            await expect.element(wrapper.instance.getByRole("checkbox", { name: "Option A" })).toBeInTheDocument();
            await expect.element(wrapper.instance.getByRole("checkbox", { name: "Option B" })).toBeInTheDocument();
            await expect.element(wrapper.instance.getByRole("checkbox", { name: "Option C" })).toBeInTheDocument();
        });

        it("checks options matching modelValue", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: { label: "Pick", options, modelValue: ["a", "b"] },
            });

            await expect.element(wrapper.instance.getByRole("checkbox", { name: "Option A" })).toBeChecked();
            await expect.element(wrapper.instance.getByRole("checkbox", { name: "Option B" })).toBeChecked();
            await expect.element(wrapper.instance.getByRole("checkbox", { name: "Option C" })).not.toBeChecked();
        });

        it("updates model when a checkbox is clicked", async () => {
            const model = ref<string[]>([]);
            const wrapper = mnt(GCheckboxGroup, {
                props: { label: "Pick", options },
                model,
            });

            await wrapper.instance.getByRole("checkbox", { name: "Option A" }).click();
            await nextTick();
            expect(model.value).toContain("a");
        });

        it("removes value from model when unchecked", async () => {
            const model = ref<string[]>(["a"]);
            const wrapper = mnt(GCheckboxGroup, {
                props: { label: "Pick", options },
                model,
            });

            await wrapper.instance.getByRole("checkbox", { name: "Option A" }).click();
            await nextTick();
            expect(model.value).not.toContain("a");
        });

        it("disables the correct option", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: { label: "Pick", options, modelValue: [] },
            });

            await expect.element(wrapper.instance.getByRole("checkbox", { name: "Option C" })).toBeDisabled();
            await expect.element(wrapper.instance.getByRole("checkbox", { name: "Option A" })).not.toBeDisabled();
        });

        it("emits change event on selection", async () => {
            const onChange = vi.fn();
            const model = ref<string[]>([]);
            const wrapper = mnt(GCheckboxGroup, {
                props: {
                    label: "Pick",
                    options,
                    onChange,
                },
                model,
            });

            await wrapper.instance.getByRole("checkbox", { name: "Option A" }).click();
            await nextTick();
            expect(onChange).toHaveBeenCalledWith(["a"]);
        });

        it("displays error messages", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: {
                    label: "Pick",
                    options,
                    modelValue: [],
                    errors: ["Please select at least one option"],
                },
            });

            await expect.element(wrapper.instance.getByText("Please select at least one option")).toBeInTheDocument();
        });

        it("renders hint text for options that have it", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: { label: "Pick", options, modelValue: [] },
            });

            await expect.element(wrapper.instance.getByText("A helpful hint")).toBeInTheDocument();
        });

        it("hint is outside the label element and referenced via aria-describedby", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: { label: "Pick", options, modelValue: [] },
            });

            const hintEl = wrapper.container.element().querySelector(".g-checkbox-group__hint") as HTMLElement;
            const hintId = hintEl.id;
            const inputD = wrapper.instance.getByRole("checkbox", { name: "Option D" }).element() as HTMLInputElement;
            expect(inputD.getAttribute("aria-describedby")).toContain(hintId);
        });

        it("radio mode allows only one selection", async () => {
            const model = ref<string[]>([]);
            const wrapper = mnt(GCheckboxGroup, {
                props: { label: "Pick one", options, radio: true },
                model,
            });

            await wrapper.instance.getByRole("radio", { name: "Option A" }).click();
            await nextTick();
            expect(model.value).toEqual(["a"]);

            await wrapper.instance.getByRole("radio", { name: "Option B" }).click();
            await nextTick();
            expect(model.value).toEqual(["b"]);
        });

        it("renders instructions when provided", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: {
                    label: "Pick",
                    options,
                    modelValue: [],
                    instructions: "Select all that apply",
                },
            });

            await expect.element(wrapper.instance.getByText("Select all that apply")).toBeInTheDocument();
        });

        it("uses a fieldset for multiple checkboxes", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: { label: "Pick", options, modelValue: [] },
            });

            const root = wrapper.container.element().firstElementChild as HTMLElement;
            expect(root.tagName.toLowerCase()).toBe("fieldset");
        });

        it("uses a div (no fieldset) for a single checkbox", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: {
                    label: "I agree",
                    options: [{ label: "Accept terms", value: "accept" }],
                    modelValue: [],
                },
            });

            const root = wrapper.container.element().firstElementChild as HTMLElement;
            expect(root.tagName.toLowerCase()).toBe("div");
        });

        it("sets aria-invalid and aria-errormessage on checkbox inputs when there are errors", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: {
                    label: "Pick",
                    options,
                    modelValue: [],
                    errors: ["Required"],
                },
            });

            const inputA = wrapper.instance.getByRole("checkbox", { name: "Option A" }).element() as HTMLInputElement;
            expect(inputA.getAttribute("aria-invalid")).toBe("true");
            expect(inputA.getAttribute("aria-errormessage")).toBeTruthy();
        });

        it("sets role=radiogroup with aria-invalid on the fieldset in radio mode with errors", async () => {
            const wrapper = mnt(GCheckboxGroup, {
                props: {
                    label: "Pick one",
                    options,
                    modelValue: [],
                    radio: true,
                    errors: ["Required"],
                },
            });

            const root = wrapper.container.element().firstElementChild as HTMLElement;
            expect(root.tagName.toLowerCase()).toBe("fieldset");
            expect(root.getAttribute("role")).toBe("radiogroup");
            expect(root.getAttribute("aria-invalid")).toBe("true");
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic options", async () => {
            await testAccessibility(GCheckboxGroup, {
                label: "Checkbox Group",
                options,
                modelValue: [],
            });
        });

        it("with required", async () => {
            await testAccessibility(GCheckboxGroup, {
                label: "Checkbox Group",
                options,
                modelValue: [],
                required: true,
            });
        });

        it("with instructions", async () => {
            await testAccessibility(GCheckboxGroup, {
                label: "Checkbox Group",
                options,
                modelValue: [],
                instructions: "Select all that apply",
            });
        });

        it("with errors", async () => {
            await testAccessibility(GCheckboxGroup, {
                label: "Checkbox Group",
                options,
                modelValue: [],
                errors: ["Please select at least one option"],
            });
        });

        it("with pre-selected values", async () => {
            await testAccessibility(GCheckboxGroup, {
                label: "Checkbox Group",
                options,
                modelValue: ["a"],
            });
        });

        it("in radio mode", async () => {
            await testAccessibility(GCheckboxGroup, {
                label: "Checkbox Group",
                options,
                modelValue: [],
                radio: true,
            });
        });

        it("single checkbox (no fieldset)", async () => {
            await testAccessibility(GCheckboxGroup, {
                label: "I agree",
                options: [{ label: "Accept terms and conditions", value: "accept" }],
                modelValue: [],
            });
        });

        it("single checkbox with error", async () => {
            await testAccessibility(GCheckboxGroup, {
                label: "I agree",
                options: [{ label: "Accept terms and conditions", value: "accept" }],
                modelValue: [],
                errors: ["You must accept the terms"],
            });
        });
    });
});
