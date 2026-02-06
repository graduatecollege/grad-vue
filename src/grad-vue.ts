import GButton from "./components/GButton.vue";
import GTextInput from "./components/GTextInput.vue";
import GPopover from "./components/GPopover.vue";
import GSelectButton from "./components/GSelectButton.vue";
import GProgress from "./components/GProgress.vue";
import GAlertDialog from "./components/GAlertDialog.vue";
import GSelect from "./components/GSelect.vue";
import GSearch from "./components/GSearch.vue";
import GAppHeader from "./components/GAppHeader.vue";
import GSidebar from "./components/GSidebar.vue";
import GSidebarMenu from "./components/GSidebarMenu.vue";
import GClipboard from "./components/GClipboard.vue";
import GHistoryScroller from "./components/GHistoryScroller.vue";
import GThreeWayToggle from "./components/GThreeWayToggle.vue";
import GTable from "./components/GTable.vue";
import GTablePagination from "./components/table/GTablePagination.vue";
import GTableBody from "./components/table/GTableBody.vue";
import GModal from "./components/GModal.vue";
import GHamburgerMenu from "./components/GHamburgerMenu.vue";
import GDetailList from "./components/GDetailList.vue";
import GDetailListItem from "./components/detail-list/GDetailListItem.vue";
export type { VGtooltipDirective } from "./directives/v-gtooltip.ts";
import GOverlay from "./components/GOverlay.vue";
import GTermSelector from "./components/GTermSelector.vue";
import GTermSelectorControl from "./components/term/GTermSelectorControl.vue";

import "./css/main.css";
import VGtooltip from "./directives/v-gtooltip.ts";

// Export individual components
export {
    GAppHeader,
    GButton,
    GTextInput,
    GPopover,
    GSelectButton,
    GProgress,
    GAlertDialog,
    GSelect,
    GSearch,
    GSidebar,
    GSidebarMenu,
    GClipboard,
    GHistoryScroller,
    GThreeWayToggle,
    GTable,
    GTableBody,
    GTablePagination,
    GModal,
    VGtooltip,
    GOverlay,
    GHamburgerMenu,
    GDetailList,
    GDetailListItem,
    GTermSelector,
    GTermSelectorControl,
};

export { calculatePopoverPosition } from "./compose/popoverPosition";
export { useOverlayEscape } from "./compose/useOverlayEscape";
export { useOverlayFocus } from "./compose/useOverlayFocus";
export {
    useOverlayStack,
    useOverlayStackState,
} from "./compose/useOverlayStack";

export { useActiveLinkContent } from "./compose/useActiveLink";
export { useSidebar } from "./compose/useSidebar";
export { useFiltering, filtersToQueryParams, filterOmitEmpty, filterAsQuery, asArray, emptyAsUndefined } from "./compose/useFiltering";
export { useTableChanges } from "./compose/useTableChanges";
export type {
    FilteringOptions,
    UseFilteringReturn,
    FiltersForRecord,
} from "./compose/useFiltering";
export type {
    UseTableChangesReturn,
    CellChange,
    ChangeMap,
} from "./compose/useTableChanges";
export type {
    SelectColumnFilter,
    MultiSelectColumnFilter,
    TableColumnFilter,
    ToggleColumnFilter,
    TableColumn,
} from "./components/table/TableColumn";
