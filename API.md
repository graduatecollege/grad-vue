# grad-vue API Documentation

This document provides comprehensive API documentation for AI coding agents to utilize the @illinois-grad/grad-vue library.

## Installation

```bash
npm install @illinois-grad/grad-vue
```

## Usage

### Import All Components (Vue.js)

```javascript
import { createApp } from 'vue'
import GradVue from '@illinois-grad/grad-vue'
import '@illinois-grad/grad-vue/grad-vue.css'
import App from './App.vue'

const app = createApp(App)
app.use(GradVue)
```

### Import All Components (Nuxt.js)

Create a plugin file `plugins/grad-vue.ts`:

```javascript
import GradVue from '@illinois-grad/grad-vue'
import '@illinois-grad/grad-vue/grad-vue.css'

export default defineNuxtPlugin((nuxt) => {
    nuxt.vueApp.use(GradVue)
})
```

### Import Individual Components

```javascript
import { GButton, GModal, GTable } from '@illinois-grad/grad-vue'
```

## Components

### GAlertDialog

Alert dialog for confirming or canceling actions. Clicking outside or pressing escape closes the dialog (counts as cancel).

**Required Setup**: Page must have an element with `id="modal-root"` for teleportation.

**Props**:
- `label?: string` - Dialog label (default: "Confirmation")
- `buttonText?: string` - Accept button text (default: "Continue")
- `buttonColor?: "primary" | "secondary" | "danger"` - Accept button color (default: "primary")

**Events**:
- `cancel` - Emitted when dialog is canceled
- `confirm` - Emitted when user confirms

**Slots**:
- `default` - Content of the alert (also becomes ARIA description)

**Example**:
```vue
<GAlertDialog
    label="Delete Confirmation"
    button-text="Delete"
    button-color="danger"
    @confirm="handleDelete"
    @cancel="handleCancel">
    Are you sure you want to delete this item?
</GAlertDialog>
```

---

### GAppHeader

Minimal header for web apps where a full Illinois brand header would be too large.

**Props**:
- `illinois?: boolean` - Show Illinois block I logo (default: false)
- `brand?: string` - Top-left corner text (default: "GRAD")

**Slots**:
- `left` - Replaces the link element in top-left corner
- `title` - To the right of the logo
- `app-controls` - Remaining area to the right

**Example**:
```vue
<GAppHeader brand="My App" :illinois="true">
    <template #title>Application Title</template>
    <template #app-controls>
        <button>Logout</button>
    </template>
</GAppHeader>
```

---

### GButton

Button component with multiple sizes, themes, and styles. Can be used as a link or router-link.

**Props**:
- `size?: "small" | "medium" | "large"` - Button size (default: "medium")
- `theme?: "primary" | "secondary" | "accent" | "danger" | "none"` - Button color theme (default: "primary")
- `outlined?: boolean` - Use outlined style (default: false)
- `text?: boolean` - Use text style (default: false)
- `to?: string | Record<string, any>` - Link destination
- `component?: string` - Custom component/element to render (e.g., "router-link")

**Events**:
- `click` - Click event
- `focus` - Focus event
- `blur` - Blur event

**Slots**:
- `default` - Button content

**Example**:
```vue
<GButton theme="primary" size="large" @click="handleClick">
    Click Me
</GButton>

<GButton component="router-link" to="/profile">
    View Profile
</GButton>
```

---

### GClipboard

Displays text with a clipboard button that copies text to clipboard. Text can be hidden if already displayed elsewhere.

**Props**:
- `text: string` - Text to copy (required)
- `hideText?: boolean` - Hide the visible text (default: false)

**Example**:
```vue
<GClipboard text="example@email.com" />
<GClipboard text="secret-token-123" :hide-text="true" />
```

---

### GDetailList

Container for displaying key-value pairs in a grid or vertical layout. Use with `GDetailListItem`.

**Props**:
- `variant?: "grid" | "vertical"` - Layout style (default: "grid")

