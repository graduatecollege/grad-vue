import { afterEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import GAppUpdateNotice from "../packages/grad-vue/src/components/GAppUpdateNotice.vue";
import { APP_BUILD_ID_META } from "../packages/grad-vue/src/compose/useAppUpdateCheck";
import { appBuildVersion, VERSION_URL_PLACEHOLDER } from "../packages/grad-vue/src/vite";
import { mnt, testAccessibility } from "./test-utils";

const MESSAGE = "This app has been updated. Refresh the page to see the latest changes.";

function versionUrl(buildId: string) {
    return `data:application/json,${encodeURIComponent(JSON.stringify({ buildId }))}`;
}

function regainFocus() {
    window.dispatchEvent(new Event("focus"));
}

describe("GAppUpdateNotice", () => {
    afterEach(() => {
        document.head.querySelector(`meta[name="${APP_BUILD_ID_META}"]`)?.remove();
        delete (globalThis as any).__GRAD_VUE_APP_VERSION_URL__;
    });

    it("stays hidden while the deployed build matches", async () => {
        mnt(GAppUpdateNotice, { props: { currentBuildId: "a", versionUrl: versionUrl("a") } });

        regainFocus();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(page.getByText(MESSAGE).query()).toBeNull();
    });

    it("shows when a newer build is deployed and can be dismissed", async () => {
        mnt(GAppUpdateNotice, { props: { currentBuildId: "a", versionUrl: versionUrl("b") } });

        regainFocus();
        await expect.element(page.getByRole("status").getByText(MESSAGE)).toBeVisible();
        await expect.element(page.getByRole("button", { name: "Refresh page" })).toBeVisible();

        await userEvent.click(page.getByRole("button", { name: "Not now" }));
        await expect.element(page.getByText(MESSAGE)).not.toBeInTheDocument();
    });

    it("reads the build ID and version URL set by the Vite plugin", async () => {
        const meta = document.createElement("meta");
        meta.name = APP_BUILD_ID_META;
        meta.content = "a";
        document.head.append(meta);
        (globalThis as any).__GRAD_VUE_APP_VERSION_URL__ = versionUrl("b");

        mnt(GAppUpdateNotice);

        regainFocus();
        await expect.element(page.getByText(MESSAGE)).toBeVisible();
    });

    it("does nothing without a build ID", async () => {
        mnt(GAppUpdateNotice, { props: { versionUrl: versionUrl("b") } });

        regainFocus();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(page.getByText(MESSAGE).query()).toBeNull();
    });

    it("passes accessibility tests when shown", async () => {
        const { container } = mnt(GAppUpdateNotice, {
            props: { currentBuildId: "a", versionUrl: versionUrl("b") },
        });

        regainFocus();
        await expect.element(page.getByText(MESSAGE)).toBeVisible();
        await testAccessibility(container.element() as HTMLElement);
    });
});

describe("appBuildVersion", () => {
    function setUpPlugin(ssr = false) {
        const plugin = appBuildVersion() as any;
        const emitted: any[] = [];
        plugin.configResolved({ build: { ssr } });
        plugin.buildStart.call({ emitFile: (file: any) => (emitted.push(file), "ref1") });
        return { plugin, emitted };
    }

    it("adds the build ID to index.html and emits a matching version file", () => {
        const { plugin, emitted } = setUpPlugin();

        const [tag] = plugin.transformIndexHtml();
        expect(tag.attrs.name).toBe(APP_BUILD_ID_META);
        expect(emitted).toEqual([
            { type: "asset", fileName: "version.json", source: JSON.stringify({ buildId: tag.attrs.content }) },
        ]);
    });

    it("points the update check at the emitted file relative to the chunk", () => {
        const { plugin } = setUpPlugin();

        const result = plugin.transform(`const url = ${VERSION_URL_PLACEHOLDER};`, "chunk.js");
        expect(result.code).toBe("const url = import.meta.ROLLUP_FILE_URL_ref1;");
        expect(plugin.transform("const other = 1;", "other.js")).toBeUndefined();
        expect(plugin.transform(`const url = ${VERSION_URL_PLACEHOLDER};`, "chunk.js", { ssr: true })).toBeUndefined();
    });

    it("emits nothing for SSR builds", () => {
        const { plugin, emitted } = setUpPlugin(true);

        expect(emitted).toEqual([]);
        expect(plugin.transform(`const url = ${VERSION_URL_PLACEHOLDER};`, "chunk.js")).toBeUndefined();
    });
});
