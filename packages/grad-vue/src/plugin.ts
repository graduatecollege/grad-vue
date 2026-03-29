import type { App } from "vue";
import {
    GAlertDialog,
    GAppHeader,
    GButton,
    GClipboard,
    GDetailList,
    GDetailListItem,
    GHamburgerMenu,
    GHistoryScroller,
    GModal,
    GOverlay,
    GPopover,
    GTooltip,
    GProgress,
    GSearch,
    GSelect,
    GSelectButton,
    GSidebar,
    GSidebarMenu,
    GTable,
    GTableBody,
    GTablePagination,
    GTextInput,
    GThreeWayToggle,
    GTermSelector,
    GTermSelectorControl,
    GTreeMenu,
    GUserMenu,
    GCurrencyInput,
    GEmailInput,
    GFileInput,
    GDateInput,
    GDateRangeInput,
    GForm,
    GSubmitButton,
    GCheckboxGroup,
    GTextarea,
    VGtooltip,
    VGtooltipDirective,
} from "./grad-vue.ts";

// Export a plugin for installing all components
export default {
    install(app: App) {
        app.directive("gtooltip", VGtooltip);
        app.component("GAppHeader", GAppHeader);
        app.component("GButton", GButton);
        app.component("GTextInput", GTextInput);
        app.component("GPopover", GPopover);
        app.component("GTooltip", GTooltip);
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
        app.component("GModal", GModal);
        app.component("GOverlay", GOverlay);
        app.component("GHamburgerMenu", GHamburgerMenu);
        app.component("GDetailList", GDetailList);
        app.component("GDetailListItem", GDetailListItem);
        app.component("GTermSelector", GTermSelector);
        app.component("GTermSelectorControl", GTermSelectorControl);
        app.component("GTreeMenu", GTreeMenu);
        app.component("GUserMenu", GUserMenu);
        app.component("GCurrencyInput", GCurrencyInput);
        app.component("GEmailInput", GEmailInput);
        app.component("GFileInput", GFileInput);
        app.component("GDateInput", GDateInput);
        app.component("GDateRangeInput", GDateRangeInput);
        app.component("GForm", GForm);
        app.component("GSubmitButton", GSubmitButton);
        app.component("GCheckboxGroup", GCheckboxGroup);
        app.component("GTextarea", GTextarea);
    },
};

declare module "vue" {
    export interface GlobalComponents {
        GAppHeader: typeof GAppHeader;
        GButton: typeof GButton;
        GCheckboxGroup: typeof GCheckboxGroup;
        GTextInput: typeof GTextInput;
        GPopover: typeof GPopover;
        GTooltip: typeof GTooltip;
        GSelectButton: typeof GSelectButton;
        GProgress: typeof GProgress;
        GAlertDialog: typeof GAlertDialog;
        GSelect: typeof GSelect;
        GSearch: typeof GSearch;
        GSidebar: typeof GSidebar;
        GSidebarMenu: typeof GSidebarMenu;
        GClipboard: typeof GClipboard;
        GHistoryScroller: typeof GHistoryScroller;
        GThreeWayToggle: typeof GThreeWayToggle;
        GTable: typeof GTable;
        GTableBody: typeof GTableBody;
        GTablePagination: typeof GTablePagination;
        GModal: typeof GModal;
        GOverlay: typeof GOverlay;
        GHamburgerMenu: typeof GHamburgerMenu;
        GDetailList: typeof GDetailList;
        GDetailListItem: typeof GDetailListItem;
        GTreeMenu: typeof GTreeMenu;
        GForm: typeof GForm;
        GSubmitButton: typeof GSubmitButton;
        GFileInput: typeof GFileInput;
    }

    export interface ComponentCustomProperties {
        vGtooltip: VGtooltipDirective;
    }
}
