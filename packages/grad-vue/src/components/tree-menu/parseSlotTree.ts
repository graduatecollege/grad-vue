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