**Slots**:
- `default` - GDetailListItem components

**Example**:
```vue
<GDetailList variant="grid">
    <GDetailListItem label="Name">John Doe</GDetailListItem>
    <GDetailListItem label="Age">30</GDetailListItem>
    <GDetailListItem label="City">New York</GDetailListItem>
</GDetailList>
```

---

### GDetailListItem

Individual item in a GDetailList. Displays a label and value pair.

**Props**:
- `label: string` - The label/key for the item (required)

**Slots**:
- `default` - The value content

**Example**: See GDetailList example above.

---

### GHamburgerMenu

Hamburger menu button that toggles a sidebar. Use with `useSidebar` composable and `GSidebar`.

**Props**:
- `label?: string` - Accessible label (default: "Main Navigation")

**Events**:
- `toggle` - Emitted when button is clicked

**Setup Required**:
```vue
<script setup>
import { useSidebar } from '@illinois-grad/grad-vue'

const sidebar = useSidebar()
provide('sidebar', sidebar)
</script>
```

**Example**:
```vue
<GHamburgerMenu label="Menu" />
```

---

### GHistoryScroller

Scroller for content displayed like a chat log (starts at bottom, scroll up for older entries). Automatically starts at bottom with a "jump to bottom" button when scrolled up.

**Props**:
- `label?: string` - Accessible label (applies `role="log"` and `aria-label`)
- `entries: T[]` - Array of entries (must have `id: string | number`)

**Slots**:
- `default` - Render template for each entry, receives `{ entry }`

**Example**:
```vue
<GHistoryScroller
    label="Chat History"
    :entries="messages">
    <template #default="{ entry }">
        <div>{{ entry.text }}</div>
    </template>
</GHistoryScroller>
```

---

### GModal

Generic modal component. Clicking outside or pressing escape closes the modal.

**Required Setup**: Page must have an element with `id="modal-root"` for teleportation.

**Props**:
- `label: string` - Modal accessible label (required)
- `describedby?: string` - Element ID for aria-describedby
- `hiddenLabel?: boolean` - Hide label visually (default: false)
- `size?: "small" | "medium" | "large" | "full"` - Modal size (default: "medium")

**Slots**:
- `default` - Modal content

**Focus Management**: Focus is placed on the H2 label by default. Override by adding `popover-focus` attribute to an element inside the modal.

**Example**:
```vue
<GModal label="User Settings" size="large" v-if="showModal">
    <form>
        <!-- Form content -->
    </form>
</GModal>

<!-- Add to page -->
<div id="modal-root"></div>
<GOverlay />
```

---

### GOverlay

Client-side overlay for behind modal dialogs. Place near the end of page structure.

**Props**: None

**Example**:
```vue
<GOverlay />
```

---

### GPopover

Popover that appears next to or over a trigger element, staying visible in viewport.

**Props**:
- `minimal?: boolean` - Render without padding (default: false)
- `v-model?: boolean` - Open state

**Events**:
- `show` - Emitted when popover shows
- `hide` - Emitted when popover hides

**Slots**:
- `trigger` - Interactive element to open popover, receives `{ toggle }` function
- `default` - Popover content

**Example**:
```vue
<GPopover>
    <template #trigger="{ toggle }">
        <GButton @click="toggle">
            Open Popover
        </GButton>
    </template>
    <div>Popover content here</div>
</GPopover>
```

---

### GProgress

Shows progress from 1-100 or an indeterminate spinner. Announces to assistive technologies.

**Props**:
- `label?: string` - Accessible label (default: "Loading")
- `value?: number` - Progress value 1-100 (omit for indeterminate)
- `size?: "tiny" | "small" | "medium" | "large"` - Size (default: "medium")

**ARIA Roles**:
- With value: `role="progressbar"` with value attributes
- Without value: `role="status"`

**Example**:
```vue
<GProgress :value="50" label="Upload progress" />
<GProgress label="Processing..." />
```

---

### GSearch

