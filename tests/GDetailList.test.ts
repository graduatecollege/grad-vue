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

            await expect.element(wrapper.instance).toHaveTextContent("Major");
            await expect.element(wrapper.instance).toHaveTextContent("Engineering");
            await expect.element(wrapper.instance).toHaveTextContent("Department Code");
            await expect.element(wrapper.instance).toHaveTextContent("123");
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
