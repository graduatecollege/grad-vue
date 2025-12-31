import { describe, expect, it, vi } from "vitest";
import GSearch from "../src/components/GSearch.vue";
import { mnt, testAccessibility } from "./test-utils";
import { userEvent } from "vitest/browser";

describe("GSearch", () => {
    describe("Functional Tests", () => {
        it("renders with default props", () => {
            const { container, unmount } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                },
            });

            expect(container.querySelector("input")).toBeTruthy();
            unmount();
        });

        it("with auto enabled, submit event should be fired with typing, after debounce", async () => {
            vi.useFakeTimers();
            const callback = vi.fn();
            const { container, app, unmount } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    auto: true,
                    onSubmit: callback,
                },
            });

            const input = container.querySelector("input")!;
            await userEvent.type(input, "test");

            // Should not have submitted immediately
            expect(callback).not.toHaveBeenCalled();

            await vi.advanceTimersByTimeAsync(400);

            expect(callback).toHaveBeenCalled();

            vi.useRealTimers();
            unmount();
        });

        it("with auto enabled, typing and waiting for debounce, and then typing again, should submit again", async () => {
            vi.useFakeTimers();
            const callback = vi.fn();
            const { container, app, setProps, unmount } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    auto: true,
                    onSubmit: callback,
                },
            });

            const input = container.querySelector("input")!;

            // First type
            await userEvent.type(input, "test");
            await vi.advanceTimersByTimeAsync(310);
            expect(callback).toHaveBeenCalled();

            vi.clearAllMocks();

            await userEvent.type(input, "test2");

            await userEvent.type(input, "ing"); // Should result in "testtest2ing"
            await vi.advanceTimersByTimeAsync(310);
            expect(callback).toHaveBeenCalledWith("testtest2ing");

            vi.useRealTimers();
            unmount();
        });

        it("with auto disabled, should not submit on typing", async () => {
            const callback = vi.fn();
            vi.useFakeTimers();
            const { container, app, unmount } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    auto: false,
                    onSubmit: callback,
                },
            });

            const input = container.querySelector("input")!;
            await userEvent.type(input, "test");

            await vi.advanceTimersByTimeAsync(1000);

            expect(callback).not.toHaveBeenCalled();

            vi.useRealTimers();
            unmount();
        });

        it("with auto disabled, should submit on enter after typing", async () => {
            const callback = vi.fn();
            const { container, app, unmount, vm } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [],
                    auto: false,
                    onSubmit: callback,
                },
            });

            const input = container.querySelector("input")!;
            await userEvent.type(input, "test{Enter}");
            await vm.$nextTick();

            expect(callback).toHaveBeenCalledWith("test");

            unmount();
        });

        it("with options open, arrow down should move to next result", async () => {
            const { container, vm, unmount, instance } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        { id: "1", title: "Option 1" },
                        { id: "2", title: "Option 2" },
                        { id: "3", title: "Option 3" },
                    ],
                },
            });

            const input = container.querySelector("input")!;

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

            unmount();
        });

        it("with options open, arrow up should move back to previous result", async () => {
            const { container, vm, unmount, instance } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        { id: "1", title: "Option 1" },
                        { id: "2", title: "Option 2" },
                        { id: "3", title: "Option 3" },
                    ],
                },
            });

            const input = container.querySelector("input")!;

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
            unmount();
        });

        it("with options open, enter should select result", async () => {
            const callback = vi.fn();
            const { container, vm, unmount, instance } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        { id: "1", title: "Option 1" },
                        { id: "2", title: "Option 2" },
                        { id: "3", title: "Option 3" },
                    ],
                    onSelect: callback
                }
            })
            const input = container.querySelector("input")!;
            await userEvent.type(input, "opt{Enter}");
            await vm.$nextTick();
            await userEvent.type(input, "{ArrowDown}{ArrowDown}{Enter}");
            expect(callback).toHaveBeenCalledWith({ id: "2", title: "Option 2" });
            unmount();
        })
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic props", async () => {
            await testAccessibility(GSearch, {
                modelValue: "",
                results: [],
            });
        });

        it("passes accessibility tests with input", async () => {
            await testAccessibility(GSearch, {
                modelValue: "Option 1",
                results: []
            });
        });

        it("passes accessibility tests with 0 results", async () => {
            const {container, vm, unmount} = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: []
                }
            });

            await userEvent.type(container.querySelector("input")!, "Opt");
            await vm.$nextTick();
            await userEvent.type(container.querySelector("input")!, "{Enter}");

            await testAccessibility(
                container
            );

            unmount();
        });
        it("passes accessibility tests with 2 results", async () => {
            const { container, vm, unmount } = mnt(GSearch, {
                props: {
                    modelValue: "",
                    results: [
                        { id: "1", title: "Option 1" },
                        { id: "2", title: "Option 2" },
                    ],
                },
            });

            await userEvent.type(container.querySelector("input")!, "Opt");
            await vm.$nextTick();
            await userEvent.type(container.querySelector("input")!, "{Enter}");

            await testAccessibility(
                container
            );

            unmount();
        });
    });
});
