<template>
  <div class="action-menu-wrapper" @click.stop>
    <slot name="toggle"></slot>

    <div v-if="open" :class="['action-menu', alignClass]" role="menu">
      <button
        v-for="(it, idx) in items"
        :key="idx"
        :class="['action-item', { danger: it.danger } ]"
        @click="onClick(it)">
        {{ it.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  items: { type: Array, default: () => [] },
  align: { type: String, default: 'right' },
});

const emit = defineEmits(['close']);

const alignClass = props.align === 'left' ? 'align-left' : 'align-right';

function onClick(item) {
  if (typeof item.onClick === 'function') {
    try { item.onClick(); } catch (e) { /* swallow */ }
  }
  emit('close');
}
</script>

<style scoped>
.action-menu {
  position: absolute;
  top: 40px;
  background: var(--surface);
  border: 1px solid var(--muted-border);
  border-radius: 8px;
  box-shadow: var(--elevation-1);
  display: flex;
  flex-direction: column;
  padding: 6px;
  z-index: 30;
}

.action-menu.align-right { right: 0; }
.action-menu.align-left { left: 0; }

.action-item {
  padding: 8px 12px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--text);
}

.action-item.danger { color: var(--danger); }
</style>
