import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import GSelect from "../packages/grad-vue/src/components/GSelect.vue";
import { mnt, testAccessibility } from "./test-utils";
import { page } from "vitest/browser";
import { userEvent } from "vitest/browser";

describe("GSelect", () => {
    const options = ["Option 1", "Option 2", "Option 3"];

    describe("Functional Tests", () => {
        it("renders with label and options", async () => {
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    modelValue: null,
                },
            });

            await expect.element(container.getByText("Select option")).toBeVisible();
        });

        it("opens below when there is at least 200px of space below and constrains max-height", async () => {

            await page.viewport(420, 500);

            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    modelValue: null,
                },
            });

            await container.getByRole("combobox").click();
            await nextTick();

            await expect.element(container.getByRole("listbox")).toBeInView();
        });

        it("opens below when listbox is shorter than 200px and there is enough room for the full listbox", async () => {
            await page.viewport(420, 500);
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    modelValue: null,
                    style: {
                        marginTop: "250px"
                    }
                },
            });
            await container.getByRole("combobox").click();
            await nextTick();

            await expect.element(container.getByRole("listbox")).toBeInView();
        });

        it("opens above when there is less than 200px below and more space above", async () => {
            await page.viewport(420, 500);
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options: [
                        "Option 1",
                        "Option 2",
                        "Option 3",
                        "Option 4",
                        "Option 5",
                        "Option 6",
                    ],
                    modelValue: null,
                    style: {
                        paddingTop: "350px"
                    }
                },
            });
            await container.getByRole("combobox").click();
            await nextTick();


        });

        it("sets aria-required when required", async () => {
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    modelValue: null,
                    required: true,
                },
            });

            await expect.element(container.getByRole("combobox")).toHaveAttribute("aria-required", "true");
        });

        it("commits native-style arrow, Home, and End navigation while closed", async () => {
            const model = ref<string | null>("Option 2");
            const onChange = vi.fn();
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    onChange,
                },
                model,
            });
            const combobox = container.getByRole("combobox");
            combobox.element().focus();

            await userEvent.keyboard("{ArrowDown}");
            expect(model.value).toBe("Option 3");
            await userEvent.keyboard("{ArrowUp}");
            expect(model.value).toBe("Option 2");
            await userEvent.keyboard("{End}");
            expect(model.value).toBe("Option 3");
            await userEvent.keyboard("{Home}");
            expect(model.value).toBe("Option 1");

            expect(onChange).toHaveBeenCalledTimes(4);
            await expect
                .element(combobox)
                .toHaveAttribute("aria-expanded", "false");
        });

        it("uses type-ahead to select and cycle through matching options", async () => {
            const model = ref<string | null>("Apple");
            const onChange = vi.fn();
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select fruit",
                    options: ["Apple", "Banana", "Blueberry", "Brownie", "Cherry"],
                    onChange,
                },
                model,
            });
            container.getByRole("combobox").element().focus();

            await userEvent.keyboard("b");
            expect(model.value).toBe("Banana");
            await userEvent.keyboard("b");
            expect(model.value).toBe("Blueberry");

            expect(onChange).toHaveBeenNthCalledWith(1, "Banana");
            expect(onChange).toHaveBeenNthCalledWith(2, "Blueberry");
        });

        it("accumulates type-ahead characters and matches option prefixes", async () => {
            const model = ref<string | null>("Apple");
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select fruit",
                    options: ["Apple", "Banana", "Blueberry", "Brownie", "Cherry"],
                },
                model,
            });
            container.getByRole("combobox").element().focus();

            await userEvent.keyboard("br");

            expect(model.value).toBe("Brownie");
        });

        it("starts type-ahead at the first option when nothing is selected", async () => {
            const model = ref<string | null>(null);
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select fruit",
                    options: ["Banana", "Blueberry", "Cherry"],
                },
                model,
            });
            container.getByRole("combobox").element().focus();

            await userEvent.keyboard("b");

            expect(model.value).toBe("Banana");
        });

        it("moves the active option while open and commits it with Enter", async () => {
            const model = ref<string | null>("Apple");
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select fruit",
                    options: ["Apple", "Banana", "Blueberry", "Brownie", "Cherry"],
                },
                model,
            });
            const combobox = container.getByRole("combobox");
            combobox.element().focus();
            await userEvent.keyboard("{Enter}");
            await userEvent.keyboard("br");

            expect(model.value).toBe("Apple");
            const brownie = container.getByRole("option", { name: "Brownie" });
            await expect
                .element(combobox)
                .toHaveAttribute(
                    "aria-activedescendant",
                    brownie.element().id,
                );

            await userEvent.keyboard("{Enter}");
            expect(model.value).toBe("Brownie");
            await expect
                .element(combobox)
                .toHaveAttribute("aria-expanded", "false");
        });

        it("scrolls the selected option into view when opening", async () => {
            const options = Array.from(
                { length: 30 },
                (_, index) => `Option ${index + 1}`,
            );
            const model = ref<string | null>("Option 30");
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                },
                model,
            });
            const combobox = container.getByRole("combobox");
            combobox.element().focus();

            await userEvent.keyboard("{Enter}");

            const lastOption = container.getByRole("option", {
                name: "Option 30",
            });
            await expect
                .element(lastOption)
                .toBeInView();
            await expect.element(combobox).toHaveAttribute(
                "aria-activedescendant",
                lastOption.element().id,
            );
        });

        it("ignores combobox shortcuts from the nested clear button", async () => {
            const model = ref<string | null>("Option 2");
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    clearButton: true,
                },
                model,
            });
            container
                .getByRole("button", { name: "Clear Selection" })
                .element()
                .focus();

            await userEvent.keyboard("a{Home}{End}");

            expect(model.value).toBe("Option 2");
        });

        it("reopens a closed searchable select with arrow keys", async () => {
            const model = ref<string | null>("Option 2");
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    searchable: true,
                },
                model,
            });
            const combobox = container.getByRole("combobox");
            await combobox.click();
            await userEvent.keyboard("{Escape}");
            await expect
                .element(combobox)
                .toHaveAttribute("aria-expanded", "false");

            await userEvent.keyboard("{ArrowDown}");

            expect(model.value).toBe("Option 2");
            await expect
                .element(combobox)
                .toHaveAttribute("aria-expanded", "true");
        });

        it("opens with Space without committing the active option with Space", async () => {
            const model = ref<string | null>("Option 1");
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                },
                model,
            });
            container.getByRole("combobox").element().focus();

            await userEvent.keyboard(" ");
            await userEvent.keyboard("{ArrowDown}");
            await userEvent.keyboard(" ");

            expect(model.value).toBe("Option 1");
            await expect
                .element(container.getByRole("combobox"))
                .toHaveAttribute("aria-expanded", "true");
        });

        it("opens the menu with F4 and Alt+ArrowDown", async () => {
            for (const key of ["{F4}", "{Alt>}{ArrowDown}{/Alt}"]) {
                const { container } = mnt(GSelect, {
                    props: {
                        label: "Select option",
                        options,
                        modelValue: null,
                    },
                });
                const combobox = container.getByRole("combobox");
                combobox.element().focus();

                await userEvent.keyboard(key);

                await expect
                    .element(combobox)
                    .toHaveAttribute("aria-expanded", "true");
            }
        });

        it("resets type-ahead after one second", async () => {
            vi.useFakeTimers();
            const model = ref<string | null>(null);
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select fruit",
                    options: ["Apple", "Banana", "Cherry"],
                },
                model,
            });
            container.getByRole("combobox").element().focus();

            try {
                await userEvent.keyboard("b");
                vi.advanceTimersByTime(1000);
                await userEvent.keyboard("c");

                expect(model.value).toBe("Cherry");
            } finally {
                vi.useRealTimers();
            }
        });

        it("ignores interaction while disabled and closes when disabled", async () => {
            const model = ref<string | null>("Option 1");
            const onChange = vi.fn();
            const { container, setProps } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    onChange,
                },
                model,
            });
            const combobox = container.getByRole("combobox");
            combobox.element().focus();
            await userEvent.keyboard("{Enter}");
            await expect
                .element(combobox)
                .toHaveAttribute("aria-expanded", "true");

            setProps({ disabled: true });
            await nextTick();
            await expect
                .element(combobox)
                .toHaveAttribute("aria-expanded", "false");
            await expect
                .element(combobox)
                .toHaveAttribute("aria-disabled", "true");
            await expect.element(combobox).toHaveAttribute("tabindex", "-1");

            combobox.element().focus();
            await userEvent.keyboard("b{ArrowDown}{Home}{End}");
            await combobox.click({ force: true });

            expect(model.value).toBe("Option 1");
            expect(onChange).not.toHaveBeenCalled();
            await expect
                .element(combobox)
                .toHaveAttribute("aria-expanded", "false");
        });

        it("does not open from clicks or keys when initially disabled", async () => {
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    modelValue: null,
                    disabled: true,
                },
            });
            const combobox = container.getByRole("combobox");

            await expect
                .element(combobox)
                .toHaveAttribute("aria-disabled", "true");
            await expect.element(combobox).toHaveAttribute("tabindex", "-1");

            await combobox.click({ force: true });
            await userEvent.keyboard("{Enter}b");

            await expect
                .element(combobox)
                .toHaveAttribute("aria-expanded", "false");
        });

        it("associates validation errors with the combobox", async () => {
            const { container } = mnt(GSelect, {
                props: {
                    label: "Select option",
                    options,
                    modelValue: null,
                    errors: ["Choose an option."],
                },
            });
            const combobox = container.getByRole("combobox");

            await expect
                .element(combobox)
                .toHaveAttribute("aria-invalid", "true");
            await expect
                .element(combobox)
                .toHaveAccessibleDescription(
                    "Choose an option.",
                );
            const errorId = combobox.element().getAttribute(
                "aria-describedby",
            );
            expect(document.getElementById(errorId!)).toHaveTextContent(
                "Choose an option.",
            );
        });

        it("renders an option description as a second line when provided", async () => {
            const { container } = mnt(GSelect, {
                props: {
                    label: "Filter by college",
                    options: [
                        { label: "KP", value: "KP", description: "Grainger College of Engineering" },
                        { label: "KV", value: "KV" },
                    ],
                    modelValue: null,
                },
            });

            await container.getByRole("combobox").click();
            await nextTick();

            await expect
                .element(container.getByText("Grainger College of Engineering"))
                .toBeVisible();
        });

        it("matches the option description when searching by default", async () => {
            const { container } = mnt(GSelect, {
                props: {
                    label: "Filter by college",
                    options: [
                        { label: "KP", value: "KP", description: "Grainger College of Engineering" },
                        { label: "KV", value: "KV", description: "College of Media" },
                    ],
                    modelValue: null,
                    searchable: true,
                },
            });

            const input = container.getByRole("combobox");
            await input.click();
            await userEvent.type(input, "Grainger");
            await nextTick();

            await expect.element(container.getByRole("option", { name: /KP/ })).toBeInTheDocument();
            await expect.element(container.getByRole("option", { name: /KV/ })).not.toBeInTheDocument();
        });

        it("does not match the description when searchDescription is false", async () => {
            const { container } = mnt(GSelect, {
                props: {
                    label: "Filter by college",
                    options: [
                        { label: "KP", value: "KP", description: "Grainger College of Engineering" },
                        { label: "KV", value: "KV", description: "College of Media" },
                    ],
                    modelValue: null,
                    searchable: true,
                    searchDescription: false,
                },
            });

            const input = container.getByRole("combobox");
            await input.click();
            await userEvent.type(input, "Grainger");
            await nextTick();

            await expect.element(container.getByText("No results found.")).toBeInTheDocument();
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            await testAccessibility(GSelect, {
                label: "Select option",
                options,
                modelValue: null,
            });
        });

        it("with selected value", async () => {
            await testAccessibility(GSelect, {
                label: "Select option",
                options,
                modelValue: "Option 2",
            });
        });

        it("with object options", async () => {
            const objectOptions = [
                { label: "First", value: 1 },
                { label: "Second", value: 2 },
            ];

            await testAccessibility(GSelect, {
                label: "Select option",
                options: objectOptions,
                modelValue: 1,
            });
        });

        it("with searchable enabled", async () => {
            await testAccessibility(GSelect, {
                label: "Select option",
                options,
                modelValue: null,
                searchable: true,
            });
        });

        it("with required", async () => {
            await testAccessibility(GSelect, {
                label: "Select option",
                options,
                modelValue: null,
                required: true,
            });
        });
    });
});
