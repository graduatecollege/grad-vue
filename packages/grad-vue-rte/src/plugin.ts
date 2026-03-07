import type { App } from "vue";
import {
    GChatInput,
    GNoteInput,
    GRichTextContent,
} from "./grad-vue-rte.ts";

export default {
    install(app: App) {
        app.component("GChatInput", GChatInput);
        app.component("GNoteInput", GNoteInput);
        app.component("GRichTextContent", GRichTextContent);
    },
};

declare module "vue" {
    export interface GlobalComponents {
        GChatInput: typeof GChatInput;
        GNoteInput: typeof GNoteInput;
        GRichTextContent: typeof GRichTextContent;
    }
}
