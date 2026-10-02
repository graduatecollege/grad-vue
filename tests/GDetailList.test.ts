import { describe, it, expect } from "vitest";
import { defineComponent, h } from "vue";
import GDetailList from "../packages/grad-vue/src/components/GDetailList.vue";
import GDetailListItem from "../packages/grad-vue/src/components/detail-list/GDetailListItem.vue";
import { mnt, testAccessibility } from "./test-utils";

describe("GDetailList", () => {
    const Fixture = defineComponent({
        props: {
            variant: {
                default: "grid" as "grid" | "vertical",
            },
        },
        setup(props) {
            return () =>
                h(
                    GDetailList,
                    { variant: props.variant, ariaLabel: "Detail list" },
                    {
                        default: () => [
                            h(
                                GDetailListItem,
                                { label: "Major" },
                                () => "Engineering",
                            ),
                            h(
                                GDetailListItem,
                                { label: "Department Code" },
                                () => "123",
                            ),
                        ],
                    },
                );
        },
    });

    describe("Functional Tests", () => {
        it("renders labels and values", async () => {
            const wrapper = mnt(Fixture);

            const labels = wrapper.instance.getByRole("term");
            const values = wrapper.instance.getByRole("definition");

            await expect.element(labels.nth(0)).toHaveTextContent("Major");
            await expect.element(values.nth(0)).toHaveTextContent("Engineering");
            await expect.element(labels.nth(1)).toHaveTextContent("Department Code");
            await expect.element(values.nth(1)).toHaveTextContent("123");
        });
    });

    describe("Accessibility Tests", () => {
        it("passes accessibility tests (grid)", async () => {
            await testAccessibility(Fixture, { variant: "grid" });
        });

        it("passes accessibility tests (vertical)", async () => {
            await testAccessibility(Fixture, { variant: "vertical" });
        });
    });
});
