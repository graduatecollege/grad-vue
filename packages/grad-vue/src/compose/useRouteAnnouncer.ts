import {
    getCurrentScope,
    nextTick,
    onScopeDispose,
    readonly,
    ref,
    type Ref,
} from "vue";

/**
 * The subset of a vue-router route location used by `useRouteAnnouncer`.
 */
export interface RouteAnnouncerLocation {
    path: string;
    hash?: string;
    matched?: readonly unknown[];
}

/**
 * The subset of a vue-router `Router` used by `useRouteAnnouncer`.
 * grad-vue doesn't depend on vue-router, so any compatible object works.
 */
export interface RouteAnnouncerRouter<
    L extends RouteAnnouncerLocation = RouteAnnouncerLocation,
> {
    afterEach(guard: (to: L, from: L, failure?: unknown) => unknown): () => void;
}

export interface UseRouteAnnouncerOptions<
    L extends RouteAnnouncerLocation = RouteAnnouncerLocation,
> {
    /**
     * Id of the main landmark (see `GMain`). Falls back to the first `<main>`.
     * @default "main-content"
     */
    mainId?: string;
    /**
     * Whether a navigation leads to a different page. Navigations that stay
     * on the same page (query or hash changes like filters and tabs) are
     * ignored. By default, a different path means a different page.
     */
    isNewPage?: (to: L, from: L) => boolean;
    /**
     * Whether to move focus to the new page's `<h1>` (or main landmark).
     * @default true
     */
    focus?: boolean | ((to: L, from: L) => boolean);
    /**
     * Waits before moving focus and announcing, for pages that load their
     * title or heading asynchronously. Resolve when the page is ready; use a
     * timeout so a failed load doesn't block the announcement.
     */
    ready?: (to: L, from: L) => unknown;
    /**
     * Builds the announcement. Defaults to "Navigated to {document.title}".
     * Return an empty string to skip the announcement.
     */
    message?: (to: L, title: string) => string;
}

export interface UseRouteAnnouncerReturn {
    /**
     * The most recent announcement.
     */
    message: Readonly<Ref<string>>;
    /**
     * Announce a message in the polite live region.
     */
    announce: (text: string) => void;
    /**
     * Remove the router hook and live region.
     */
    stop: () => void;
}

const LIVE_REGION_ID = "g-route-announcer";

function findMain(mainId: string): HTMLElement | null {
    return (
        document.getElementById(mainId) ??
        document.querySelector<HTMLElement>("main")
    );
}

/**
 * Focuses the main landmark identified by `mainId` (or the first `<main>`).
 * When `preferHeading` is set, focuses its first `<h1>` instead if possible.
 *
 * @returns whether focus was moved
 */
export function focusMainTarget(
    mainId = "main-content",
    preferHeading = true,
): boolean {
    if (typeof document === "undefined") {
        return false;
    }
    const main = findMain(mainId);
    if (!main) {
        return false;
    }
    const heading = preferHeading
        ? main.querySelector<HTMLElement>("h1")
        : null;
    for (const target of [heading, main]) {
        if (!target) {
            continue;
        }
        if (!target.hasAttribute("tabindex")) {
            target.setAttribute("tabindex", "-1");
        }
        target.focus({ preventScroll: preferHeading });
        if (document.activeElement === target) {
            return true;
        }
    }
    return false;
}

function getLiveRegion(): { el: HTMLElement; created: boolean } {
    const existing = document.getElementById(LIVE_REGION_ID);
    if (existing) {
        return { el: existing, created: false };
    }
    const el = document.createElement("div");
    el.id = LIVE_REGION_ID;
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-atomic", "true");
    Object.assign(el.style, {
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clipPath: "inset(50%)",
        whiteSpace: "nowrap",
        border: "0",
    });
    document.body.appendChild(el);
    return { el, created: true };
}

function nextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Makes client-side route changes accessible:
 *
 * - Moves focus to the new page's `<h1>` inside the main landmark, or the
 *   landmark itself, so keyboard and screen reader users start at the new
 *   content instead of the link they activated.
 * - Announces the new page title in a polite live region.
 *
 * The initial page load, failed navigations, and navigations within the same
 * page are ignored. Focus isn't moved when the route has a hash or when the
 * new page already moved focus into its main content (for example, with
 * autofocus).
 *
 * Call once, typically in the root `App.vue` setup:
 *
 * ```ts
 * const router = useRouter();
 * useRouteAnnouncer(router);
 * ```
 */
export function useRouteAnnouncer<
    L extends RouteAnnouncerLocation = RouteAnnouncerLocation,
>(
    router: RouteAnnouncerRouter<L>,
    options: UseRouteAnnouncerOptions<L> = {},
): UseRouteAnnouncerReturn {
    const message = ref("");
    const {
        mainId = "main-content",
        isNewPage = (to, from) => to.path !== from.path,
        focus = true,
        ready,
        message: buildMessage = (_to, title) =>
            title ? `Navigated to ${title}` : "",
    } = options;

    if (typeof window === "undefined") {
        return { message: readonly(message), announce: () => {}, stop: () => {} };
    }

    let region: { el: HTMLElement; created: boolean } | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending = 0;

    function announce(text: string) {
        message.value = text;
        region ??= getLiveRegion();
        const el = region.el;
        el.textContent = "";
        clearTimeout(timer);
        // Clearing first and setting after a delay makes repeated text announce again
        timer = setTimeout(() => {
            el.textContent = text;
        }, 100);
    }

    const removeHook = router.afterEach(async (to, from, failure) => {
        if (failure || !from.matched?.length || !isNewPage(to, from)) {
            return;
        }
        const id = ++pending;
        const activeBefore = document.activeElement;

        await nextTick();
        await nextFrame();
        if (ready) {
            await ready(to, from);
            await nextTick();
            await nextFrame();
        }
        if (id !== pending) {
            return;
        }

        const shouldFocus =
            typeof focus === "function" ? focus(to, from) : focus;
        const active = document.activeElement;
        const focusClaimed =
            !!active &&
            active !== activeBefore &&
            !!findMain(mainId)?.contains(active);
        if (shouldFocus && !to.hash && !focusClaimed) {
            focusMainTarget(mainId);
        }

        const text = buildMessage(to, document.title);
        if (text) {
            announce(text);
        }
    });

    function stop() {
        ++pending;
        removeHook();
        clearTimeout(timer);
        if (region?.created) {
            region.el.remove();
        }
        region = null;
    }

    if (getCurrentScope()) {
        onScopeDispose(stop);
    }

    return { message: readonly(message), announce, stop };
}