Combobox-style search with auto-complete dropdown. Component doesn't perform searching, it emits events.

**Generic Type**: `T extends { id: string | number; title: string }`

**Props**:
- `results: T[] | GSearchGroup<T>[]` - Search results (plain array or grouped)
- `label: string` - Accessible label (required)
- `placeholder?: string` - Input placeholder
- `auto?: boolean` - Auto-submit on input (default: true)
- `loading?: boolean` - Show loading indicator
- `hiddenLabel?: boolean` - Hide label visually

**Events**:
- `submit: (query: string)` - Emitted when search should be performed
- `select: (item: T)` - Emitted when user selects a result
- `v-model: string` - Current user input

**Slots**:
- `option` - Customize option rendering, receives `{ option }`
- `group` - Customize group label

**Example**:
```vue
<script setup>
interface SearchResult {
    id: string
    title: string
}

const results = ref<SearchResult[]>([])
const query = ref('')

function handleSubmit(q: string) {
    // Perform search, update results
    results.value = performSearch(q)
}

function handleSelect(item: SearchResult) {
    // Handle selection
}
</script>

<template>
    <GSearch
        v-model="query"
        label="Search"
        :results="results"
        @submit="handleSubmit"
        @select="handleSelect" />
</template>
```

---

### GSelect

Custom-styled select element with optional search functionality.

**Props**:
- `options: Array<string | { label: string; value: string | number }>` - Options list (required)
- `label: string` - Accessible label (required)
- `hiddenLabel?: boolean` - Hide label visually (default: false)
- `placeholder?: string` - Placeholder (for searchable mode)
- `disabled?: boolean` - Disabled state (default: false)
- `name?: string` - Form field name
- `searchable?: boolean` - Enable search/filter (default: false)
- `clearButton?: boolean` - Show clear button (default: false)
- `compact?: boolean` - Compact styling (default: false)
- `v-model: string | number` - Selected value

**Example**:
```vue
<GSelect
    v-model="selectedOption"
    label="Choose an option"
    :options="['Option 1', 'Option 2', 'Option 3']"
    searchable />

<GSelect
    v-model="country"
    label="Country"
    :options="[
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' }
    ]" />
```

---

### GSelectButton

Radio button group with special styling.

**Props**:
- `options: Array<string | { label: string; value: string | number }>` - Options list (required)
- `label: string` - Accessible label (required)
- `size?: "small" | "medium" | "large"` - Size (default: "medium")
- `name?: string` - Form field name
- `disabled?: boolean` - Disabled state (default: false)
- `v-model: string | number` - Selected value

**Events**:
- `change` - Emitted on user interaction

**Example**:
```vue
<GSelectButton
    v-model="viewMode"
    label="View Mode"
    :options="['Grid', 'List', 'Table']"
    @change="handleChange" />
```

---

### GSidebar

Fixed sidebar on the left side of viewport. Can be made collapsible with `useSidebar`.

**Props**:
- `backgroundColor?: string` - Custom background color
- `backgroundImage?: string` - Custom background image (default: "none")
- `theme?: "light" | "dark"` - Sidebar theme (default: "dark")
- `topOffset?: string` - Offset from top of viewport
- `topOffsetVar?: string` - CSS variable for top offset
- `width?: string` - Sidebar width (default: "300px")

**Setup**: Use with `useSidebar` composable (see GHamburgerMenu).

**Example**:
```vue
<GSidebar theme="dark" width="250px">
    <nav>
        <!-- Navigation content -->
    </nav>
</GSidebar>
```

---

### GSidebarMenu

Navigation menu designed for use within GSidebar. Displays a list of links with support for tracking active links for in-page navigation.

**Props**:
- `title?: string` - Title and accessible name
- `items: MenuItem[]` - List of menu items (required)
  - Each item: `{ label: string; href?: string; to?: string }`
  - Use `href` for regular links or `to` for vue-router links
