import type { App } from "vue";
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
};

// Export a plugin for installing all components
export default {
    install(app: App) {
        app.directive("gtooltip", VGtooltip)
        app.component("GAppHeader", GAppHeader);
        app.component("GButton", GButton);
        app.component("GTextInput", GTextInput);
        app.component("GPopover", GPopover);
        app.component("GSelectButton", GSelectButton);
        app.component("GProgress", GProgress);
        app.component("GAlertDialog", GAlertDialog);
        app.component("GSelect", GSelect);
        app.component("GSearch", GSearch);
        app.component("GSidebar", GSidebar);
        app.component("GSidebarMenu", GSidebarMenu);
        app.component("GClipboard", GClipboard);
        app.component("GHistoryScroller", GHistoryScroller);
        app.component("GThreeWayToggle", GThreeWayToggle);
        app.component("GTable", GTable);
        app.component("GTableBody", GTableBody);
        app.component("GTablePagination", GTablePagination);
    },
};

export { calculatePopoverPosition } from "./compose/popoverPosition";
export { useOverlayEscape } from "./compose/useOverlayEscape";
export { useOverlayFocus } from "./compose/useOverlayFocus";
export {
    useOverlayStack,
    useOverlayStackState,
} from "./compose/useOverlayStack";

export { useActiveLinkContent } from "./compose/useActiveLink";
export { useFiltering } from "./compose/useFiltering";
export type { SelectColumnFilter, MultiSelectColumnFilter, TableColumnFilter, ToggleColumnFilter, TableColumn } from "./components/table/TableColumn";