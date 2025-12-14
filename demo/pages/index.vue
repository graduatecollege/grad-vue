<script setup lang="ts">
import { ref } from 'vue';

// GButton
const clickCount = ref(0);
const handleClick = () => {
  clickCount.value++;
};

// GTextInput
const textValue = ref('');

// GSelect
const selectedValue = ref<string | number | undefined>(undefined);
const selectOptions = ref([
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]);

// GSelectButton
const selectButtonValue = ref('option1');
const selectButtonOptions = ref([
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]);

// GSearch
const searchQuery = ref('');
interface SearchResult {
  id: string | number;
  title: string;
}
const searchResults = ref<SearchResult[]>([
  { id: 1, title: 'Result 1' },
  { id: 2, title: 'Result 2' },
  { id: 3, title: 'Result 3' },
]);

// GProgress
const progressValue = ref(50);

// GPopover
const isPopoverOpen = ref(false);

// GAlertDialog
const showDialog = ref(false);
const handleConfirm = () => {
  showDialog.value = false;
  alert('Confirmed!');
};
const handleCancel = () => {
  showDialog.value = false;
  alert('Cancelled!');
};
</script>

<template>
  <div class="demo-page">
    <div class="demo-page__intro">
      <h1>Grad-Vue Component Library</h1>
      <p class="demo-page__description">
        Interactive demos showcasing all components available in the Grad-Vue library.
        Scroll down to explore each component with customizable props and live examples.
      </p>
    </div>

    <!-- GButton -->
    <section id="button" class="demo-section">
      <h2 class="demo-section__title">GButton</h2>
      
      <ComponentDemo
        name="Basic Button"
        description="A versatile button component with multiple size and theme options."
        :props-config="{
          size: {
            type: 'select',
            options: ['small', 'medium', 'large'],
            default: 'medium',
            label: 'Size'
          },
          theme: {
            type: 'select',
            options: ['primary', 'secondary', 'accent', 'danger', 'none'],
            default: 'primary',
            label: 'Theme'
          },
          outlined: {
            type: 'boolean',
            default: false,
            label: 'Outlined'
          },
          text: {
            type: 'boolean',
            default: false,
            label: 'Text Style'
          }
        }"
      >
        <template #default="{ props }">
          <GButton
            :size="props.size"
            :theme="props.theme"
            :outlined="props.outlined"
            :text="props.text"
            @click="handleClick"
          >
            Click Me ({{ clickCount }})
          </GButton>
        </template>
      </ComponentDemo>

      <ComponentDemo
        name="Button Sizes"
        description="Buttons are available in three sizes: small, medium (default), and large."
      >
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <GButton size="small">Small Button</GButton>
          <GButton size="medium">Medium Button</GButton>
          <GButton size="large">Large Button</GButton>
        </div>
      </ComponentDemo>

      <ComponentDemo
        name="Button Themes"
        description="Multiple theme options to match your application design."
      >
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <GButton theme="primary">Primary</GButton>
          <GButton theme="secondary">Secondary</GButton>
          <GButton theme="accent">Accent</GButton>
          <GButton theme="danger">Danger</GButton>
        </div>
      </ComponentDemo>

      <ComponentDemo
        name="Button Variants"
        description="Outlined and text variants for different use cases."
      >
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <GButton outlined>Outlined</GButton>
          <GButton text>Text Button</GButton>
          <GButton theme="accent" outlined>Accent Outlined</GButton>
        </div>
      </ComponentDemo>
    </section>

    <!-- GTextInput -->
    <section id="text-input" class="demo-section">
      <h2 class="demo-section__title">GTextInput</h2>
      
      <ComponentDemo
        name="Basic Text Input"
        description="A text input component with label and validation support."
        :props-config="{
          placeholder: {
            type: 'string',
            default: 'Enter text...',
            label: 'Placeholder'
          }
        }"
      >
        <template #default="{ props }">
          <GTextInput
            v-model="textValue"
            :placeholder="props.placeholder"
            label="Example Label"
          />
          <p style="margin-top: 1rem; color: #6b7280;">Value: {{ textValue }}</p>
        </template>
      </ComponentDemo>
    </section>

    <!-- GSelect -->
    <section id="select" class="demo-section">
      <h2 class="demo-section__title">GSelect</h2>
      
      <ComponentDemo
        name="Basic Select"
        description="A dropdown select component with customizable options."
      >
        <GSelect
          :model-value="selectedValue"
          @update:model-value="selectedValue = $event"
          :options="selectOptions"
          label="Select an option"
        />
        <p style="margin-top: 1rem; color: #6b7280;">Selected: {{ selectedValue }}</p>
      </ComponentDemo>

      <ComponentDemo
        name="Searchable Select"
        description="Select with search functionality to filter options."
      >
        <GSelect
          :model-value="selectedValue"
          @update:model-value="selectedValue = $event"
          :options="selectOptions"
          label="Searchable select"
          searchable
        />
      </ComponentDemo>
    </section>

    <!-- GSelectButton -->
    <section id="select-button" class="demo-section">
      <h2 class="demo-section__title">GSelectButton</h2>
      
      <ComponentDemo
        name="Basic Select Button"
        description="A button-style select component for choosing between options."
      >
        <GSelectButton
          v-model="selectButtonValue"
          :options="selectButtonOptions"
          label="Choose an option"
        />
        <p style="margin-top: 1rem; color: #6b7280;">Selected: {{ selectButtonValue }}</p>
      </ComponentDemo>
    </section>

    <!-- GSearch -->
    <section id="search" class="demo-section">
      <h2 class="demo-section__title">GSearch</h2>
      
      <ComponentDemo
        name="Basic Search"
        description="A search input component with autocomplete results."
        :props-config="{
          placeholder: {
            type: 'string',
            default: 'Search...',
            label: 'Placeholder'
          }
        }"
      >
        <template #default="{ props }">
          <GSearch
            :model-value="searchQuery"
            @update:model-value="searchQuery = $event"
            :placeholder="props.placeholder"
            :results="searchResults"
            @select="(item) => console.log('Selected:', item)"
          />
          <p style="margin-top: 1rem; color: #6b7280;">Search query: {{ searchQuery }}</p>
        </template>
      </ComponentDemo>
    </section>

    <!-- GProgress -->
    <section id="progress" class="demo-section">
      <h2 class="demo-section__title">GProgress</h2>
      
      <ComponentDemo
        name="Basic Progress"
        description="A progress indicator component."
        :props-config="{
          value: {
            type: 'number',
            default: 50,
            label: 'Progress Value'
          }
        }"
      >
        <template #default="{ props }">
          <GProgress :value="props.value" />
          <p style="margin-top: 1rem; color: #6b7280;">Progress: {{ props.value }}%</p>
        </template>
      </ComponentDemo>
    </section>

    <!-- GPopover -->
    <section id="popover" class="demo-section">
      <h2 class="demo-section__title">GPopover</h2>
      
      <ComponentDemo
        name="Basic Popover"
        description="A popover overlay component that appears relative to a trigger element."
      >
        <GPopover v-model="isPopoverOpen">
          <template #trigger>
            <GButton @click="isPopoverOpen = !isPopoverOpen">Toggle Popover</GButton>
          </template>
          <template #default>
            <div style="padding: 1rem; background: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="margin: 0;">This is popover content!</p>
              <GButton size="small" @click="isPopoverOpen = false" style="margin-top: 0.5rem;">Close</GButton>
            </div>
          </template>
        </GPopover>
      </ComponentDemo>
    </section>

    <!-- GAlertDialog -->
    <section id="alert-dialog" class="demo-section">
      <h2 class="demo-section__title">GAlertDialog</h2>
      
      <ComponentDemo
        name="Basic Alert Dialog"
        description="A modal alert dialog for important user confirmations. Click the button to open the dialog."
      >
        <GButton @click="showDialog = true">Open Alert Dialog</GButton>
        
        <Teleport to="body">
          <GAlertDialog
            v-if="showDialog"
            label="Important Notice"
            button-text="Confirm"
            @confirm="handleConfirm"
            @cancel="handleCancel"
          >
            <p>This is an important message that requires your attention. Please confirm or cancel.</p>
          </GAlertDialog>
        </Teleport>
      </ComponentDemo>
    </section>

    <!-- GAppHeader -->
    <section id="app-header" class="demo-section">
      <h2 class="demo-section__title">GAppHeader</h2>
      
      <ComponentDemo
        name="Basic App Header"
        description="An application header component with Block I branding and Illinois styling."
      >
        <GAppHeader>
          <template #title>
            <span style="font-size: 1.25rem; font-weight: 600;">Graduate College Portal</span>
          </template>
          <template #app-controls>
            <nav style="display: flex; gap: 1rem; align-items: center;">
              <a href="#" style="color: inherit; text-decoration: none;">Profile</a>
              <a href="#" style="color: inherit; text-decoration: none;">Settings</a>
              <GButton size="small">Logout</GButton>
            </nav>
          </template>
        </GAppHeader>
      </ComponentDemo>
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-page__intro {
  margin-bottom: 3rem;
}

.demo-page__intro h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  color: #1f2937;
}

.demo-page__description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #4b5563;
  margin: 0;
}

.demo-section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.demo-section__title {
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  font-size: 1.875rem;
  color: #1f2937;
}
</style>