- `offset?: number` - Offset for tracking active position (default: 70)
- `spy?: boolean` - Track active position for in-page links (default: true)
- `theme?: "light" | "dark"` - Sidebar theme (default: "light")
- `compact?: boolean` - Use compact layout (default: false)
- `v-model: string | null` - Active element ID (for spy mode)

**Example**:
```vue
<script setup>
import { ref, useTemplateRef, onMounted } from 'vue'
import { useActiveLinkContent } from '@illinois-grad/grad-vue'

const activeId = ref('')
const main = useTemplateRef('main')

onMounted(() => {
    useActiveLinkContent(main, 70, activeId)
})

const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Section 1', href: '#section-1' },
    { label: 'Section 2', href: '#section-2' }
]
</script>

<template>
    <GSidebar>
        <GSidebarMenu
            title="Navigation"
            :items="menuItems"
            v-model="activeId"
            spy />
    </GSidebar>

    <main ref="main">
        <section id="section-1">
            <h2>Section 1</h2>
        </section>
        <section id="section-2">
            <h2>Section 2</h2>
        </section>
    </main>
</template>
```

---

### GTable

Data table with support for grouping, sorting, filtering, and pagination. Optimized for performance (tested with 4000 rows × 14 columns).

**Generic Type**: `T extends TableRow, C extends TableColumn<T>`

**Props**:
- `label: string` - Accessible label (required)
- `data: T[]` - Data array (required)
- `columns: C[]` - Column configuration (required)
- `filtering: UseFilteringReturn<T>` - Filtering state (required, from `useFiltering`)
- `resultCount?: number` - Total results (for pagination)
- `groupBy?: keyof T` - Column key to group by
- `groupRender?: (groupValue: any, row: T) => VNode` - Custom group render function
- `rowClickable?: boolean` - Make rows clickable
- `rowClass?: (row: T) => string | string[]` - Custom row class function
- `startIndex: number` - Starting index for pagination (required)

**v-model**:
- `v-model:sortField` - Current sort field
- `v-model:sortOrder` - Sort order (1 or -1)
- `v-model:filter` - Filter values

**Events**:
- `row-click: (href: string)` - Emitted when clickable row is clicked

**Column Configuration** (`TableColumn<T>`):
- `key: keyof T` - Data field key (required)
- `label: string` - Column header (required)
- `sortable?: boolean` - Enable sorting
- `filter?: TableColumnFilter` - Filter configuration
- `display?: (row: T) => string | VNode` - Custom render function
- `tdClass?: string | ((row: T) => string)` - Cell class
- `trClass?: string | ((row: T) => string)` - Row class

**Filter Types**:
- `SelectColumnFilter`: `{ type: 'select'; options: Array<{label, value}>; placeholder? }`
- `MultiSelectColumnFilter`: `{ type: 'multi-select'; options: Array<{label, value}>; placeholder? }`
- `ToggleColumnFilter`: `{ type: 'toggle'; label: string; trueLabel?; falseLabel?; trueValue; falseValue; description? }`

