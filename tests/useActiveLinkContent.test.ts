import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, onMounted, ref } from "vue";
import { useActiveLinkContent } from "../packages/grad-vue/src/grad-vue";
import { mnt } from "./test-utils";

type MockIntersectionEntry = Pick<
    IntersectionObserverEntry,
    "intersectionRatio" | "isIntersecting" | "target"
>;

let observerCallback: IntersectionObserverCallback | null = null;
const observeMock = vi.fn<(element: Element) => void>();
const disconnectMock = vi.fn();

class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly thresholds = [0];
    readonly scrollMargin = "0px";

    constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
    }

    disconnect() {
        disconnectMock();
    }

    observe(element: Element) {
        observeMock(element);
    }

    takeRecords() {
        return [];
    }

    unobserve() {
        //
    }
}

const ChildSection = defineComponent({
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        return () => h("section", { id: props.id }, props.id);
    },
});

const DelayedContentFixture = defineComponent({
    components: {
        ChildSection,
    },
    setup() {
        const activeId = ref("");
        const content = ref<HTMLElement | null>(null);
        const isVisible = ref(false);

        useActiveLinkContent(content, 0, activeId);

        onMounted(async () => {
            isVisible.value = true;
            await nextTick();
        });

        return () =>
            h("div", [
                isVisible.value
                ? h("div", { ref: content }, [
                      h(ChildSection, { id: "section-1" }),
                      h(ChildSection, { id: "section-2" }),
                  ])
                : null,
                h("output", { "data-testid": "active-id" }, activeId.value),
            ]);
    },
});

function emitIntersection(entries: MockIntersectionEntry[]) {
    if (!observerCallback) {
        throw new Error("Intersection observer callback was not registered.");
    }

    observerCallback(
        entries as IntersectionObserverEntry[],
        {} as IntersectionObserver,
    );
}

describe("useActiveLinkContent", () => {
    beforeEach(() => {
        observerCallback = null;
        observeMock.mockReset();
        disconnectMock.mockReset();
        vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("observes the initial children when the container appears after mount", async () => {
        const { container, vm } = mnt(DelayedContentFixture);

        await vm.$nextTick();
        await vi.waitUntil(() => observeMock.mock.calls.length === 2);

        const observedIds = observeMock.mock.calls.map(([element]) =>
            (element as HTMLElement).id,
        );
        expect(observedIds).toEqual(["section-1", "section-2"]);

        emitIntersection([
            {
                target: container.element().querySelector("#section-2")!,
                isIntersecting: true,
                intersectionRatio: 1,
            },
        ]);

        await vi.waitUntil(
            () =>
                container
                    .element()
                    .querySelector("[data-testid='active-id']")?.textContent ===
                "section-2",
        );
    });
});
