/**
 * Calculates the position for a popover based on the anchor element's position,
 * the popover's dimensions, and the viewport dimensions.
 *
 * @param anchorRect
 * @param popoverRect
 * @param viewportRect
 * @param options Optional config: { gap?: number, margin?: number }
 */
export function calculatePopoverPosition(
    anchorRect: DOMRect,
    popoverRect: DOMRect,
    viewportRect: DOMRect,
    options?: { gap?: number; margin?: number; preferAbove?: boolean },
): { top: number; left: number; xOffset: number; placedAbove: boolean; overlay: boolean } {
    const gap = options?.gap ?? 8;
    const margin = options?.margin ?? 16;
    const preferAbove = options?.preferAbove ?? false;

    // Prefer below, but go above if not enough space
    let placedAbove = false;
    let overlay = false;
    let top: number;
    if (preferAbove) {
        if (anchorRect.top - popoverRect.height - gap > viewportRect.top + margin) {
            // Place above
            top = anchorRect.top - popoverRect.height - gap;
            placedAbove = true;
        } else if (anchorRect.bottom + popoverRect.height + gap <= viewportRect.bottom - margin) {
            // Place below if not enough room above
            top = anchorRect.bottom + gap;
        } else {
            // Not enough room above or below, overlay on anchor, margin from top
            top = viewportRect.top + margin;
            overlay = true;
        }
    } else {
        if (
            anchorRect.bottom + popoverRect.height + gap > viewportRect.bottom - margin &&
            anchorRect.top - popoverRect.height - gap > viewportRect.top + margin
        ) {
            // Place above
            top = anchorRect.top - popoverRect.height - gap;
            placedAbove = true;
        } else if (
            anchorRect.bottom + popoverRect.height + gap > viewportRect.bottom - margin &&
            anchorRect.top - popoverRect.height - gap <= viewportRect.top + margin
        ) {
            // Not enough room above or below, overlay on anchor, margin from top
            top = viewportRect.top + margin;
            overlay = true;
        } else {
            // Place below
            top = anchorRect.bottom + gap;
        }
    }

    // Center horizontally by default
    let left = anchorRect.left + (anchorRect.width - popoverRect.width) / 2;
    // Clamp to viewport
    if (left < viewportRect.left + margin) {
        left = viewportRect.left + margin;
    }
    if (left + popoverRect.width > viewportRect.right - margin) {
        left = viewportRect.right - popoverRect.width - margin;
    }
    // Final safety clamp (if popover is wider than viewport)
    if (left < viewportRect.left + margin) {
        left = viewportRect.left + margin;
    }

    // Calculate X offset from centered position (for arrow)
    const centeredLeft = anchorRect.left + (anchorRect.width - popoverRect.width) / 2;
    const xOffset = left - centeredLeft;

    return { top, left, xOffset, placedAbove, overlay };
}
