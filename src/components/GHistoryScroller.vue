<script lang="ts" setup generic="T extends { id: string | number }">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useResizeObserver } from "@vueuse/core";
import GButton from "./GButton.vue";

type Props = {
    entries: T[];
};

const props = withDefaults(defineProps<Props>(), {
    entries: () => [],
});

const scrollerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
const isAtBottom = ref(true);
const isAtTop = ref(true);

async function scrollToBottom({ focusLast = false } = {}) {
    if (scrollerRef.value) {
        scrollerRef.value.scrollTop = scrollerRef.value.scrollHeight;
    }
    if (focusLast) {
        if (contentRef.value) {
            const items = contentRef.value.querySelectorAll(".g-history-entry");
            if (items.length > 0) {
                const last = items[items.length - 1] as HTMLElement;
                console.log("focusing", last, last.tabIndex);
                await nextTick();
                last.focus();
            }
        }
    }
}

function handleScroll() {
    if (!scrollerRef.value) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollerRef.value;
    // Consider within 2px of bottom/top as "at bottom/top"
    isAtBottom.value = scrollTop + clientHeight >= scrollHeight -2;
    isAtTop.value = scrollTop <= 2;


}

onMounted(() => {
    nextTick(scrollToBottom);
});

// Use VueUse's useResizeObserver for scroller and content
useResizeObserver(scrollerRef, () => {
    if (isAtBottom.value) {
        scrollToBottom();
    }
});
useResizeObserver(contentRef, () => {
    if (isAtBottom.value) {
        scrollToBottom();
    }
});

watch(
    () => props.entries,
    async () => {
        // Only scroll if at bottom
        if (isAtBottom.value) {
            await nextTick();
            scrollToBottom();
        }
    },
);

const reversedEntries = computed(() => [...props.entries].reverse());
</script>

<template>
    <div class="g-history-scroller-wrapper">
        <div
            v-if="!isAtTop"
            class="g-history-shadow g-history-shadow--top"
            aria-hidden="true"
        ></div>
        <div
            v-if="!isAtBottom"
            class="g-history-shadow g-history-shadow--bottom"
            aria-hidden="true"
        ></div>
        <div
            ref="scrollerRef"
            class="g-history-scroller"
            role="log"
            aria-live="polite"
            @scroll="handleScroll"
        >
            <GButton
                class="g-scroll-to-bottom-btn"
                :class="{ 'scroll-to-bottom-btn--hidden': isAtBottom }"
                size="small"
                type="button"
                @click="() => scrollToBottom({ focusLast: true })"
                aria-label="Jump to Latest"
            >
                <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 640"
                    height="1.25rem"
                >
                    <path
                        fill="currentColor"
                        d="M303.5 569C312.9 578.4 328.1 578.4 337.4 569L505.4 401C514.8 391.6 514.8 376.4 505.4 367.1C496 357.8 480.8 357.7 471.5 367.1L344.5 494.1L344.5 88C344.5 74.7 333.8 64 320.5 64C307.2 64 296.5 74.7 296.5 88L296.5 494.1L169.5 367.1C160.1 357.7 144.9 357.7 135.6 367.1C126.3 376.5 126.2 391.7 135.6 401L303.6 569z"
                    />
                </svg>
            </GButton>
            <div role="list" ref="contentRef" class="g-history-list">
                <div
                    v-for="entry in reversedEntries"
                    role="listitem"
                    :key="entry.id"
                    class="g-history-entry"
                    tabindex="-1"
                >
                    <slot :entry="entry" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.g-history-scroller-wrapper {
    position: relative;
}
.g-history-list {
    padding: 1rem;
    margin: 0;
    list-style: none;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.g-history-scroller {
    overflow-y: auto;
    height: 100%;
    width: 100%;
}
.g-history-entry {
    margin: 0;
    padding: 0;
}
.g-scroll-to-bottom-btn {
    position: absolute;
    right: 2rem;
    bottom: 2rem;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.scroll-to-bottom-btn--hidden {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
}
.scroll-to-bottom-btn--hidden:focus {
    opacity: 1;
    pointer-events: auto;
}

.g-history-shadow {
    position: absolute;
    left: 0;
    right: 0;
    height: 2rem;
    pointer-events: none;
    position: absolute;
}
.g-history-shadow--top {
    top: 0;
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.12),
        rgba(0, 0, 0, 0)
    );
}
.g-history-shadow--bottom {
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0));
}
</style>
