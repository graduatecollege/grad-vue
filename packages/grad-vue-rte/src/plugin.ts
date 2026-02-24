import type { App } from "vue";
import {
    GChatInput,
    GNoteInput,
} from "./grad-vue-rte.ts";

export default {
    install(app: App) {
        app.component("GChatInput", GChatInput);
        app.component("GNoteInput", GNoteInput);
    },
};

declare module "vue" {
    export interface GlobalComponents {
        GChatInput: typeof GChatInput;
        GNoteInput: typeof GNoteInput;
    }
}
