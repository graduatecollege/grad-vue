/// <reference types="vite/client" />
import { defineCustomElement } from "vue";
import globalCSS from "./css/main.css?inline";

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

// Inject global CSS (design tokens, fonts, utility classes) into document head.
// CSS custom properties defined here cascade into each component's shadow DOM.
const styleId = "grad-vue-global-styles";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = globalCSS;
    document.head.appendChild(style);
}

customElements.define("g-alert-dialog", defineCustomElement(GAlertDialog));
customElements.define("g-app-header", defineCustomElement(GAppHeader));
customElements.define("g-button", defineCustomElement(GButton));
customElements.define("g-clipboard", defineCustomElement(GClipboard));
customElements.define("g-currency-input", defineCustomElement(GCurrencyInput));
customElements.define("g-date-input", defineCustomElement(GDateInput));
customElements.define("g-date-range-input", defineCustomElement(GDateRangeInput));
customElements.define("g-detail-list", defineCustomElement(GDetailList));
customElements.define("g-detail-list-item", defineCustomElement(GDetailListItem));
customElements.define("g-email-input", defineCustomElement(GEmailInput));
customElements.define("g-form", defineCustomElement(GForm));
customElements.define("g-hamburger-menu", defineCustomElement(GHamburgerMenu));
// GHistoryScroller, GSearch, GTable, and GTableBody use generic type parameters.
// defineCustomElement's TypeScript overloads don't support generic SFC signatures,
// so a cast is required. The runtime behavior is correct.
customElements.define("g-history-scroller", defineCustomElement(GHistoryScroller as any));
customElements.define("g-modal", defineCustomElement(GModal));
customElements.define("g-overlay", defineCustomElement(GOverlay));
customElements.define("g-popover", defineCustomElement(GPopover));
customElements.define("g-progress", defineCustomElement(GProgress));
customElements.define("g-search", defineCustomElement(GSearch as any));
customElements.define("g-select", defineCustomElement(GSelect));
customElements.define("g-select-button", defineCustomElement(GSelectButton));
customElements.define("g-sidebar", defineCustomElement(GSidebar));
customElements.define("g-sidebar-menu", defineCustomElement(GSidebarMenu));
customElements.define("g-submit-button", defineCustomElement(GSubmitButton));
customElements.define("g-table", defineCustomElement(GTable as any));
customElements.define("g-table-body", defineCustomElement(GTableBody as any));
customElements.define("g-table-pagination", defineCustomElement(GTablePagination));
customElements.define("g-term-selector", defineCustomElement(GTermSelector));
customElements.define("g-term-selector-control", defineCustomElement(GTermSelectorControl));
customElements.define("g-text-input", defineCustomElement(GTextInput));
customElements.define("g-three-way-toggle", defineCustomElement(GThreeWayToggle));
customElements.define("g-tree-menu", defineCustomElement(GTreeMenu));
customElements.define("g-user-menu", defineCustomElement(GUserMenu));
