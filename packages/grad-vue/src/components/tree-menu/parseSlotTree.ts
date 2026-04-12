import { type VNode, Comment, Text, Fragment } from "vue";
import type { TreeMenuItem } from "./GTreeMenuList.vue";

export type ParsedSlotTree = {
    items: TreeMenuItem[];
    listType: "ul" | "ol";
};

/**
 * Flatten a VNode children array, resolving Fragments and skipping Comment/Text whitespace nodes.
 */
function flatChildren(vnodes: VNode[]): VNode[] {
    const result: VNode[] = [];
    for (const vnode of vnodes) {
        if (vnode.type === Comment) continue;
        if (vnode.type === Text) {
            if (typeof vnode.children === "string" && vnode.children.trim() === "") continue;
        }
        if (vnode.type === Fragment) {
            const kids = vnode.children;
            if (Array.isArray(kids)) {
                result.push(...flatChildren(kids as VNode[]));
            }
        } else {
            result.push(vnode);
        }
    }
    return result;
}

/**
 * Extract plain text from a VNode tree (used to get link / item labels).
 */
function extractText(vnode: VNode): string {
    if (vnode.type === Text) return (vnode.children as string) ?? "";
    if (typeof vnode.children === "string") return vnode.children;
    if (Array.isArray(vnode.children)) {
        return (vnode.children as VNode[]).map(extractText).join("");
    }
    return "";
}

/**
 * Parse a single `<li>` VNode into a TreeMenuItem.
 */
function parseLi(li: VNode): TreeMenuItem | null {
    const children = Array.isArray(li.children) ? flatChildren(li.children as VNode[]) : [];
    if (children.length === 0) return null;

    let label = "";
    let href: string | undefined;
    let to: string | undefined;
    let nestedItems: TreeMenuItem[] | undefined;
    let nestedListType: "ul" | "ol" = "ul";

    for (const child of children) {
        const tag = child.type as string;
        if (tag === "a") {
            label = extractText(child).trim();
            const props = child.props ?? {};
            href = props.href ?? undefined;
            to = props["data-to"] ?? undefined;
        } else if (tag === "ul" || tag === "ol") {
            const parsed = parseList(child);
            nestedItems = parsed.items.length > 0 ? parsed.items : undefined;
            nestedListType = parsed.listType;
        } else {
            const text = extractText(child).trim();
            if (text && !label) label = text;
        }
    }

    if (!label) return null;

    const item: TreeMenuItem = { label };
    if (href !== undefined) item.href = href;
    if (to !== undefined) item.to = to;
    if (nestedItems !== undefined) item.children = nestedItems;

    return item;
}

/**
 * Parse a `<ul>` or `<ol>` VNode into a list of TreeMenuItems.
 */
function parseList(list: VNode): ParsedSlotTree {
    const listType: "ul" | "ol" = (list.type as string) === "ol" ? "ol" : "ul";
    const rawChildren = Array.isArray(list.children) ? flatChildren(list.children as VNode[]) : [];
    const items: TreeMenuItem[] = [];

    for (const child of rawChildren) {
        if (child.type !== "li") continue;
        const item = parseLi(child);
        if (item) items.push(item);
    }

    return { items, listType };
}

/**
 * Walk the default-slot VNodes looking for the first `<ul>` or `<ol>` element and
 * convert it into a `ParsedSlotTree` structure.
 *
 * @param vnodes - The VNodes from the default slot.
 * @returns Parsed items and inferred list type, or `null` if no list is found.
 */
export function parseSlotTree(vnodes: VNode[]): ParsedSlotTree | null {
    const flat = flatChildren(vnodes);
    for (const vnode of flat) {
        const tag = vnode.type as string;
        if (tag === "ul" || tag === "ol") {
            return parseList(vnode);
        }
    }
    return null;
}

// ---------------------------------------------------------------------------
// DOM-based parsing (for Web Components / Custom Elements mode)
//
// In CE mode with shadowRoot: false, Vue collects the host element's children
// as real DOM nodes in `element._slots` rather than converting them to VNodes.
// `useSlots()` therefore returns nothing, so the VNode path above yields null.
// These helpers parse the real DOM Node[] instead.
// ---------------------------------------------------------------------------

function parseDomLi(li: HTMLElement): TreeMenuItem | null {
    let label = "";
    let href: string | undefined;
    let to: string | undefined;
    let nestedItems: TreeMenuItem[] | undefined;

    for (const child of Array.from(li.children)) {
        const tag = child.tagName.toLowerCase();
        if (tag === "a") {
            label = (child as HTMLElement).textContent?.trim() ?? "";
            const hrefAttr = (child as HTMLElement).getAttribute("href");
            if (hrefAttr != null) href = hrefAttr;
            const toAttr = (child as HTMLElement).getAttribute("data-to");
            if (toAttr != null) to = toAttr;
        } else if (tag === "ul" || tag === "ol") {
            const parsed = parseDomList(child as HTMLElement);
            if (parsed.items.length > 0) nestedItems = parsed.items;
        }
    }

    if (!label) {
        for (const node of Array.from(li.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim() ?? "";
                if (text) {
                    label = text;
                    break;
                }
            }
        }
    }

    if (!label) return null;

    const item: TreeMenuItem = { label };
    if (href !== undefined) item.href = href;
    if (to !== undefined) item.to = to;
    if (nestedItems !== undefined) item.children = nestedItems;
    return item;
}

function parseDomList(list: HTMLElement): ParsedSlotTree {
    const listType: "ul" | "ol" = list.tagName.toLowerCase() as "ul" | "ol";
    const items: TreeMenuItem[] = [];
    for (const child of Array.from(list.children)) {
        if (child.tagName.toLowerCase() !== "li") continue;
        const item = parseDomLi(child as HTMLElement);
        if (item) items.push(item);
    }
    return { items, listType };
}

/**
 * Parse an array of raw DOM `Node`s (as stored in a custom element's `_slots`)
 * into a `ParsedSlotTree`. Looks for the first `<ul>` or `<ol>` among the nodes.
 *
 * This is the WC-mode counterpart of {@link parseSlotTree}.
 *
 * @param nodes - DOM nodes from the custom element's default slot.
 * @returns Parsed items and inferred list type, or `null` if no list is found.
 */
export function parseDomNodes(nodes: Node[]): ParsedSlotTree | null {
    for (const node of nodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (tag === "ul" || tag === "ol") {
            return parseDomList(el);
        }
    }
    return null;
}
