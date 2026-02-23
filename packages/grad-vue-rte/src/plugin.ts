import type { App } from "vue";
import {
    GChatInput,
} from "./grad-vue-rte.ts";

export default {
    install(app: App) {
        app.component("GChatInput", GChatInput);
    },
};

declare module "vue" {
    export interface GlobalComponents {
        GChatInput: typeof GChatInput;
    }
}
