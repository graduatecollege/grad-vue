import { expect, describe, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import GSelectButton from "../src/components/GSelectButton.vue";
import { testAccessibility, mnt } from "./test-utils";

describe("GSelectButton", () => {
    const options = ["Option 1", "Option 2", "Option 3"];

    describe("Functional Tests", () => {
        it("renders with default props", async () => {
            const { container, unmount } = mnt(GSelectButton, {
                props: {
                    label: "Choose option",
                    options,
                },
            });

            expect(container.textContent).toContain("Choose option");
            options.forEach((opt) => {
                expect(container.textContent).toContain(opt);
            });

            unmount();
        });

        it("updates model value when an option is clicked", async () => {
            const callback = vi.fn();
            const { unmount, instance, vm } = mnt(GSelectButton, {
                props: {
                    label: "Choose option",
                    options,
                    modelValue: "Option 1",
                    "onUpdate:modelValue": callback,
                },
            });

            await userEvent.click(instance.getByText("Option 2"));
            await vi.waitFor(() => callback.mock.lastCall);

            expect(callback).toHaveBeenCalledWith("Option 2");

            unmount();
        });

        it("emits change event when an option is clicked", async () => {
            const callback = vi.fn();
            const { unmount, instance, vm } = mnt(GSelectButton, {
                props: {
                    label: "Choose option",
                    options,
                    onChange: callback,
                },
            });

            await userEvent.click(instance.getByText("Option 3"));
            await vi.waitFor(() => callback.mock.lastCall);

            expect(callback).toHaveBeenCalledWith("Option 3");

            unmount();
        });

        it("updates model value and emits change event when using arrow keys", async () => {
            const callback = vi.fn();
            const callback2 = vi.fn();
            const { unmount, instance, vm } = mnt(GSelectButton, {
                props: {
                    label: "Choose option",
                    options,
                    modelValue: "Option 1",
                    "onUpdate:modelValue": callback2,
                    onChange: callback,
                },
            });

            await userEvent.keyboard("{Tab}");
            await userEvent.keyboard("{ArrowRight}");

            await vi.waitFor(() => callback.mock.lastCall);

            expect(callback2).toHaveBeenCalledWith("Option 2");
            expect(callback).toHaveBeenCalledWith("Option 2");

            unmount();
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests with basic props", async () => {
            await testAccessibility(GSelectButton, {
                label: "Choose option",
                options,
                modelValue: ""
            });
        });

        it("passes accessibility tests with selected value", async () => {
            await testAccessibility(GSelectButton, {
                label: "Choose option",
                options,
                modelValue: "Option 1",
            });
        });
    });
});
