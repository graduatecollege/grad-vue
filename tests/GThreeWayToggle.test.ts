import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import GThreeWayToggle from "../packages/grad-vue/src/components/GThreeWayToggle.vue";
import { mnt, testAccessibility } from "./test-utils";
import { ref } from "vue";

describe("GThreeWayToggle", () => {
    describe("Functional Tests", () => {
        it("Arrow right should select 'yes'", async () => {
            const model = ref<boolean | null>(null);
            const { instance, vm } = mnt(GThreeWayToggle, {
                props: {
                    label: "Toggle",
                },
                model,
            });

            await userEvent.keyboard("{Tab}");
            await userEvent.keyboard("{ArrowRight}");
            await vm.$nextTick();
            expect(model.value).toBe(true);
        });

        it("Arrow left should select 'no'", async () => {
            const model = ref<boolean | null>(null);
            const { instance, vm } = mnt(GThreeWayToggle, {
                props: {
                    label: "Toggle",
                },
                model,
            });

            await userEvent.keyboard("{Tab}");
            await userEvent.keyboard("{ArrowLeft}");

            await vm.$nextTick();
            expect(model.value).toBe(false);
        });

        it("Arrow right and then left should go back to no value", async () => {
            const model = ref<boolean | null>(null);
            const { vm } = mnt(GThreeWayToggle, {
                props: {
                    label: "Toggle",
                },
                model,
            });

            await userEvent.keyboard("{Tab}");
            await userEvent.keyboard("{ArrowRight}");
            await vm.$nextTick();
            expect(model.value).toBe(true);

            await userEvent.keyboard("{ArrowLeft}");
            await vm.$nextTick();
            expect(model.value).toBe(null);
        });

        it("Arrow left and then right should go back to no value", async () => {
            const model = ref<boolean | null>(null);
            const { vm } = mnt(GThreeWayToggle, {
                props: {
                    label: "Toggle",
                },
                model,
            });

            await userEvent.keyboard("{Tab}");
            await userEvent.keyboard("{ArrowLeft}");
            await vm.$nextTick();
            expect(model.value).toBe(false);

            await userEvent.keyboard("{ArrowRight}");
            await vm.$nextTick();
            expect(model.value).toBe(null);
        });

        it("Clicking on the right half should select 'yes'", async () => {
            const model = ref<boolean | null>(null);
            const { instance, vm } = mnt(GThreeWayToggle, {
                props: {
                    label: "Toggle",
                },
                model,
            });

            await userEvent.click(instance.getByLabelText("Yes"));
            await vm.$nextTick();
            expect(model.value).toBe(true);
        });

        it("Clicking on the left half should select 'no'", async () => {
            const model = ref<boolean | null>(null);
            const { instance, vm } = mnt(GThreeWayToggle, {
                props: {
                    label: "Toggle",
                },
                model,
            });

            await userEvent.click(instance.getByLabelText("No"));
            await vm.$nextTick();
            expect(model.value).toBe(false);
        });

        it("Clicking twice on the right half should go back to no value", async () => {
            const model = ref<boolean | null>(null);
            const { instance, vm } = mnt(GThreeWayToggle, {
                props: {
                    label: "Toggle",
                },
                model,
            });

            await userEvent.click(instance.getByLabelText("Yes"));
            await vm.$nextTick();
            expect(model.value).toBe(true);

            await userEvent.click(instance.getByLabelText("Yes"));
            await vm.$nextTick();
            expect(model.value).toBe(null);
        });

        it("Clicking twice on the left half should go back to no value", async () => {
            const model = ref<boolean | null>(null);
            const { instance, vm } = mnt(GThreeWayToggle, {
                props: {
                    label: "Toggle",
                },
                model,
            });

            await userEvent.click(instance.getByLabelText("No"));
            await vm.$nextTick();
            expect(model.value).toBe(false);

            await userEvent.click(instance.getByLabelText("No"));
            await vm.$nextTick();
            expect(model.value).toBe(null);
        });
    });
    describe("Accessibility Tests", () => {
        it("with default content", async () => {
            await testAccessibility(GThreeWayToggle, {
                label: "Three Way Toggle",
            });
        });
        it("with an error value set", async () => {
            await testAccessibility(GThreeWayToggle, {
                label: "Three Way Toggle",
                error: "This is an error",
            });
        });
        it("when disabled", async () => {
            await testAccessibility(GThreeWayToggle, {
                label: "Three Way Toggle",
                disabled: true,
            });
        });
        it("should have an accessible error message when set", async () => {
            const { instance } = mnt(GThreeWayToggle, {
                props: { label: "Three Way Toggle", error: "This is an error" },
            });

            await expect
                .element(instance.getByRole("radiogroup"))
                .toHaveAccessibleErrorMessage("This is an error");
        });
        it("should have an accessible description when set", async () => {
            const { instance, container } = mnt(GThreeWayToggle, {
                props: {
                    label: "Three Way Toggle",
                    describedby: "description",
                },
            });

            const descElement = window.document.createElement("p");
            descElement.setAttribute("id", "description");
            descElement.textContent = "This is a description";
            container.element().appendChild(descElement);

            await expect
                .element(instance.getByRole("radiogroup"))
                .toHaveAccessibleDescription("This is a description");
        });
    });
});
