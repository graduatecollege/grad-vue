# Using grad-vue as Web Components

grad-vue components can be used as standard Web Components (Custom Elements) in any web application, regardless of whether it uses Vue.js. This allows you to use our UI library in legacy apps, static sites, or other frameworks.

## Installation

### From NPM (Recommended)

If you're using a build tool (Vite, Webpack, etc.), you can install the package and import the web components directly:

```bash
npm install @illinois-grad/grad-vue
```

In your main entry file (e.g., `main.js` or `app.ts`):

```javascript
// Register the custom elements
import "@illinois-grad/grad-vue/grad-vue-elements";

// Import the required CSS
import "@illinois-grad/grad-vue/grad-vue-elements.css";
```

### From a CDN

The easiest way to get started without a build tool is to include the scripts and styles from a CDN (like Unpkg or JSDelivr) once a release is published:

```html
<!-- Styles -->
<link rel="stylesheet" href="https://unpkg.com/@illinois-grad/grad-vue@2.5.0/dist/grad-vue-elements.css">

<!-- Scripts -->
<script type="module" src="https://unpkg.com/@illinois-grad/grad-vue@2.5.0/dist/grad-vue-elements.js"></script>
```

I recommend using the UNPKG metadata to set the integrity hash for security:

https://unpkg.com/@illinois-grad/grad-vue/?meta

### From GitHub Releases

You can also download the `grad-vue-elements.js` and `grad-vue-elements.css` files directly from the [GitHub Releases](https://github.com/graduatecollege/grad-vue/releases) and include them in your project.

## Usage

Once the script is loaded, the components are registered with a `g-` prefix and kebab-cased names.

For example:

- `GButton` becomes `<g-button>`
- `GTextInput` becomes `<g-text-input>`
- `GTable` becomes `<g-table>`

And so on.

### Basic Button

Use the `g-button` element just like a regular HTML button.

```html
<g-button theme="primary" size="medium">
  Click Me
</g-button>

<g-button theme="accent" outlined="true">
  Outlined Button
</g-button>
```

### Form Inputs

Form components like `g-text-input` work similarly. 

```html
<g-text-input 
  label="User Name" 
  name="username"
  placeholder="Enter your name"
  instructions="Used for your profile display.">
</g-text-input>
```

### Modals

Modals require a `<div id="modal-root"></div>` somewhere on your page (content is teleported there for correct stacking).

In custom elements mode, `g-modal` should be added to the DOM only when it needs to be shown, then removed on close:

```html
<button id="open-btn">Open modal</button>
<div id="modal-root"></div>

<script>
  const openBtn = document.getElementById('open-btn');

  function openModal() {
    const modal = document.createElement('g-modal');
    modal.setAttribute('label', 'Confirm Action');
    modal.innerHTML = '<p>Are you sure?</p>';

    modal.addEventListener('close', () => {
      modal.remove();
    }, { once: true });

    document.body.appendChild(modal);
  }

  openBtn.addEventListener('click', openModal);
</script>
```

Multiple modals should be siblings, not nested.

### Popovers

Place the trigger button inside the popover element using `slot="trigger"`. Toggle visibility with the exposed `toggle()`, `show()`, and `hide()` methods:

```html
<g-popover id="my-popover">
  <button slot="trigger" id="pop-btn">Info</button>
  <p>Here is some helpful information.</p>
</g-popover>

<script>
  document.getElementById('pop-btn').addEventListener('click', () => {
    document.getElementById('my-popover').toggle();
  });
</script>
```

If no trigger slot is provided, call `show()`/`toggle()` programmatically. In that case, `g-popover` positions itself relative to its previous sibling element.

### Tooltips

Use `g-tooltip` in custom elements mode:

```html
<g-tooltip text="Primary action">
  <g-button slot="trigger">Save</g-button>
</g-tooltip>
```

You can also use it without a trigger slot and position it from script. In that case it anchors to its previous sibling element:

```html
<button id="help-btn">Help</button>
<g-tooltip id="help-tip" text="More details are available in the docs."></g-tooltip>

<script>
  document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('help-tip').toggle();
  });
</script>
```

`v-gtooltip` remains available for Vue templates, but directive syntax is not usable in plain custom element markup.

### Handling Events

Vue-built custom elements emit standard DOM events. For custom events defined in the components (like `change` in `g-text-input`), you can listen for them using `addEventListener`:

```javascript
const input = document.querySelector('g-text-input');
input.addEventListener('change', (event) => {
  // Vue custom element events are usually available in event.detail
  console.log('Input changed:', event.detail);
});

const button = document.querySelector('g-button');
button.addEventListener('click', () => {
  console.log('Button clicked!');
});
```

## Technical Notes

- **Vue.js Runtime**: The `grad-vue-elements.js` file includes a minimal Vue runtime required to power the components. You do not need to include Vue separately.
- **No Shadow DOM**: Custom elements render without Shadow DOM so that component CSS works naturally with the rest of the page. Component styles are collected and injected into a `<style data-grad-vue-elements>` tag in the document head. The `grad-vue-elements.css` file contains global styles and CSS custom properties (variables) used by the components.
- **Attributes vs Props**: Primitive types (strings, booleans, numbers) can be passed as attributes. For complex types like arrays or objects, you should set them as properties via JavaScript:
  ```javascript
  const table = document.querySelector('g-table');
  table.items = [ { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' } ];
  ```

### Known Limitations

- **Popover positioning**: Popovers render in-place (not teleported) in custom element mode. This works correctly with `position: fixed` but may be clipped by ancestors with `overflow: hidden`.
- **Scoped slot props**: The trigger slot in `<g-popover>` cannot pass the `toggle` function to slotted content in CE mode. Use the exposed `toggle()` method on the element instead.
- **Tooltip trigger slot props**: `g-tooltip` does not currently expose slot props in custom elements mode.
