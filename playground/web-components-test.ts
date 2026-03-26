/**
 * Entry point for the web components test page.
 *
 * Registers a subset of grad-vue components as custom elements to demonstrate
 * that Teleport works correctly in Web Component / Shadow DOM contexts — no
 * extra props required.
 *
 * NOTE: When imported via the playground dev server (vite playground), styles
 * are not injected into the shadow DOM because the dev server does not use the
 * customElement compiler mode.  For a production-accurate test, use the built
 * `dist/grad-vue-elements.js` file instead (run `npm run build:elements` first).
 */
import { defineCustomElement } from "vue";
import GModal from "../packages/grad-vue/src/components/GModal.vue";
import GAlertDialog from "../packages/grad-vue/src/components/GAlertDialog.vue";
import GButton from "../packages/grad-vue/src/components/GButton.vue";
import GOverlay from "../packages/grad-vue/src/components/GOverlay.vue";
import "../packages/grad-vue/src/css/main.css";

customElements.define("g-modal", defineCustomElement(GModal));
customElements.define("g-alert-dialog", defineCustomElement(GAlertDialog));
customElements.define("g-button", defineCustomElement(GButton));
customElements.define("g-overlay", defineCustomElement(GOverlay));
