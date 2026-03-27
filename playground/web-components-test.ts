/**
 * Entry point for the web components test page.
 *
 * Registers grad-vue components as custom elements to verify that:
 *  - Teleport to #modal-root works in web component contexts
 *  - Slotted content renders correctly (via $slots.default?.()), and
 *  - Overlay stacking is correct because all overlays are siblings in #modal-root.
 *
 * NOTE: When served by the playground dev server (vite playground), styles are
 * not injected into shadow DOM because the dev server does not enable the
 * customElement compiler mode.  For a production-accurate test, use the built
 * artifact (run `npm run build:elements` first):
 *     <script type="module" src="/packages/grad-vue/dist/grad-vue-elements.js"></script>
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
