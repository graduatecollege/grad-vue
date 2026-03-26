/**
 * Entry point for the web components test page.
 *
 * This registers a subset of grad-vue components as custom elements for testing
 * the `no-teleport` prop behavior in a non-Vue.js context.
 *
 * NOTE: When imported via the playground dev server (vite playground), styles
 * are not injected into the shadow DOM because the dev server does not use the
 * customElement compiler mode. For a production-accurate test, use the built
 * `dist/grad-vue-elements.js` file instead (run `npm run build:elements` first).
 */
import { defineCustomElement } from "vue";
import GModal from "../packages/grad-vue/src/components/GModal.vue";
import GAlertDialog from "../packages/grad-vue/src/components/GAlertDialog.vue";
import GButton from "../packages/grad-vue/src/components/GButton.vue";
import "../packages/grad-vue/src/css/main.css";

customElements.define("g-modal", defineCustomElement(GModal));
customElements.define("g-alert-dialog", defineCustomElement(GAlertDialog));
customElements.define("g-button", defineCustomElement(GButton));
