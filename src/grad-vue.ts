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

import "./css/main.css";

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
};

// Export a plugin for installing all components
export default {
    install(app: App) {
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
    },
};

export { calculatePopoverPosition } from "./compose/popoverPosition";
export { useOverlayEscape } from "./compose/useOverlayEscape";
export { useOverlayFocus } from "./compose/useOverlayFocus";
export {
    useOverlayStack,
    useOverlayStackState,
} from "./compose/useOverlayStack";
