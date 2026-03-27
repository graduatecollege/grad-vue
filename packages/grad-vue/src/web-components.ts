import { defineCustomElement, type App, type Component } from "vue";
import "./css/main.css";

import GAlertDialog from "./components/GAlertDialog.vue";
import GAppHeader from "./components/GAppHeader.vue";
import GButton from "./components/GButton.vue";
import GClipboard from "./components/GClipboard.vue";
import GCurrencyInput from "./components/GCurrencyInput.vue";
import GDateInput from "./components/GDateInput.vue";
import GDateRangeInput from "./components/GDateRangeInput.vue";
import GDetailList from "./components/GDetailList.vue";
import GDetailListItem from "./components/detail-list/GDetailListItem.vue";
import GEmailInput from "./components/GEmailInput.vue";
import GForm from "./components/GForm.vue";
import GHamburgerMenu from "./components/GHamburgerMenu.vue";
import GHistoryScroller from "./components/GHistoryScroller.vue";
import GModal from "./components/GModal.vue";
import GOverlay from "./components/GOverlay.vue";
import GPopover from "./components/GPopover.vue";
import GProgress from "./components/GProgress.vue";
import GSearch from "./components/GSearch.vue";
import GSelect from "./components/GSelect.vue";
import GSelectButton from "./components/GSelectButton.vue";
import GSidebar from "./components/GSidebar.vue";
import GSidebarMenu from "./components/GSidebarMenu.vue";
import GSubmitButton from "./components/GSubmitButton.vue";
import GTable from "./components/GTable.vue";
import GTableBody from "./components/table/GTableBody.vue";
import GTablePagination from "./components/table/GTablePagination.vue";
import GTermSelector from "./components/GTermSelector.vue";
import GTermSelectorControl from "./components/term/GTermSelectorControl.vue";
import GTextInput from "./components/GTextInput.vue";
import GThreeWayToggle from "./components/GThreeWayToggle.vue";
import GTreeMenu from "./components/GTreeMenu.vue";
import GUserMenu from "./components/GUserMenu.vue";

const globalScope = globalThis as typeof globalThis & {
    __GRAD_VUE_WC_APP_ID__?: number;
};

const ceOptions = {
    shadowRoot: false,
    configureApp(app: App) {
        const nextId = (globalScope.__GRAD_VUE_WC_APP_ID__ ?? 0) + 1;
        globalScope.__GRAD_VUE_WC_APP_ID__ = nextId;
        app.config.idPrefix = `g-wc-${nextId}-`;
    },
};

const components: [string, Component][] = [
    ["g-alert-dialog", GAlertDialog],
    ["g-app-header", GAppHeader],
    ["g-button", GButton],
    ["g-clipboard", GClipboard],
    ["g-currency-input", GCurrencyInput],
    ["g-date-input", GDateInput],
    ["g-date-range-input", GDateRangeInput],
    ["g-detail-list", GDetailList],
    ["g-detail-list-item", GDetailListItem],
    ["g-email-input", GEmailInput],
    ["g-form", GForm],
    ["g-hamburger-menu", GHamburgerMenu],
    // GHistoryScroller, GSearch, GTable, and GTableBody use generic type parameters.
    // defineCustomElement's TypeScript overloads don't support generic SFC signatures,
    // so a cast is required. The runtime behavior is correct.
    ["g-history-scroller", GHistoryScroller as any],
    ["g-modal", GModal],
    ["g-overlay", GOverlay],
    ["g-popover", GPopover],
    ["g-progress", GProgress],
    ["g-search", GSearch as any],
    ["g-select", GSelect],
    ["g-select-button", GSelectButton],
    ["g-sidebar", GSidebar],
    ["g-sidebar-menu", GSidebarMenu],
    ["g-submit-button", GSubmitButton],
    ["g-table", GTable as any],
    ["g-table-body", GTableBody as any],
    ["g-table-pagination", GTablePagination],
    ["g-term-selector", GTermSelector],
    ["g-term-selector-control", GTermSelectorControl],
    ["g-text-input", GTextInput],
    ["g-three-way-toggle", GThreeWayToggle],
    ["g-tree-menu", GTreeMenu],
    ["g-user-menu", GUserMenu],
];

const allStyles: string[] = [];

function collectStyles(comp: any) {
    const def = comp.__vccOpts || comp;
    if (def.styles) {
        allStyles.push(...def.styles);
    }
    // Recurse into sub-components so their styles are also collected.
    const children = def.components;
    if (children) {
        for (const child of Object.values(children)) {
            collectStyles(child);
        }
    }
}

for (const [tagName, comp] of components) {
    collectStyles(comp);
    const ce = defineCustomElement(comp as any, ceOptions);
    customElements.define(tagName, ce);
}

if (allStyles.length > 0 && typeof document !== "undefined") {
    const style = document.createElement("style");
    style.setAttribute("data-grad-vue-elements", "");
    style.textContent = allStyles.join("\n");
    document.head.appendChild(style);
}
