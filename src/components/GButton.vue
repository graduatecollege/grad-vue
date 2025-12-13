<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="buttonClasses"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  return [
    'g-button',
    `g-button--${props.variant}`,
    {
      'g-button--disabled': props.disabled
    }
  ]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.g-button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
}

.g-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.g-button--primary {
  background-color: #3b82f6;
  color: white;
}

.g-button--primary:hover:not(.g-button--disabled) {
  background-color: #2563eb;
}

.g-button--secondary {
  background-color: #6b7280;
  color: white;
}

.g-button--secondary:hover:not(.g-button--disabled) {
  background-color: #4b5563;
}

.g-button--outline {
  background-color: transparent;
  color: #3b82f6;
  border-color: #3b82f6;
}

.g-button--outline:hover:not(.g-button--disabled) {
  background-color: #eff6ff;
}

.g-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
