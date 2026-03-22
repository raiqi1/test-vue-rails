<script setup lang="ts">
const props = defineProps<{ category: string }>();

const colorMap: Record<string, string> = {
  appetizer: "bg-yellow-100 text-yellow-800",
  main:       "bg-blue-100 text-blue-800",
  dessert:    "bg-pink-100 text-pink-800",
  drink:      "bg-teal-100 text-teal-800",
};

const classes = computed(() => colorMap[props.category] ?? "bg-gray-100 text-gray-600");
</script>

<template>
  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', classes]">
    {{ category }}
  </span>
</template>
