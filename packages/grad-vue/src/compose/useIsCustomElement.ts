import { getCurrentInstance } from "vue";

/**
 * Returns true when the current component instance is mounted as a Web
 * Component (custom element) via Vue's `defineCustomElement`. Vue sets the
 * internal `isCE` flag on the component instance before `setup()` runs, so
 * this is safe to call at the top of `<script setup>`.
 *
 * Used by overlay components (GModal, GAlertDialog, GPopover) to choose
 * between native `<slot>` (regular Vue) and rendering slot content via
 * `$slots.default?.()` (custom element), because a native `<slot>` element
 * teleported out of the shadow DOM loses its slot-distribution capability.
 */
export function useIsCustomElement(): boolean {
    // `isCE` is an internal Vue property documented in Vue's source:
    // packages/runtime-core/src/apiCustomElement.ts – instance.isCE = true
    // There is no public type for it, hence the cast.
    return !!(getCurrentInstance() as any)?.isCE;
}
