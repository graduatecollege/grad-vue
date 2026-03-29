import { onBeforeUnmount, onMounted, Ref, ref, watch } from "vue";
import { useMediaQuery } from "@vueuse/core";

type SidebarChannel = {
    id: string;
    open: Ref<boolean>;
    isCollapsible: Ref<boolean>;
    toggle: () => void;
};

function normalizeKey(key: string) {
    return key.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function getChannelsStore() {
    const globalScope = globalThis as typeof globalThis & {
        __GRAD_VUE_WC_SIDEBAR_CHANNELS__?: Map<string, SidebarChannel>;
    };

    if (!globalScope.__GRAD_VUE_WC_SIDEBAR_CHANNELS__) {
        globalScope.__GRAD_VUE_WC_SIDEBAR_CHANNELS__ = new Map();
    }

    return globalScope.__GRAD_VUE_WC_SIDEBAR_CHANNELS__;
}

export function useWebComponentSidebar(
    key = "default",
    breakpoint: Ref<string> | string = "(max-width: 800px)",
) {
    const channels = getChannelsStore();
    const channelKey = key || "default";

    if (!channels.has(channelKey)) {
        const safeKey = normalizeKey(channelKey);
        channels.set(channelKey, {
            id: `g-wc-sidebar-${safeKey}`,
            open: ref(false),
            isCollapsible: useMediaQuery(breakpoint, {
                ssrWidth: 1000,
            }),
            toggle: () => undefined,
        });
    }

    const channel = channels.get(channelKey)!;
    channel.toggle = () => (channel.open.value = !channel.open.value);

    function onDocumentClick(e: MouseEvent) {
        if (!channel.isCollapsible.value || !channel.open.value) {
            return;
        }
        const target = e.target as HTMLElement;
        const sidebarEl = document.getElementById(`${channel.id}-sidebar`);
        if (!sidebarEl) {
            return;
        }
        if (sidebarEl.contains(target)) {
            return;
        }
        setTimeout(() => {
            channel.open.value = false;
        }, 5);
    }

    function onDocumentFocus(e: FocusEvent) {
        if (!channel.isCollapsible.value || !channel.open.value) {
            return;
        }
        const target = e.target as HTMLElement;
        const sidebarEl = document.getElementById(`${channel.id}-sidebar`);
        const hamburgerEl = document.getElementById(`${channel.id}-hamburger`);
        if (!sidebarEl) {
            return;
        }
        if (sidebarEl.contains(target) || hamburgerEl?.contains(target)) {
            return;
        }
        setTimeout(() => {
            channel.open.value = false;
        }, 5);
    }

    onMounted(() => {
        watch(
            channel.isCollapsible,
            (val) => {
                if (val) {
                    document.addEventListener("mousedown", onDocumentClick);
                    document.addEventListener("focusin", onDocumentFocus);
                } else {
                    document.removeEventListener("mousedown", onDocumentClick);
                    document.removeEventListener("focusin", onDocumentFocus);
                }
            },
            { immediate: true },
        );
    });

    onBeforeUnmount(() => {
        document.removeEventListener("mousedown", onDocumentClick);
        document.removeEventListener("focusin", onDocumentFocus);
    });

    return channel;
}
