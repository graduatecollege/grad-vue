import { afterEach, describe, expect, it, vi } from "vitest";
import { h, ref } from "vue";
import GSearch, {
    type GSearchAction,
    type GSearchGroup,
    type GSearchSubmitDetails,
} from "../packages/grad-vue/src/components/GSearch.vue";
import { mnt, testAccessibility } from "./test-utils";
import { userEvent } from "vitest/browser";

interface Student {
    id: string;
    title: string;
    term?: string;
}

describe("GSearch", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Functional Tests", () => {
        it("renders with default props", async () => {
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                },
            });

            await expect.element(container.getByRole("search")).toBeInTheDocument();
        });

        it("with auto enabled, submit event should be fired with typing, after debounce", async () => {
            vi.useFakeTimers();
            const callback = vi.fn();
            const { container } = mnt(GSearch, {
                props: {
                    results: [],
                    auto: true,
                    onSubmit: callback,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "test");

            // Should not have submitted immediately
            expect(callback).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(400);

            expect(callback).toHaveBeenCalled();

            vi.useRealTimers();
        });

        it("with auto enabled, typing and waiting for debounce, and then typing again, should submit again", async () => {
            vi.useFakeTimers();
            const callback = vi.fn();
            const { container, app, setProps } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    auto: true,
                    onSubmit: callback,
                },
            });

            const input = container.getByRole("combobox");

            // First type
            await userEvent.type(input, "test");
            await vi.advanceTimersByTimeAsync(310);
            expect(callback).toHaveBeenCalled();

            vi.clearAllMocks();

            await userEvent.type(input, "test2");

            await userEvent.type(input, "ing"); // Should result in "testtest2ing"
            await vi.advanceTimersByTimeAsync(310);
            expect(callback).toHaveBeenCalledWith("testtest2ing", { trigger: "auto" });

            vi.useRealTimers();
        });

        it("with auto disabled, should not submit on typing", async () => {
            const callback = vi.fn();
            vi.useFakeTimers();
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    auto: false,
                    onSubmit: callback,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "test");

            await vi.advanceTimersByTimeAsync(1000);

            expect(callback).not.toHaveBeenCalled();

            vi.useRealTimers();
        });

        it("with auto disabled, should submit on enter after typing", async () => {
            const callback = vi.fn();
            const { container, app, vm } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    auto: false,
                    onSubmit: callback,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "test{Enter}");
            await vm.$nextTick();

            expect(callback).toHaveBeenCalledWith("test", { trigger: "enter" });
        });

        it("with options open, arrow down should move to next result", async () => {
            const { container, vm, instance } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        { id: "1", title: "Option 1" },
                        { id: "2", title: "Option 2" },
                        { id: "3", title: "Option 3" },
                    ],
                },
            });

            const input = container.getByRole("combobox");

            // Open dropdown

            await userEvent.type(input, "opt{Enter}");
            await vm.$nextTick();
            await userEvent.type(input, "{ArrowDown}");

            expect(instance.getByText("Option 1")).toHaveAttribute(
                "aria-selected",
                "true",
            );
            await userEvent.type(input, "{ArrowDown}");

            expect(instance.getByText("Option 2")).toHaveAttribute(
                "aria-selected",
                "true",
            );
        });

        it("with options open, arrow up should move back to previous result", async () => {
            const { container, vm, instance } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        { id: "1", title: "Option 1" },
                        { id: "2", title: "Option 2" },
                        { id: "3", title: "Option 3" },
                    ],
                },
            });

            const input = container.getByRole("combobox");

            // Open dropdown

            await userEvent.type(input, "opt{Enter}");
            await vm.$nextTick();
            await userEvent.type(input, "{ArrowDown}");
            await userEvent.type(input, "{ArrowDown}");

            await userEvent.type(input, "{ArrowUp}");

            expect(instance.getByText("Option 1")).toHaveAttribute(
                "aria-selected",
                "true",
            );
        });

        it("with options open, enter should select result", async () => {
            const callback = vi.fn();
            const { container, vm, instance } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        { id: "1", title: "Option 1" },
                        { id: "2", title: "Option 2" },
                        { id: "3", title: "Option 3" },
                    ],
                    onSelect: callback,
                },
            });
            const input = container.getByRole("combobox");
            await userEvent.type(input, "opt{Enter}");
            await vm.$nextTick();
            await userEvent.type(input, "{ArrowDown}{ArrowDown}{Enter}");
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith({
                id: "2",
                title: "Option 2",
            });
        });

        it("enter with nothing highlighted submits once without emitting select", async () => {
            vi.useFakeTimers();
            const onSelect = vi.fn();
            const onSubmit = vi.fn();
            const model = ref("");
            const { container } = mnt(GSearch, {
                model,
                props: {
                    results: [{ id: "1", title: "Option 1" }],
                    onSelect,
                    onSubmit,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "opt");
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "true");

            await userEvent.type(input, "{Enter}");
            await vi.advanceTimersByTimeAsync(400);

            expect(onSelect).not.toHaveBeenCalled();
            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith("opt", { trigger: "enter" });
            expect(model.value).toBe("opt");
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "true");
        });

        it("clicking Submit Search button emits submit once and opens dropdown without emitting select", async () => {
            vi.useFakeTimers();
            const onSelect = vi.fn();
            const onSubmit = vi.fn();
            const model = ref("");
            const { container } = mnt(GSearch, {
                model,
                props: {
                    auto: false,
                    results: [{ id: "1", title: "Option 1" }],
                    onSelect,
                    onSubmit,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "opt");
            await userEvent.click(
                container.getByRole("button", { name: "Submit Search" }),
            );
            await vi.advanceTimersByTimeAsync(400);

            expect(onSelect).not.toHaveBeenCalled();
            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith("opt", { trigger: "button" });
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "true");
        });

        it("pressing Enter on Submit Search button after blurring input submits instead of activating previous highlight", async () => {
            vi.useFakeTimers();
            const onSelect = vi.fn();
            const onAction = vi.fn();
            const onSubmit = vi.fn();
            const model = ref("");
            const { container } = mnt(GSearch, {
                model,
                props: {
                    results: [{ id: "1", title: "Option 1" }],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                    onSelect,
                    onAction,
                    onSubmit,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "opt");
            await userEvent.type(input, "{ArrowUp}");
            await expect
                .element(
                    container.getByRole("option", { name: "Search all terms" }),
                )
                .toHaveAttribute("aria-selected", "true");

            await userEvent.tab();
            const submitButton = container.getByRole("button", {
                name: "Submit Search",
            });
            await expect.element(submitButton).toHaveFocus();
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "false");

            onSubmit.mockClear();
            await userEvent.keyboard("{Enter}");
            await vi.advanceTimersByTimeAsync(400);

            expect(onAction).not.toHaveBeenCalled();
            expect(onSelect).not.toHaveBeenCalled();
            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith("opt", { trigger: "button" });
        });

        it("choosing an action cancels pending auto-submit so submit is not emitted afterwards", async () => {
            vi.useFakeTimers();
            const onSubmit = vi.fn();
            const onAction = vi.fn();
            const model = ref("");
            const { container } = mnt(GSearch, {
                model,
                props: {
                    results: [],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                    onSubmit,
                    onAction,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "Alex");
            expect(onSubmit).not.toHaveBeenCalled();

            await userEvent.type(input, "{ArrowDown}{Enter}");
            expect(onAction).toHaveBeenCalledTimes(1);

            await vi.advanceTimersByTimeAsync(400);
            expect(onSubmit).not.toHaveBeenCalled();
        });

        it("escape closes the dropdown even when there are no results", async () => {
            const model = ref("");
            const { container } = mnt(GSearch, {
                model,
                props: {
                    results: [],
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "none");
            await expect.element(input).toHaveAttribute("aria-expanded", "true");

            await userEvent.type(input, "{Escape}");
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "false");
            expect(model.value).toBe("none");

            await userEvent.type(input, "{Escape}");
            expect(model.value).toBe("");
        });

        it("renders actions in their own group after results without counting them as results", async () => {
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        { id: "1", title: "Option 1" },
                        { id: "2", title: "Option 2" },
                    ],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "opt");

            await expect.element(container.getByText("2 results")).toBeInTheDocument();

            const actionsGroup = container.getByRole("group", {
                name: "Actions",
            });
            await expect.element(actionsGroup).toBeInTheDocument();
            await expect
                .element(
                    actionsGroup.getByRole("option", {
                        name: "Search all terms",
                    }),
                )
                .toBeInTheDocument();

            await expect
                .element(container.getByRole("status"))
                .toHaveTextContent("2 results, 1 action available");
        });

        it("reaches actions with arrow keys including when there are 0 results", async () => {
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "missing");

            await expect.element(container.getByText("0 results")).toBeInTheDocument();
            await expect
                .element(container.getByRole("status"))
                .toHaveTextContent("0 results, 1 action available");

            await userEvent.type(input, "{ArrowDown}");
            const actionOption = container.getByRole("option", {
                name: "Search all terms",
            });
            await expect
                .element(actionOption)
                .toHaveAttribute("aria-selected", "true");
        });

        it("arrow keys navigate through results into actions and wrap around", async () => {
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [{ id: "1", title: "Option 1" }],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "opt");

            const resultOption = container.getByRole("option", {
                name: "Option 1",
            });
            const actionOption = container.getByRole("option", {
                name: "Search all terms",
            });

            await userEvent.type(input, "{ArrowUp}");
            await expect
                .element(actionOption)
                .toHaveAttribute("aria-selected", "true");

            await userEvent.type(input, "{ArrowDown}");
            await expect
                .element(resultOption)
                .toHaveAttribute("aria-selected", "true");

            await userEvent.type(input, "{ArrowDown}");
            await expect
                .element(actionOption)
                .toHaveAttribute("aria-selected", "true");
        });

        it("choosing an action via keyboard or click emits action, leaves query and dropdown open, and supports re-running search", async () => {
            const model = ref("");
            const onSelect = vi.fn();
            const onAction = vi.fn((action: GSearchAction) => {
                if (action.id === "all-terms") {
                    setProps({
                        results: [
                            {
                                type: "students",
                                label: "Students – All Terms",
                                items: [
                                    { id: "1", title: "Alex Rivera" },
                                    { id: "2", title: "Alex Chen" },
                                ],
                            },
                        ] satisfies GSearchGroup<Student>[],
                        actions: [],
                    });
                }
            });

            const { container, setProps } = mnt(GSearch, {
                model,
                props: {
                    results: [
                        {
                            type: "students",
                            label: "Students – Fall 2026",
                            items: [],
                        },
                    ] satisfies GSearchGroup<Student>[],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                    onSelect,
                    onAction,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "Alex");

            await expect
                .element(container.getByRole("status"))
                .toHaveTextContent(
                    "0 results in Students – Fall 2026, 1 action available",
                );

            await userEvent.type(input, "{ArrowDown}{Enter}");

            expect(onAction).toHaveBeenCalledWith({
                id: "all-terms",
                label: "Search all terms",
            });
            expect(onSelect).not.toHaveBeenCalled();
            expect(model.value).toBe("Alex");
            await expect.element(input).toHaveAttribute("aria-expanded", "true");

            const allTermsGroup = container.getByRole("group", {
                name: "Students – All Terms",
            });
            await expect.element(allTermsGroup).toBeInTheDocument();
            await expect
                .element(container.getByText("2 results"))
                .toBeInTheDocument();
            await expect
                .element(container.getByRole("status"))
                .toHaveTextContent("2 results in Students – All Terms");
        });

        it("clicking an action emits action and leaves query and dropdown alone", async () => {
            const onAction = vi.fn();
            const onSelect = vi.fn();
            const model = ref("");
            const { container } = mnt(GSearch, {
                model,
                props: {
                    results: [{ id: "1", title: "Alex Rivera" }],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                    onAction,
                    onSelect,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "Alex");

            await userEvent.click(
                container.getByRole("option", { name: "Search all terms" }),
            );

            expect(onAction).toHaveBeenCalledWith({
                id: "all-terms",
                label: "Search all terms",
            });
            expect(onSelect).not.toHaveBeenCalled();
            expect(model.value).toBe("Alex");
            await expect.element(input).toHaveAttribute("aria-expanded", "true");
        });

        it("renders actions visually distinct with shaded background and decorative leading icon", async () => {
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [{ id: "1", title: "Alex Rivera" }],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "Alex");

            const resultOption = container.getByRole("option", {
                name: "Alex Rivera",
            });
            const actionOption = container.getByRole("option", {
                name: "Search all terms",
            });
            await expect.element(resultOption).toBeInTheDocument();
            await expect.element(actionOption).toBeInTheDocument();

            const resultStyle = window.getComputedStyle(resultOption.element());
            const actionStyle = window.getComputedStyle(actionOption.element());

            expect(actionStyle.backgroundColor).not.toBe(
                resultStyle.backgroundColor,
            );
            expect(actionStyle.color).not.toBe(resultStyle.color);

            const iconWrapper = actionOption
                .element()
                .querySelector(".g-search-action-icon");
            expect(iconWrapper).toBeInTheDocument();
            expect(iconWrapper).toHaveAttribute("aria-hidden", "true");
            expect(iconWrapper?.querySelector("svg")).toBeInTheDocument();
        });

        it("supports configuring or hiding the decorative action icon via action.icon, actionIcon prop, and action-icon slot", async () => {
            const { container, setProps } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    actionIcon: "fa-solid fa-bolt",
                    actions: [
                        { id: "default-prop", label: "Use default prop icon" },
                        {
                            id: "custom-class",
                            label: "Search all terms",
                            icon: "fa-solid fa-globe",
                        },
                        {
                            id: "no-icon",
                            label: "Plain action",
                            icon: false,
                        },
                    ],
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "Alex");

            const propIconAction = container
                .getByRole("option", { name: "Use default prop icon" })
                .element();
            expect(
                propIconAction.querySelector(".fa-solid.fa-bolt"),
            ).toBeInTheDocument();
            expect(
                propIconAction.querySelector(".g-search-action-icon"),
            ).toHaveAttribute("aria-hidden", "true");

            const customIconAction = container
                .getByRole("option", { name: "Search all terms" })
                .element();
            expect(
                customIconAction.querySelector(".fa-solid.fa-globe"),
            ).toBeInTheDocument();

            const plainAction = container
                .getByRole("option", { name: "Plain action" })
                .element();
            expect(
                plainAction.querySelector(".g-search-action-icon"),
            ).not.toBeInTheDocument();

            setProps({
                actionIcon: false,
                actions: [{ id: "global-off", label: "Global icon off" }],
            });
            const globalOffOption = container.getByRole("option", {
                name: "Global icon off",
            });
            await expect.element(globalOffOption).toBeInTheDocument();
            expect(
                globalOffOption.element().querySelector(".g-search-action-icon"),
            ).not.toBeInTheDocument();
        });

        it("renders custom action-icon slot as decorative leading icon", async () => {
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                },
                slots: {
                    "action-icon": ({ action }: { action: GSearchAction }) =>
                        h(
                            "svg",
                            {
                                "data-action-id": String(action.id),
                                viewBox: "0 0 10 10",
                            },
                            [h("circle", { cx: 5, cy: 5, r: 4 })],
                        ),
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "Alex");

            const actionOption = container.getByRole("option", {
                name: "Search all terms",
            });
            await expect.element(actionOption).toBeInTheDocument();

            const iconWrapper = actionOption
                .element()
                .querySelector(".g-search-action-icon");
            expect(iconWrapper).toHaveAttribute("aria-hidden", "true");
            expect(
                iconWrapper?.querySelector('svg[data-action-id="all-terms"]'),
            ).toBeInTheDocument();
        });

        it("keeps action mode active while continuing to type and emits close only when dropdown closes", async () => {
            vi.useFakeTimers();
            const students: Student[] = [
                { id: "s1", title: "Alex Rivera", term: "Fall 2026" },
                {
                    id: "s2",
                    title: "Alex Chen (Spring 2025)",
                    term: "Spring 2025",
                },
            ];

            const model = ref("");
            let allTermsMode = false;

            function computeResults(query: string): GSearchGroup<Student>[] {
                const q = query.trim().toLowerCase();
                if (q.length < 2) return [];
                return [
                    {
                        type: "students",
                        label: allTermsMode
                            ? "Students – All Terms"
                            : "Students – Fall 2026",
                        items: students.filter(
                            (s) =>
                                (allTermsMode || s.term === "Fall 2026") &&
                                s.title.toLowerCase().includes(q),
                        ),
                    },
                ];
            }

            function syncProps() {
                setProps({
                    results: computeResults(model.value),
                    actions: allTermsMode
                        ? []
                        : [{ id: "all-terms", label: "Search all terms" }],
                });
            }

            const onClose = vi.fn(() => {
                allTermsMode = false;
                syncProps();
            });

            const { container, setProps } = mnt(GSearch, {
                model,
                props: {
                    results: [] as GSearchGroup<Student>[],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                    onSubmit: (q: string | null) => {
                        model.value = q ?? "";
                        syncProps();
                    },
                    onAction: (action: GSearchAction) => {
                        if (action.id === "all-terms") {
                            allTermsMode = true;
                            syncProps();
                        }
                    },
                    onClose,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "al");
            await vi.advanceTimersByTimeAsync(350);

            await expect
                .element(
                    container.getByRole("group", {
                        name: "Students – Fall 2026",
                    }),
                )
                .toBeInTheDocument();
            await expect
                .element(container.getByText("1 result"))
                .toBeInTheDocument();

            await userEvent.click(
                container.getByRole("option", { name: "Search all terms" }),
            );
            await expect
                .element(
                    container.getByRole("group", {
                        name: "Students – All Terms",
                    }),
                )
                .toBeInTheDocument();
            await expect
                .element(container.getByText("2 results"))
                .toBeInTheDocument();
            expect(onClose).not.toHaveBeenCalled();

            // Continue typing ("al" -> "ale"): stays in All Terms mode
            await userEvent.type(input, "e");
            await vi.advanceTimersByTimeAsync(350);
            expect(model.value).toBe("ale");
            expect(onClose).not.toHaveBeenCalled();
            await expect
                .element(
                    container.getByRole("group", {
                        name: "Students – All Terms",
                    }),
                )
                .toBeInTheDocument();
            await expect
                .element(container.getByText("2 results"))
                .toBeInTheDocument();

            // Backspace while still >= 2 chars ("ale" -> "al"): dropdown stays open in All Terms mode
            await userEvent.type(input, "{Backspace}");
            await vi.advanceTimersByTimeAsync(350);
            expect(model.value).toBe("al");
            expect(onClose).not.toHaveBeenCalled();
            await expect
                .element(
                    container.getByRole("group", {
                        name: "Students – All Terms",
                    }),
                )
                .toBeInTheDocument();

            // Closing dropdown via Escape emits close and resets mode
            await userEvent.type(input, "{Escape}");
            expect(onClose).toHaveBeenCalledTimes(1);
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "false");

            // Reopening shows single-term mode and the action again
            await userEvent.type(input, "{ArrowDown}");
            await expect
                .element(
                    container.getByRole("group", {
                        name: "Students – Fall 2026",
                    }),
                )
                .toBeInTheDocument();
            await expect
                .element(
                    container.getByRole("option", {
                        name: "Search all terms",
                    }),
                )
                .toBeInTheDocument();
        });
    });

    describe("Submit trigger", () => {
        it("closes the dropdown once when the parent clears the model, and reopens on typing", async () => {
            const onClose = vi.fn();
            const model = ref("");
            const { container } = mnt(GSearch, {
                model,
                props: {
                    results: [{ id: "1", title: "Option 1" }],
                    onClose,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "opt");
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "true");

            model.value = "";
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "false");
            await expect.element(input).toHaveValue("");
            await expect.element(input).toHaveFocus();
            expect(
                container.getByRole("option", { name: "Option 1" }).query(),
            ).toBeNull();
            expect(onClose).toHaveBeenCalledTimes(1);

            await userEvent.type(input, "op");
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "true");
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it("closes when the parent clears the model in response to an Enter submit", async () => {
            const onClose = vi.fn();
            const model = ref("");
            const onSubmit = vi.fn(
                (query: string | null, details: GSearchSubmitDetails) => {
                    if (details.trigger === "enter" && query === "1588") {
                        model.value = "";
                    }
                },
            );
            const { container } = mnt(GSearch, {
                model,
                props: {
                    results: [{ id: "1588", title: "Physics (1588)" }],
                    onSubmit,
                    onClose,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "1588");
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "true");

            await userEvent.type(input, "{Enter}");
            expect(onSubmit).toHaveBeenCalledWith("1588", {
                trigger: "enter",
            });
            await expect
                .element(input)
                .toHaveAttribute("aria-expanded", "false");
            await expect.element(input).toHaveValue("");
            await expect.element(input).toHaveFocus();
            expect(onClose).toHaveBeenCalledTimes(1);
        });
        it("reports auto, enter, and button triggers", async () => {
            vi.useFakeTimers();
            const onSubmit = vi.fn();
            const model = ref("");
            const { container } = mnt(GSearch, {
                model,
                props: { results: [], onSubmit },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "123");
            await vi.advanceTimersByTimeAsync(400);
            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenLastCalledWith("123", {
                trigger: "auto",
            });

            await userEvent.type(input, "4{Enter}");
            await vi.advanceTimersByTimeAsync(400);
            expect(onSubmit).toHaveBeenCalledTimes(2);
            expect(onSubmit).toHaveBeenLastCalledWith("1234", {
                trigger: "enter",
            });

            await userEvent.click(
                container.getByRole("button", { name: "Submit Search" }),
            );
            expect(onSubmit).toHaveBeenCalledTimes(3);
            expect(onSubmit).toHaveBeenLastCalledWith("1234", {
                trigger: "button",
            });
        });

        it("Enter before the debounce fires reports only the enter trigger", async () => {
            vi.useFakeTimers();
            const onSubmit = vi.fn();
            const { container } = mnt(GSearch, {
                props: { modelValue: "", results: [], onSubmit },
            });

            await userEvent.type(
                container.getByRole("combobox"),
                "123456789{Enter}",
            );
            await vi.advanceTimersByTimeAsync(400);

            expect(onSubmit).toHaveBeenCalledTimes(1);
            expect(onSubmit).toHaveBeenCalledWith("123456789", {
                trigger: "enter",
            });
        });

        it("Enter with a highlighted result selects instead of submitting", async () => {
            const onSubmit = vi.fn();
            const onSelect = vi.fn();
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [{ id: "1", title: "Option 1" }],
                    auto: false,
                    onSubmit,
                    onSelect,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "opt{Enter}");
            onSubmit.mockClear();
            await userEvent.type(input, "{ArrowDown}{Enter}");

            expect(onSelect).toHaveBeenCalledWith({
                id: "1",
                title: "Option 1",
            });
            expect(onSubmit).not.toHaveBeenCalled();
        });
    });

    describe("Duplicate items across groups", () => {
        it("gives each rendered option a unique id and highlights only the active one", async () => {
            const onSelect = vi.fn();
            const items = [
                { id: "1", title: "Option 1" },
                { id: "2", title: "Option 2" },
            ];
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        {
                            type: "exact",
                            label: "Exact Match",
                            items: [items[1]],
                        },
                        { type: "all", label: "Options", items },
                    ] satisfies GSearchGroup<Student>[],
                    onSelect,
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "opt{ArrowDown}");

            const exact = container
                .getByRole("group", { name: "Exact Match" })
                .getByRole("option", { name: "Option 2" });
            const normal = container
                .getByRole("group", { name: "Options" })
                .getByRole("option", { name: "Option 2" });

            await expect
                .element(exact)
                .toHaveAttribute("aria-selected", "true");
            await expect
                .element(normal)
                .toHaveAttribute("aria-selected", "false");
            await expect
                .element(input)
                .toHaveAttribute("aria-activedescendant", exact.element().id);

            const ids = container
                .getByRole("option")
                .elements()
                .map((el) => el.id);
            expect(new Set(ids).size).toBe(ids.length);

            await userEvent.type(input, "{ArrowDown}{ArrowDown}");
            await expect
                .element(normal)
                .toHaveAttribute("aria-selected", "true");
            await expect
                .element(exact)
                .toHaveAttribute("aria-selected", "false");
        });
    });

    describe("Accessibility Tests", () => {
        it("with basic props", async () => {
            await testAccessibility(GSearch, {
                modelValue: "",
                results: [],
            });
        });

        it("with input", async () => {
            await testAccessibility(GSearch, {
                modelValue: "Option 1",
                results: [],
            });
        });

        it("with 0 results", async () => {
            const { container, vm } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                },
            });

            await userEvent.type(
                container.getByRole("combobox"),
                "Opt",
            );
            await vm.$nextTick();
            await userEvent.type(
                container.getByRole("combobox"),
                "{Enter}",
            );

            await testAccessibility(container.element());
        });
        it("with 2 results", async () => {
            const { container, vm } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        { id: "1", title: "Option 1" },
                        { id: "2", title: "Option 2" },
                    ],
                },
            });

            await userEvent.type(
                container.getByRole("combobox"),
                "Opt",
            );
            await vm.$nextTick();
            await userEvent.type(
                container.getByRole("combobox"),
                "{Enter}",
            );

            await testAccessibility(container.element());
        });

        it("with grouped results and actions", async () => {
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        {
                            type: "students",
                            label: "Students – Fall 2026",
                            items: [
                                { id: "1", title: "Alex Rivera" },
                                { id: "2", title: "Samira Patel" },
                            ],
                        },
                    ],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "Al");
            await userEvent.type(input, "{ArrowDown}{ArrowDown}{ArrowDown}");
            await expect
                .element(
                    container.getByRole("option", { name: "Search all terms" }),
                )
                .toHaveAttribute("aria-selected", "true");

            await testAccessibility(container.element());
        });

        it("with the same item in two groups", async () => {
            const items = [
                { id: "1", title: "Alex Rivera" },
                { id: "2", title: "Samira Patel" },
            ];
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        { type: "exact", label: "Exact Match", items: [items[0]] },
                        { type: "students", label: "Students", items },
                    ],
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "Al{ArrowDown}");
            await expect
                .element(
                    container
                        .getByRole("group", { name: "Exact Match" })
                        .getByRole("option", { name: "Alex Rivera" }),
                )
                .toHaveAttribute("aria-selected", "true");

            await testAccessibility(container.element());
        });

        it("with 0 results and actions", async () => {
            const { container } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    actions: [
                        { id: "all-terms", label: "Search all terms" },
                    ],
                },
            });

            const input = container.getByRole("combobox");
            await userEvent.type(input, "Missing");
            await userEvent.type(input, "{ArrowDown}");
            await expect
                .element(
                    container.getByRole("option", { name: "Search all terms" }),
                )
                .toHaveAttribute("aria-selected", "true");

            await testAccessibility(container.element());
        });
    });
});