**Example**: See [demo source](https://github.com/graduatecollege/grad-vue/blob/main/demo/components/demo/GTableDemo.vue) for comprehensive example.

---

### GTextInput

Text input with styling for label, instructions, and error message. All non-prop attributes passed to input element.

**Props**:
- `label?: string` - Label text
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Disabled state (default: false)
- `error?: string` - Error message
- `instructions?: string` - Instructions text
- `v-model: string | null` - Input value

**Events**:
- `change: ({ was, to })` - Emitted on change

**Example**:
```vue
<GTextInput
    v-model="email"
    label="Email Address"
    placeholder="you@example.com"
    instructions="We'll never share your email"
    :error="emailError"
    @change="handleChange" />
```

---

### GThreeWayToggle

Compact three-way toggle acting like a radio button group (null/yes/no). Special key bindings: 'y' for yes, 'n' for no.

**Props**:
- `label: string` - Accessible label (required)
- `describedby?: string` - ID for aria-describedby
- `error?: string` - Error message
- `disabled?: boolean` - Disabled state (default: false)
- `v-model: boolean | null` - Current value

**Events**:
- `change: ({ was, to })` - Emitted on user interaction

**Example**:
```vue
<GThreeWayToggle
    v-model="approved"
    label="Approved?"
    @change="handleChange" />
```

---

## Composables

### calculatePopoverPosition

Calculates position for a popover based on anchor, popover dimensions, and viewport.

**Parameters**:
- `anchorRect: DOMRect` - Anchor element's bounding rect
- `popoverRect: DOMRect` - Popover's bounding rect
- `viewportRect: DOMRect` - Viewport's bounding rect
- `options?: { gap?: number; margin?: number; preferAbove?: boolean }`

**Returns**: `{ top: number; left: number; xOffset: number; placedAbove: boolean; overlay: boolean }`

**Example**:
```javascript
import { calculatePopoverPosition } from '@illinois-grad/grad-vue'

const anchorRect = anchorEl.getBoundingClientRect()
const popoverRect = popoverEl.getBoundingClientRect()
const viewportRect = new DOMRect(0, 0, window.innerWidth, window.innerHeight)

const { top, left } = calculatePopoverPosition(
    anchorRect,
    popoverRect,
    viewportRect,
    { gap: 8, margin: 16 }
)
```

---

### useActiveLinkContent

Monitors elements' intersection with viewport to update active links (for in-page navigation menus). Use with GSidebarMenu for automatic active link tracking.

**Parameters**:
- `element: Ref<HTMLElement | null>` - Parent element whose children will be observed
- `topOffset: number` - Offset from top of window to account for fixed headers
- `activeId: Ref<string>` - Ref to store the currently active element's ID

**Returns**: `{ stop: () => void }` - Function to stop observing

**Requirements**:
- Direct children of the observed element must have unique IDs
- Menu items' `href` should match the element IDs (e.g., `#section-1`)

**Example**:
```vue
<script setup>
import { ref, useTemplateRef, onMounted } from 'vue'
import { useActiveLinkContent } from '@illinois-grad/grad-vue'

const activeId = ref('')
const main = useTemplateRef('main')

onMounted(() => {
    useActiveLinkContent(main, 70, activeId)
})
</script>

<template>
    <GSidebarMenu
        :items="[
            { label: 'Section 1', href: '#section-1' },
            { label: 'Section 2', href: '#section-2' }
        ]"
        v-model="activeId"
        spy />

    <main ref="main">
        <section id="section-1">
            <h2>Section 1</h2>
        </section>
        <section id="section-2">
            <h2>Section 2</h2>
        </section>
    </main>
</template>
```

---

### useFiltering

Composable for managing table filtering state.

**Parameters**:
- `filters: T` - Initial filter configuration object

**Returns**: `UseFilteringReturn<T>`
- `filters: Ref<T>` - Current filter values
- `isFiltered: Ref<boolean>` - Whether any filters are active
- `clearFilters: () => void` - Clear all filters
- `filteredColumns: Ref<Record<keyof T, boolean>>` - Which columns are filtered

**Helper**:
- `filtersToQueryParams<T>(filters: T): Record<keyof T, string | string[]>` - Convert filters to query parameters

**Example**:
```javascript
import { useFiltering } from '@illinois-grad/grad-vue'

const filtering = useFiltering({
    status: undefined,
    category: undefined,
    active: undefined
})

// Use with GTable
const tableProps = {
    filtering,
    // ... other props
}

// Check if filtered
if (filtering.isFiltered.value) {
    console.log('Filters active')
}

// Clear filters
filtering.clearFilters()
```

---

### useOverlayEscape

Manages escape key behavior for overlays (used internally).

**Parameters**:
- `elements: Ref<HTMLElement | null>[]` - Elements to monitor
- `isTop: Ref<boolean>` - Whether overlay is topmost
- `open: Ref<boolean>` - Open state
- `closeCallback: () => void` - Close function
- `popCallback: () => void` - Pop from stack function

---

### useOverlayFocus

Manages focus trapping for overlays (used internally).

**Parameters**:
- `element: Ref<HTMLElement | null>` - Element to trap focus within
- `isTop: Ref<boolean>` - Whether overlay is topmost

**Returns**: `{ activate: () => void; deactivate: () => void }`

---

### useOverlayStack

Manages stack of overlays for proper z-index and interaction (used internally).

**Parameters**:
- `id: string` - Unique overlay ID
- `scrollLock?: boolean` - Enable scroll lock (default: false)
- `modal?: boolean` - Is modal dialog (default: false)

**Returns**:
- `push: () => void` - Add to stack
- `pop: () => void` - Remove from stack
- `isTop: Ref<boolean>` - Whether this is topmost overlay
- `zIndex: Ref<number>` - Calculated z-index

---

### useOverlayStackState

Access global overlay stack state (used internally).

**Returns**:
- `stack: Ref<OverlayItem[]>` - Current overlay stack
- `hasScrollLock: Ref<boolean>` - Whether scroll is locked

---

### useSidebar

Manages sidebar state and links components together (use with GSidebar and GHamburgerMenu).

**Parameters**:
- `breakpoint?: Ref<string> | string` - Media query for when sidebar is collapsible (default: "(max-width: 800px)")

**Returns**:
- `id: string` - Unique sidebar ID
- `open: Ref<boolean>` - Sidebar open state
- `isCollapsible: Ref<boolean>` - Whether sidebar is in collapsible mode
- `toggle: () => void` - Toggle open state

**Example**:
```vue
<script setup>
import { useSidebar } from '@illinois-grad/grad-vue'

const sidebar = useSidebar('(max-width: 1024px)')
provide('sidebar', sidebar)
</script>

<template>
    <GHamburgerMenu />
    <GSidebar>
        <!-- Sidebar content -->
    </GSidebar>
</template>
```

---

## Directives

### v-gtooltip

Creates an accessible tooltip that appears on hover/focus.

**Usage**:
```vue
<button v-gtooltip="'Tooltip text'">
    Hover me
</button>

<button
    v-gtooltip="dynamicTooltipText"
    @tooltip-hide="handleTooltipHide">
    Button
</button>
```

**Events**:
- `tooltip-hide` - Emitted when tooltip is hidden

**Styling**: Tooltips automatically position themselves to stay in viewport, with an arrow pointing to the trigger element.

---

## TypeScript Types

### MenuItem

```typescript
type MenuItem = {
    label: string
    href?: string
    to?: string
}
```

### TableColumn<T>

```typescript
interface TableColumn<T extends TableRow, K = keyof T> {
    key: K
    label: string
    sortable?: boolean
    filter?: TableColumnFilter
    display?: (row: T) => string | VNode
    tdClass?: string | ((row: T) => string)
    trClass?: string | ((row: T) => string)
}
```

### TableRow

```typescript
interface TableRow extends Record<string, any> {
    key: string
}
```

### TableColumnFilter

```typescript
type TableColumnFilter =
    | SelectColumnFilter
    | MultiSelectColumnFilter
    | ToggleColumnFilter
```

### SelectColumnFilter

```typescript
interface SelectColumnFilter {
    type: 'select'
    options: Array<{ label: string; value: any }>
    placeholder?: string
}
```

### MultiSelectColumnFilter

```typescript
interface MultiSelectColumnFilter {
    type: 'multi-select'
    options: Array<{ label: string; value: any }>
    placeholder?: string
}
```

### ToggleColumnFilter

```typescript
interface ToggleColumnFilter {
    type: 'toggle'
    label: string
    trueLabel?: string
    falseLabel?: string
    trueValue: any
    falseValue: any
    description?: string
}
```

### UseFilteringReturn<T>

```typescript
interface UseFilteringReturn<T extends Record<string, any>> {
    filters: Ref<T>
    isFiltered: Ref<boolean>
    clearFilters: () => void
    filteredColumns: Ref<Record<keyof T, boolean>>
}
```

---

## CSS Variables and Theming

The library includes a CSS file that should be imported:

```javascript
import '@illinois-grad/grad-vue/grad-vue.css'
```

Components support CSS custom properties for theming. Standard variables:

```css
:root {
    --g-toolbar-height: 48px;
    --g-border-radius-s: 2px;
    --g-border-radius-m: 4px;
    --g-border-radius-l: 8px;

    --g-green-100: #bae8cb;
    --g-green-500: var(--il-prairie);
    --g-green-700: #003519;

    --g-danger-100: #f8d7da;
    --g-danger-500: #D40C0C;
    --g-danger-600: #880606;
    --g-danger-700: #6a2316;
    --g-danger-text: #ffffff;

    --g-accent-500: var(--il-orange);
    --g-accent-700: var(--il-altgeld);

    --g-warn-100: #feedc7;
    --g-warn-300: #fdd06f;

    --g-warn-500: var(--il-harvest);
    --g-warn-700: #b37f0d;

    --g-primary-300: var(--il-industrial);
    --g-primary-500: var(--il-blue);
    --g-primary-text: #ffffff;

    --g-info-200: var(--il-arches-90);
    --g-info-300: var(--il-arches-80);
    --g-info-400: var(--il-arches-70);
    --g-info-500: var(--il-arches);
    --g-info-600: var(--il-arches-50);
    --g-info-700: var(--il-arches-60);

    --g-surface-0: #ffffff;
    --g-surface-50: #f8f8f8;
    --g-surface-100: var(--il-storm-95);
    --g-surface-150: #eaeaea;
    --g-surface-200: var(--il-storm-80);
    --g-surface-300: var(--il-storm-70);
    --g-surface-400: var(--il-storm-60);
    --g-surface-500: var(--il-storm);
    --g-surface-600: #5f6261;
    --g-surface-700: var(--il-storm-30);
    --g-surface-800: #3e3f3f;
    --g-surface-900: var(--il-storm-10);
    --g-surface-950: #000000;
}
```

---

## Accessibility Features

All components are built with accessibility as the primary concern:

1. **ARIA Attributes**: Proper roles, labels, and descriptions
2. **Keyboard Navigation**: Full keyboard support for all interactive elements
3. **Focus Management**: Proper focus trapping in modals/dialogs
4. **Screen Reader Support**: Announcements and semantic HTML
5. **Visual Labels**: Options to hide labels visually while maintaining accessibility

---

## Best Practices

### Modal/Dialog Setup

Always include a modal root and overlay in your layout:

```vue
<template>
    <div id="app">
        <!-- Your app content -->

        <!-- At the end -->
        <div id="modal-root"></div>
        <GOverlay />
    </div>
</template>
```

### Using with Vue Router

Components like GButton can be used as router links:

```vue
<GButton component="router-link" to="/profile">
    View Profile
</GButton>
```

### Table Performance

For large datasets, GTable is optimized:
- Uses render functions instead of Vue components for table body
- Tested with 4000+ rows and 14+ columns
- Use `display` function for custom cell rendering

### Form Input Patterns

Components support v-model and emit change events:

```vue
<GTextInput
    v-model="formData.email"
    label="Email"
    @change="({ was, to }) => trackChange(was, to)" />
```

---

## Dependencies

- **Vue**: ^3.5 (peer dependency)
- **@vueuse/core**: ^14 - Utility composables
- **focus-trap**: ^7 - Focus management for modals

---

## Additional Resources

- **Demo Site**: [https://graduatecollege.github.io/grad-vue/](https://graduatecollege.github.io/grad-vue/)
- **Repository**: [https://github.com/graduatecollege/grad-vue](https://github.com/graduatecollege/grad-vue)
- **NPM Package**: [@illinois-grad/grad-vue](https://www.npmjs.com/package/@illinois-grad/grad-vue)
