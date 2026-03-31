import { describe, expect, it, vi } from "vitest";
import { ref, nextTick } from "vue";
import GMultiSelect from "../packages/grad-vue/src/components/GMultiSelect.vue";
import { mnt, testAccessibility } from "./test-utils";
import { userEvent } from "vitest/browser";

const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
const objectOptions = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
];

describe("GMultiSelect", () => {
    describe("Functional Tests", () => {
        it("renders with label and options", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick fruits", options, modelValue: [] },
            });
            await expect.element(container.getByText("Pick fruits")).toBeVisible();
        });

        it("opens listbox when input is focused", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options, modelValue: [] },
            });
            await container.getByRole("combobox").click();
            await expect.element(container.getByRole("listbox")).toBeVisible();
        });

        it("shows all options in listbox", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options, modelValue: [] },
            });
            await container.getByRole("combobox").click();
            for (const opt of options) {
                await expect.element(container.getByRole("option", { name: opt })).toBeInTheDocument();
            }
        });

        it("selects an option on click and shows it as a chip", async () => {
            const model = ref<Array<string | number>>([]);
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options },
                model,
            });
            await container.getByRole("combobox").click();
            await container.getByRole("option", { name: "Option 1" }).click();
            await nextTick();
            expect(model.value).toContain("Option 1");
            await expect.element(container.getByRole("button", { name: "Remove Option 1" })).toBeInTheDocument();
        });

        it("allows selecting multiple options", async () => {
            const model = ref<Array<string | number>>([]);
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options },
                model,
            });
            await container.getByRole("combobox").click();
            await container.getByRole("option", { name: "Option 1" }).click();
            await nextTick();
            await container.getByRole("combobox").click();
            await container.getByRole("option", { name: "Option 2" }).click();
            await nextTick();
            expect(model.value).toContain("Option 1");
            expect(model.value).toContain("Option 2");
        });

        it("deselects an option when clicked again", async () => {
            const model = ref<Array<string | number>>(["Option 1"]);
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options },
                model,
            });
            await container.getByRole("combobox").click();
            await container.getByRole("option", { name: "Option 1" }).click();
            await nextTick();
            expect(model.value).not.toContain("Option 1");
        });

        it("removes chip via remove button", async () => {
            const model = ref<Array<string | number>>(["Option 1", "Option 2"]);
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options },
                model,
            });
            await container.getByRole("button", { name: "Remove Option 1" }).click();
            await nextTick();
            expect(model.value).not.toContain("Option 1");
            expect(model.value).toContain("Option 2");
        });

        it("filters options based on search query", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick fruits", options: objectOptions, modelValue: [] },
            });
            const input = container.getByRole("combobox");
            await input.click();
            await userEvent.type(input, "an");
            await nextTick();
            await expect.element(container.getByRole("option", { name: "Banana" })).toBeInTheDocument();
            await expect.element(container.getByRole("option", { name: "Apple" })).not.toBeInTheDocument();
            await expect.element(container.getByRole("option", { name: "Cherry" })).not.toBeInTheDocument();
        });

        it("shows 'No results found' when filter matches nothing", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options, modelValue: [] },
            });
            const input = container.getByRole("combobox");
            await input.click();
            await userEvent.type(input, "zzz");
            await nextTick();
            await expect.element(container.getByText("No results found.")).toBeInTheDocument();
        });

        it("marks selected options with aria-selected=true", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick fruits", options: objectOptions, modelValue: ["apple"] },
            });
            await container.getByRole("combobox").click();
            const appleOption = container.getByRole("option", { name: "Apple" }).element() as HTMLElement;
            expect(appleOption.getAttribute("aria-selected")).toBe("true");
            const bananaOption = container.getByRole("option", { name: "Banana" }).element() as HTMLElement;
            expect(bananaOption.getAttribute("aria-selected")).toBe("false");
        });

        it("emits change event on selection", async () => {
            const onChange = vi.fn();
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options, modelValue: [], onChange },
            });
            await container.getByRole("combobox").click();
            await container.getByRole("option", { name: "Option 1" }).click();
            await nextTick();
            expect(onChange).toHaveBeenCalledWith(["Option 1"]);
        });

        it("does not open when disabled", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options, modelValue: [], disabled: true },
            });
            await container.locator(".g-multiselect-control").click({ force: true });
            await nextTick();
            const input = container.element().querySelector('[role="combobox"]') as HTMLInputElement;
            expect(input.getAttribute("aria-expanded")).toBe("false");
        });

        it("remove buttons are disabled when component is disabled", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options, modelValue: ["Option 1"], disabled: true },
            });
            const btn = container.getByRole("button", { name: "Remove Option 1" }).element() as HTMLButtonElement;
            expect(btn.disabled).toBe(true);
        });

        it("shows error messages", async () => {
            const { container } = mnt(GMultiSelect, {
                props: {
                    label: "Pick",
                    options,
                    modelValue: [],
                    errors: ["Please select at least one option"],
                },
            });
            await expect.element(container.getByText("Please select at least one option")).toBeInTheDocument();
        });

        it("shows instructions text", async () => {
            const { container } = mnt(GMultiSelect, {
                props: {
                    label: "Pick",
                    options,
                    modelValue: [],
                    instructions: "Select all that apply",
                },
            });
            await expect.element(container.getByText("Select all that apply")).toBeInTheDocument();
        });

        it("hides label when hiddenLabel is true", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options, modelValue: [], hiddenLabel: true },
            });
            await expect.element(container.getByText("Pick")).not.toBeInTheDocument();
        });

        it("works with object options", async () => {
            const model = ref<Array<string | number>>([]);
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick fruits", options: objectOptions },
                model,
            });
            await container.getByRole("combobox").click();
            await container.getByRole("option", { name: "Apple" }).click();
            await nextTick();
            expect(model.value).toContain("apple");
        });

        it("shows label text in chip for object options", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick fruits", options: objectOptions, modelValue: ["apple"] },
            });
            await expect.element(container.getByRole("button", { name: "Remove Apple" })).toBeInTheDocument();
        });
    });

    describe("Keyboard Tests", () => {
        it("opens with ArrowDown when closed", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options, modelValue: [] },
            });
            const input = container.getByRole("combobox");
            await input.click();
            // Immediately blur to close menu
            await userEvent.keyboard("{Escape}");
            await nextTick();
            await userEvent.keyboard("{ArrowDown}");
            await nextTick();
            await expect.element(container.getByRole("listbox")).toBeVisible();
        });

        it("navigates options with ArrowDown / ArrowUp", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options, modelValue: [] },
            });
            const input = container.getByRole("combobox");
            await input.click();
            await nextTick();
            await userEvent.keyboard("{ArrowDown}");
            await nextTick();
            const comboboxEl = input.element() as HTMLInputElement;
            expect(comboboxEl.getAttribute("aria-activedescendant")).toContain("-option-1");
            await userEvent.keyboard("{ArrowUp}");
            await nextTick();
            expect(comboboxEl.getAttribute("aria-activedescendant")).toContain("-option-0");
        });

        it("selects option with Enter key", async () => {
            const model = ref<Array<string | number>>([]);
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options },
                model,
            });
            const input = container.getByRole("combobox");
            await input.click();
            await nextTick();
            await userEvent.keyboard("{Enter}");
            await nextTick();
            expect(model.value).toContain(options[0]);
        });

        it("removes last chip with Backspace when input is empty", async () => {
            const model = ref<Array<string | number>>(["Option 1", "Option 2"]);
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options },
                model,
            });
            const input = container.getByRole("combobox");
            await input.click();
            await nextTick();
            await userEvent.keyboard("{Backspace}");
            await nextTick();
            expect(model.value).not.toContain("Option 2");
            expect(model.value).toContain("Option 1");
        });

        it("closes with Escape key", async () => {
            const { container } = mnt(GMultiSelect, {
                props: { label: "Pick", options, modelValue: [] },
            });
            const input = container.getByRole("combobox");
            await input.click();
            const listboxEl = container.element().querySelector('[role="listbox"]') as HTMLElement;
            expect(listboxEl.style.display).not.toBe("none");
            await userEvent.keyboard("{Escape}");
            await nextTick();
            expect(input.element().getAttribute("aria-expanded")).toBe("false");
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            await testAccessibility(GMultiSelect, {
                label: "Pick options",
                options,
                modelValue: [],
            });
        });

        it("with pre-selected values", async () => {
            await testAccessibility(GMultiSelect, {
                label: "Pick options",
                options,
                modelValue: ["Option 1", "Option 2"],
            });
        });

        it("with object options", async () => {
            await testAccessibility(GMultiSelect, {
                label: "Pick fruits",
                options: objectOptions,
                modelValue: ["apple"],
            });
        });

        it("with errors", async () => {
            await testAccessibility(GMultiSelect, {
                label: "Pick options",
                options,
                modelValue: [],
                errors: ["Please select at least one option"],
            });
        });

        it("with instructions", async () => {
            await testAccessibility(GMultiSelect, {
                label: "Pick options",
                options,
                modelValue: [],
                instructions: "Select all that apply",
            });
        });

        it("with hidden label", async () => {
            await testAccessibility(GMultiSelect, {
                label: "Pick options",
                options,
                modelValue: [],
                hiddenLabel: true,
            });
        });

        it("disabled", async () => {
            await testAccessibility(GMultiSelect, {
                label: "Pick options",
                options,
                modelValue: ["Option 1"],
                disabled: true,
            });
        });
    });
});
