import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import GSkipLink from "../packages/grad-vue/src/components/GSkipLink.vue";
import GMain from "../packages/grad-vue/src/components/GMain.vue";
import { mnt, testAccessibility } from "./test-utils";

const Layout = defineComponent({
    props: { target: String },
    setup(props) {
        return () => [
            h(GSkipLink, { target: props.target }),
            h("nav", [h("a", { href: "#nav" }, "Nav link")]),
            h(GMain, { id: props.target }, () => h("h1", "Page")),
        ];
    },
});

describe("GSkipLink", () => {
    it("is the first tab stop and moves focus to the main landmark", async () => {
        mnt(Layout);

        await userEvent.keyboard("{Tab}");
        const link = page.getByRole("link", { name: "Skip to main content" });
        await expect.element(link).toHaveFocus();
        await expect.element(link).toHaveAttribute("href", "#main-content");

        await userEvent.keyboard("{Enter}");
        await expect.element(page.getByRole("main")).toHaveFocus();
        expect(location.hash).toBe("");
    });

    it("removes the temporary tabindex when main loses focus", async () => {
        mnt(Layout);
        const main = page.getByRole("main");

        await userEvent.keyboard("{Tab}");
        await userEvent.keyboard("{Enter}");
        await expect.element(main).toHaveFocus();
        await expect.element(main).toHaveAttribute("tabindex", "-1");

        await userEvent.keyboard("{Tab}");
        await expect.element(main).not.toHaveFocus();
        await expect.element(main).not.toHaveAttribute("tabindex");

        await userEvent.click(page.getByRole("heading", { name: "Page" }));
        await expect.element(main).not.toHaveFocus();
    });

    it("uses a custom target", async () => {
        mnt(Layout, { props: { target: "content" } });

        await userEvent.keyboard("{Tab}");
        await userEvent.keyboard("{Enter}");
        await expect
            .element(page.getByRole("main"))
            .toHaveAttribute("id", "content");
        await expect.element(page.getByRole("main")).toHaveFocus();
    });

    it("falls back to the first main element", async () => {
        const App = defineComponent(() => () => [
            h(GSkipLink),
            h("main", [h("p", "Content")]),
        ]);
        mnt(App);

        await userEvent.keyboard("{Tab}");
        await userEvent.keyboard("{Enter}");
        await expect.element(page.getByRole("main")).toHaveFocus();
    });

    it("is visually hidden until focused", async () => {
        mnt(Layout);
        const link = page.getByRole("link", { name: "Skip to main content" });
        const hidden = link.element().getBoundingClientRect();
        expect(hidden.bottom).toBeLessThanOrEqual(0);

        await userEvent.keyboard("{Tab}");
        await expect.element(link).toHaveFocus();
        const shown = link.element().getBoundingClientRect();
        expect(shown.top).toBeGreaterThanOrEqual(0);
    });

    describe("Accessibility Tests", () => {
        it("with focus", async () => {
            const { container } = mnt(Layout);
            await userEvent.keyboard("{Tab}");
            await testAccessibility(container.element() as HTMLElement);
        });
    });
});
