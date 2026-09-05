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
    GTextInput,
    GThreeWayToggle,
    GTermSelector,
    GTermSelectorControl,
    GTreeMenu,
    GTreeMenuList,
    GTreeMenuItem,
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
    GMultiSelect,
    GToggle,
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
        app.component("GModal", GModal);
        app.component("GOverlay", GOverlay);
        app.component("GHamburgerMenu", GHamburgerMenu);
        app.component("GDetailList", GDetailList);
        app.component("GDetailListItem", GDetailListItem);
        app.component("GTermSelector", GTermSelector);
        app.component("GTermSelectorControl", GTermSelectorControl);
        app.component("GTreeMenu", GTreeMenu);
        app.component("GTreeMenuList", GTreeMenuList);
        app.component("GTreeMenuItem", GTreeMenuItem);
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
        app.component("GMultiSelect", GMultiSelect);
        app.component("GToggle", GToggle);
    },
};

declare module "vue" {
    export interface GlobalComponents {
        GAppHeader: typeof GAppHeader;
        GAlertDialog: typeof GAlertDialog;
        GButton: typeof GButton;
        GCheckboxGroup: typeof GCheckboxGroup;
        GClipboard: typeof GClipboard;
        GCurrencyInput: typeof GCurrencyInput;
        GDateInput: typeof GDateInput;
        GDateRangeInput: typeof GDateRangeInput;
        GDetailList: typeof GDetailList;
        GDetailListItem: typeof GDetailListItem;
        GEmailInput: typeof GEmailInput;
        GFileInput: typeof GFileInput;
        GForm: typeof GForm;
        GHamburgerMenu: typeof GHamburgerMenu;
        GHistoryScroller: typeof GHistoryScroller;
        GModal: typeof GModal;
        GMultiSelect: typeof GMultiSelect;
        GOverlay: typeof GOverlay;
        GPopover: typeof GPopover;
        GProgress: typeof GProgress;
        GSearch: typeof GSearch;
        GSelect: typeof GSelect;
        GSelectButton: typeof GSelectButton;
        GSidebar: typeof GSidebar;
        GSidebarMenu: typeof GSidebarMenu;
        GSubmitButton: typeof GSubmitButton;
        GTable: typeof GTable;
        GTableBody: typeof GTableBody;
        GTermSelector: typeof GTermSelector;
        GTermSelectorControl: typeof GTermSelectorControl;
        GTextarea: typeof GTextarea;
        GTextInput: typeof GTextInput;
        GThreeWayToggle: typeof GThreeWayToggle;
        GToggle: typeof GToggle;
        GTooltip: typeof GTooltip;
        GTreeMenu: typeof GTreeMenu;
        GTreeMenuItem: typeof GTreeMenuItem;
        GTreeMenuList: typeof GTreeMenuList;
        GUserMenu: typeof GUserMenu;
    }

    export interface ComponentCustomProperties {
        vGtooltip: VGtooltipDirective;
    }
}
