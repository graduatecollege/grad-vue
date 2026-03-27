import { defineCustomElement, type App } from "vue";
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

// Shadow DOM is disabled so that Teleport (used by GModal and others) works
// correctly, CSS applies without encapsulation issues, and accessibility is
// not hindered by the shadow DOM boundary.
//
// Each custom element creates its own Vue app instance. Without a unique
// idPrefix, all instances start their useId() counter from the same value,
// producing duplicate IDs on the page. We assign a monotonically increasing
// prefix to each app so IDs are globally unique.
let ceInstanceCount = 0;

const noShadow = {
    shadowRoot: false as const,
    configureApp(app: App) {
        app.config.idPrefix = `ce-${ceInstanceCount++}`;
    },
};

// Vue 3.5 skips style injection when shadowRoot is false (it only injects into
// shadow roots). We inject each component's styles manually into document.head
// the first time that component type is registered. Using a Set keyed on the
// component object prevents duplicate <style> elements on the page.
const injectedComponents = new Set<object>();

function injectStyles(component: any) {
    if (!component?.styles?.length || injectedComponents.has(component)) return;
    injectedComponents.add(component);
    component.styles.forEach((css: string) => {
        const style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
    });
}

// GHistoryScroller, GSearch, GTable, and GTableBody use generic type parameters.
// defineCustomElement's TypeScript overloads don't support generic SFC signatures,
// so a cast is required. The runtime behavior is correct.
function define(tag: string, component: any) {
    injectStyles(component);
    customElements.define(tag, defineCustomElement(component, noShadow));
}

define("g-alert-dialog", GAlertDialog);
define("g-app-header", GAppHeader);
define("g-button", GButton);
define("g-clipboard", GClipboard);
define("g-currency-input", GCurrencyInput);
define("g-date-input", GDateInput);
define("g-date-range-input", GDateRangeInput);
define("g-detail-list", GDetailList);
define("g-detail-list-item", GDetailListItem);
define("g-email-input", GEmailInput);
define("g-form", GForm);
define("g-hamburger-menu", GHamburgerMenu);
define("g-history-scroller", GHistoryScroller);
define("g-modal", GModal);
define("g-overlay", GOverlay);
define("g-popover", GPopover);
define("g-progress", GProgress);
define("g-search", GSearch);
define("g-select", GSelect);
define("g-select-button", GSelectButton);
define("g-sidebar", GSidebar);
define("g-sidebar-menu", GSidebarMenu);
define("g-submit-button", GSubmitButton);
define("g-table", GTable);
define("g-table-body", GTableBody);
define("g-table-pagination", GTablePagination);
define("g-term-selector", GTermSelector);
define("g-term-selector-control", GTermSelectorControl);
define("g-text-input", GTextInput);
define("g-three-way-toggle", GThreeWayToggle);
define("g-tree-menu", GTreeMenu);
define("g-user-menu", GUserMenu);
