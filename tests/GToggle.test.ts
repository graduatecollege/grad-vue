import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { ref } from "vue";
import GToggle from "../packages/grad-vue/src/components/GToggle.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GToggle", () => {
    it("sets the model to true when checked", async () => {
        const model = ref(false);
        const { instance, vm } = mnt(GToggle, {
            props: { label: "Toggle" },
            model,
        });
        const checkbox = instance
            .getByRole("checkbox")
            .element() as HTMLInputElement;

        checkbox.click();
        await vm.$nextTick();
        expect(model.value).toBe(true);
    });

    it("sets the model to false when unchecked", async () => {
        const model = ref(true);
        const { instance, vm } = mnt(GToggle, {
            props: { label: "Toggle" },
            model,
        });
        const checkbox = instance
            .getByRole("checkbox")
            .element() as HTMLInputElement;

        checkbox.click();
        await vm.$nextTick();
        expect(model.value).toBe(false);
    });

    it("sets the model to true with ArrowRight", async () => {
        const model = ref(false);
        const { vm } = mnt(GToggle, {
            props: { label: "Toggle" },
            model,
        });

        await userEvent.keyboard("{Tab}{ArrowRight}");
        await vm.$nextTick();
        expect(model.value).toBe(true);
    });

    it("sets the model to false with ArrowLeft", async () => {
        const model = ref(true);
        const { vm } = mnt(GToggle, {
            props: { label: "Toggle" },
            model,
        });

        await userEvent.keyboard("{Tab}{ArrowLeft}");
        await vm.$nextTick();
        expect(model.value).toBe(false);
    });

    describe("Accessibility", () => {
        it("passes with default props", async () => {
            await testAccessibility(GToggle, { label: "Toggle" });
        });

        it("passes with an error", async () => {
            await testAccessibility(GToggle, {
                label: "Toggle",
                error: "This is an error",
            });
        });

        it("passes when disabled", async () => {
            await testAccessibility(GToggle, {
                label: "Toggle",
                disabled: true,
            });
        });
    });
});
