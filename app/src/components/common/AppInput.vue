<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: string | number;
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  id: () => `input-${Math.random().toString(36).substr(2, 9)}`
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const hasError = computed(() => !!props.error);
</script>

<template>
  <div class="app-input-group" :class="{ 'has-error': hasError }">
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
      <span v-if="required" class="required-star">*</span>
    </label>
    
    <div class="input-wrapper">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="input-field transition-all"
        @input="onInput"
        @blur="emit('blur')"
        @focus="emit('focus')"
      />
    </div>

    <p v-if="error" class="error-text animate-fade-in">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.app-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xxs);
  width: 100%;
}

.input-label {
  font-size: var(--text-body-sm);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
}

.required-star {
  color: var(--color-error);
  margin-inline-start: 2px;
}

.input-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-md);
  background-color: var(--bg-input);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  color: var(--text-primary);
  outline: none;
}

.input-field:focus {
  border-color: var(--color-gold);
  box-shadow: 0 0 0 3px rgba(244, 168, 37, 0.15);
}

.input-field:disabled {
  background-color: var(--color-gray-100);
  cursor: not-allowed;
}

.has-error .input-field {
  border-color: var(--color-error);
}

.has-error .input-field:focus {
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.15);
}

.error-text {
  font-size: var(--text-caption);
  color: var(--color-error);
  margin-top: 2px;
}
</style>
