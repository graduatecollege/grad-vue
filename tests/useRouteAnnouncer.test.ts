import { afterEach, describe, expect, it, vi } from "vitest";
import {
    defineComponent,
    h,
    onMounted,
    shallowRef,
    useTemplateRef,
    type Component,
} from "vue";
import { page } from "vitest/browser";
import GMain from "../packages/grad-vue/src/components/GMain.vue";
import {
    useRouteAnnouncer,
    type RouteAnnouncerLocation,
    type UseRouteAnnouncerOptions,
} from "../packages/grad-vue/src/compose/useRouteAnnouncer";
import { mnt } from "./test-utils";

type Location = RouteAnnouncerLocation & { title: string; view: Component };
type Guard = (to: Location, from: Location, failure?: unknown) => unknown;

const start: Location = { path: "/", matched: [], title: "", view: () => null };

/** A minimal stand-in for vue-router covering the API the composable uses. */
function createTestRouter() {
    const guards = new Set<Guard>();
    const current = shallowRef<Location>(start);
    return {
        current,
        afterEach(guard: Guard) {
            guards.add(guard);
            return () => guards.delete(guard);
        },
        async push(to: Omit<Location, "matched">, failure?: unknown) {
            const from = current.value;
            const location = { ...to, matched: [to.view] };
            if (!failure) {
                current.value = location;
                document.title = to.title;
            }
            await Promise.all([...guards].map((g) => g(location, from, failure)));
        },
        guards,
    };
}

function view(title: string, content: () => any = () => h("h1", title)) {
    return defineComponent(() => () => h(GMain, null, content));
}

const Home = view("Home");
const Profile = view("Profile");

function mountApp(options?: UseRouteAnnouncerOptions<Location>) {
    const router = createTestRouter();
    let result!: ReturnType<typeof useRouteAnnouncer>;
    const App = defineComponent(() => {
        result = useRouteAnnouncer(router, options);
        return () => [
            h("nav", [h("a", { href: "#" }, "Nav link")]),
            h(router.current.value.view),
        ];
    });
    const wrapper = mnt(App);
    return { router, wrapper, result: () => result };
}

function liveRegion() {
    return document.getElementById("g-route-announcer");
}

async function waitForAnnouncement(text: string) {
    await vi.waitFor(() => expect(liveRegion()?.textContent).toBe(text));
}

