import { describe, expect, it, vi } from "vitest";
import { h, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import GTooltip from "../packages/grad-vue/src/components/GTooltip.vue";
import { mnt, testAccessibility } from "./test-utils";

/**
 * There are no semantic assertions for opacity as far as I know,
 * so we use this helper.
 */
async function expectTooltipShown() {
    await expect.poll(() => (document.querySelector("[role='tooltip']") as HTMLElement | null)?.style.opacity).toBe("1");
}

async function expectTooltipHidden() {
    await expect.poll(() => (document.querySelector("[role='tooltip']") as HTMLElement | null)?.style.opacity).toBe("0");
}

describe("GTooltip", () => {
    describe("Functional Tests", () => {
        it("renders tooltip text", async () => {
            mnt(GTooltip, {
                props: {
                    text: "Help text",
                },
                slots: {
                    trigger: () => h("button", { id: "tooltip-trigger" }, "Help"),
                },
            });

            await expect.element(page.getByRole("tooltip")).toHaveTextContent("Help text");
        });

        it("sets aria-describedby on the trigger", async () => {
            mnt(GTooltip, {
                props: {
                    text: "Help text",
                },
                slots: {
                    trigger: () => h("button", { id: "tooltip-trigger" }, "Help"),
                },
            });

            await expect
                .poll(() => document.getElementById("tooltip-trigger")?.getAttribute("aria-describedby"))
                .toBeTruthy();
        });

        it("shows the tooltip on trigger hover", async () => {
            mnt(GTooltip, {
                props: {
                    text: "Help text",
                },
                slots: {
                    trigger: () => h("button", { id: "tooltip-trigger" }, "Help"),
                },
            });

            const trigger = page.getByRole("button", { name: "Help" });

            await userEvent.hover(trigger);
            await expectTooltipShown();
        });

        it("hides the tooltip on trigger unhover", async () => {
            mnt(GTooltip, {
                props: {
                    text: "Help text",
                },
                slots: {
                    trigger: () => h("button", { id: "tooltip-trigger" }, "Help"),
                },
            });

            const trigger = page.getByRole("button", { name: "Help" });

            await userEvent.hover(trigger);
            await expectTooltipShown();

            await userEvent.unhover(trigger);
            await expectTooltipHidden();
        });

        it("shows the tooltip through show() without a trigger slot", async () => {
            const tooltipRef = ref<any>(null);

            mnt({
                setup() {
                    return { tooltipRef };
                },
                render() {
                    return [
                        h("button", { id: "sibling-anchor" }, "Sibling anchor"),
                        h(GTooltip, { ref: "tooltipRef", text: "Sibling text" }),
                    ];
                },
            });

            tooltipRef.value.show();
            await expectTooltipShown();
        });

        it("hides the tooltip through hide() without a trigger slot", async () => {
            const tooltipRef = ref<any>(null);

            mnt({
                setup() {
                    return { tooltipRef };
                },
                render() {
                    return [
                        h("button", { id: "sibling-anchor" }, "Sibling anchor"),
                        h(GTooltip, { ref: "tooltipRef", text: "Sibling text" }),
                    ];
                },
            });

            tooltipRef.value.show();
            await expectTooltipShown();

            tooltipRef.value.hide();
            await expectTooltipHidden();
        });

        it("sets aria-describedby when using a trigger slot", async () => {
            mnt(GTooltip, {
                props: {
                    text: "Help text",
                },
                slots: {
                    trigger: () => h("button", { id: "tooltip-trigger-slot" }, "Help"),
                },
            });

            await expect
                .poll(() => document.getElementById("tooltip-trigger-slot")?.getAttribute("aria-describedby"))
                .toBeTruthy();
        });

        it("shows the tooltip through exposed show()", async () => {
            const tooltipRef = ref<any>(null);

            mnt(
                {
                    setup() {
                        return { tooltipRef };
                    },
                    render() {
                        return h(
                            GTooltip,
                            {
                                ref: "tooltipRef",
                                text: "Programmatic tooltip",
                            },
                            {
                                trigger: () => h("button", "Programmatic"),
                            },
                        );
                    },
                },
            );

            tooltipRef.value.show();
            await expectTooltipShown();
        });

        it("hides the tooltip through exposed hide()", async () => {
            const tooltipRef = ref<any>(null);

            mnt(
                {
                    setup() {
                        return { tooltipRef };
                    },
                    render() {
                        return h(
                            GTooltip,
                            {
                                ref: "tooltipRef",
                                text: "Programmatic tooltip",
                            },
                            {
                                trigger: () => h("button", "Programmatic"),
                            },
                        );
                    },
                },
            );

            tooltipRef.value.show();
            await expectTooltipShown();

            tooltipRef.value.hide();
            await expectTooltipHidden();
        });

        it("toggles tooltip visibility through exposed toggle()", async () => {
            const tooltipRef = ref<any>(null);

            mnt(
                {
                    setup() {
                        return { tooltipRef };
                    },
                    render() {
                        return h(
                            GTooltip,
                            {
                                ref: "tooltipRef",
                                text: "Programmatic tooltip",
                            },
                            {
                                trigger: () => h("button", "Programmatic"),
                            },
                        );
                    },
                },
            );

            tooltipRef.value.toggle();
            await expectTooltipShown();

            tooltipRef.value.toggle();
            await expectTooltipHidden();
        });

        it("emits tooltip-hide after closing", async () => {
            const onHide = vi.fn();

            mnt(
                GTooltip,
                {
                    props: {
                        text: "Sibling anchored tooltip",
                        onTooltipHide: onHide,
                    },
                    slots: {
                        trigger: () => h("button", { id: "anchor-no-trigger" }, "Anchor"),
                    },
                },
            );

            const anchor = page.getByRole("button", { name: "Anchor" });

            await userEvent.hover(anchor);
            await expectTooltipShown();

            await userEvent.unhover(anchor);
            await expectTooltipHidden();

            await vi.waitUntil(() => onHide.mock.calls.length > 0, {
                timeout: 1000,
                interval: 10,
            });
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility checks with trigger content", async () => {
            await testAccessibility(
                GTooltip,
                {
                    text: "Accessible tooltip",
                },
                {
                    trigger: () => h("button", "Accessible trigger"),
                },
            );
        });
    });
});