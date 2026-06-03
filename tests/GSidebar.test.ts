import { afterEach, describe, expect, it } from "vitest";
import GSidebar from "../packages/grad-vue/src/components/GSidebar.vue";
import { mounts } from "./setup";
import { testAccessibility } from "./test-utils";
import { createApp, h, nextTick } from "vue";

describe("GSidebar", () => {
    describe("Scroll Position", () => {
        let scrollTestKeyCounter = 0;

        function uniqueScrollKey() {
            return `test-sidebar-scroll-${++scrollTestKeyCounter}`;
        }

        async function waitForAnimationFrame() {
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => resolve());
            });
        }

        function mountScrollableSidebar(storageKey?: string, hidden = false) {
            const host = document.createElement("div");
            if (hidden) {
                host.style.display = "none";
            }
            document.body.appendChild(host);

            const app = createApp({
                render() {
                    return h(
                        GSidebar,
                        {
                            storageKey,
                            topOffset: "0",
                            width: "300px",
                        },
                        {
                            default: () => [
                                h("div", { style: "height: 1600px;" }),
                                h("div", null, "Sidebar content"),
                            ],
                        },
                    );
                },
            });

            app.mount(host);

            mounts.push(() => {
                app.unmount();
                host.remove();
            });

            return {
                host,
                sidebar: host.querySelector<HTMLElement>(".g-sidebar")!,
            };
        }

        afterEach(() => {
            for (let i = 1; i <= scrollTestKeyCounter; i++) {
                sessionStorage.removeItem(`test-sidebar-scroll-${i}:scroll`);
            }
        });

        it("scrolling the sidebar saves scroll position to sessionStorage", async () => {
            const key = uniqueScrollKey();
            const { sidebar } = mountScrollableSidebar(key);

            await nextTick();
            sidebar.scrollTop = 42;
            sidebar.dispatchEvent(new Event("scroll"));
            await nextTick();

            expect(JSON.parse(sessionStorage.getItem(`${key}:scroll`)!)).toBe(42);
        });

        it("restores scroll position from sessionStorage on mount", async () => {
            const key = uniqueScrollKey();
            sessionStorage.setItem(`${key}:scroll`, "75");
            const { sidebar } = mountScrollableSidebar(key);

            expect(sidebar.scrollTop).toBe(75);
        });

        it("restores scroll after a hidden sidebar becomes visible", async () => {
            const key = uniqueScrollKey();
            sessionStorage.setItem(`${key}:scroll`, "75");
            const { host, sidebar } = mountScrollableSidebar(key, true);

            await nextTick();
            expect(sidebar.scrollTop).toBe(0);
            expect(sidebar.classList.contains("g-sidebar--restore-pending")).toBe(true);

            host.style.display = "block";
            await waitForAnimationFrame();
            await nextTick();

            expect(sidebar.scrollTop).toBe(75);
            expect(sidebar.classList.contains("g-sidebar--restore-pending")).toBe(false);
        });

        it("does not save scroll position when no storageKey is set", async () => {
            const { sidebar } = mountScrollableSidebar();

            await nextTick();
            sidebar.scrollTop = 42;
            sidebar.dispatchEvent(new Event("scroll"));
            await nextTick();

            expect(sessionStorage.length).toBe(0);
        });
    });

    describe("Accessibility Tests", () => {
        it("with content", async () => {
            await testAccessibility(
                GSidebar,
                { label: "Navigation" },
                {
                    default:
                        () => h("div", { class: "g-dark-content" }, [
                            h("h2", {}, "Sidebar content"),
                            h("p", {}, "Paragraph in sidebar "),
                            h("a", { href: "#" }, "With Link"),
                        ]),
                },
            );
        });
    });
});