describe("useRouteAnnouncer", () => {
    afterEach(() => {
        document.title = "";
    });

    it("does nothing on the initial navigation", async () => {
        const { router } = mountApp();
        await router.push({ path: "/", title: "Home", view: Home });

        expect(document.activeElement).toBe(document.body);
        expect(liveRegion()?.textContent ?? "").toBe("");
    });

    it("focuses the h1 and announces the title on a new page", async () => {
        const { router, result } = mountApp();
        await router.push({ path: "/", title: "Home", view: Home });

        page.getByRole("link", { name: "Nav link" }).element().focus();
        await router.push({ path: "/profile", title: "Profile", view: Profile });

        await expect
            .element(page.getByRole("heading", { name: "Profile" }))
            .toHaveFocus();
        await waitForAnnouncement("Navigated to Profile");
        expect(result().message.value).toBe("Navigated to Profile");
        expect(liveRegion()).toHaveAttribute("aria-live", "polite");
    });

    it("focuses the main landmark when there's no h1", async () => {
        const { router } = mountApp();
        await router.push({ path: "/", title: "Home", view: Home });
        await router.push({
            path: "/empty",
            title: "Empty",
            view: view("Empty", () => h("p", "Nothing here")),
        });

        await expect.element(page.getByRole("main")).toHaveFocus();
    });

    it("ignores navigations on the same page", async () => {
        const { router } = mountApp();
        await router.push({ path: "/", title: "Home", view: Home });
        const link = page.getByRole("link", { name: "Nav link" }).element() as HTMLElement;
        link.focus();

        await router.push({ path: "/", title: "Home", view: Home, hash: "" });
        await new Promise((r) => setTimeout(r, 150));

        expect(document.activeElement).toBe(link);
        expect(liveRegion()?.textContent ?? "").toBe("");
    });

    it("ignores failed navigations", async () => {
        const { router } = mountApp();
        await router.push({ path: "/", title: "Home", view: Home });
        await router.push(
            { path: "/profile", title: "Profile", view: Profile },
            new Error("aborted"),
        );
        await new Promise((r) => setTimeout(r, 150));

        expect(document.activeElement).toBe(document.body);
        expect(liveRegion()?.textContent ?? "").toBe("");
    });

    it("doesn't steal focus the new page set itself", async () => {
        const Search = defineComponent(() => {
            const input = useTemplateRef<HTMLInputElement>("input");
            onMounted(() => input.value?.focus());
            return () =>
                h(GMain, null, () => [
                    h("h1", "Search"),
                    h("input", { ref: "input", "aria-label": "Query" }),
                ]);
        });
        const { router } = mountApp();
        await router.push({ path: "/", title: "Home", view: Home });
        await router.push({ path: "/search", title: "Search", view: Search });

        await waitForAnnouncement("Navigated to Search");
        await expect.element(page.getByLabelText("Query")).toHaveFocus();
    });

    it("moves focus even if something outside the page took it", async () => {
        const { router } = mountApp();
        await router.push({ path: "/", title: "Home", view: Home });
        const link = page.getByRole("link", { name: "Nav link" }).element() as HTMLElement;
        const button = document.createElement("button");
        button.textContent = "Menu";
        document.body.appendChild(button);
        link.focus();

        const navigation = router.push({ path: "/profile", title: "Profile", view: Profile });
        button.focus();
        await navigation;

        await expect
            .element(page.getByRole("heading", { name: "Profile" }))
            .toHaveFocus();
        button.remove();
    });

    it("respects the focus and message options", async () => {
        const { router } = mountApp({
            focus: (to) => to.path !== "/profile",
            message: (to, title) => `${title} page loaded`,
        });
        await router.push({ path: "/", title: "Home", view: Home });
        await router.push({ path: "/profile", title: "Profile", view: Profile });

        await waitForAnnouncement("Profile page loaded");
        expect(document.activeElement).toBe(document.body);
    });

    it("waits for the page to be ready", async () => {
        let resolve!: () => void;
        const { router } = mountApp({
            ready: () => new Promise<void>((r) => (resolve = r)),
        });
        await router.push({ path: "/", title: "Home", view: Home });
        const navigation = router.push({ path: "/profile", title: "Loading", view: Profile });
        await new Promise((r) => setTimeout(r, 150));
        expect(document.activeElement).toBe(document.body);
        expect(liveRegion()?.textContent ?? "").toBe("");

        document.title = "Profile";
        resolve();
        await navigation;
        await expect
            .element(page.getByRole("heading", { name: "Profile" }))
            .toHaveFocus();
        await waitForAnnouncement("Navigated to Profile");
    });

    it("only handles the latest navigation", async () => {
        const { router } = mountApp({
            ready: () => new Promise((r) => setTimeout(r, 50)),
        });
        await router.push({ path: "/", title: "Home", view: Home });
        const first = router.push({ path: "/a", title: "First", view: Profile });
        await router.push({ path: "/b", title: "Second", view: Home });
        await first;

        await waitForAnnouncement("Navigated to Second");
        await new Promise((r) => setTimeout(r, 150));
        expect(liveRegion()?.textContent).toBe("Navigated to Second");
    });

    it("re-announces the same message", async () => {
        const { router } = mountApp();
        await router.push({ path: "/", title: "Home", view: Home });
        await router.push({ path: "/a", title: "Same", view: Profile });
        await waitForAnnouncement("Navigated to Same");
        await router.push({ path: "/b", title: "Same", view: Home });
        expect(liveRegion()?.textContent).toBe("");
        await waitForAnnouncement("Navigated to Same");
    });

    it("removes the hook and live region when unmounted", async () => {
        const { router, wrapper } = mountApp();
        await router.push({ path: "/", title: "Home", view: Home });
        await router.push({ path: "/profile", title: "Profile", view: Profile });
        await waitForAnnouncement("Navigated to Profile");

        const pendingNav = router.push({
            path: "/settings",
            title: "Settings",
            view: Home,
        });
        wrapper.app.unmount();
        await pendingNav;

        expect(router.guards.size).toBe(0);
        expect(liveRegion()).toBeNull();
    });
});
