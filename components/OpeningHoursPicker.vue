<script setup lang="ts">
const props = defineProps<{ modelValue?: string }>();
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Parse existing string like "Mon-Sun 09:00 - 22:00"
const parse = (val?: string) => {
  if (!val) return { startDay: "Mon", endDay: "Sun", openTime: "09:00", closeTime: "22:00" };
  const m = val.match(/^(\w+)-(\w+)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
  if (m) return { startDay: m[1], endDay: m[2], openTime: m[3], closeTime: m[4] };
  return { startDay: "Mon", endDay: "Sun", openTime: "09:00", closeTime: "22:00" };
};

const p = parse(props.modelValue);
const startDay  = ref(p.startDay);
const endDay    = ref(p.endDay);
const openTime  = ref(p.openTime);
const closeTime = ref(p.closeTime);

// Emit formatted string whenever anything changes
watch([startDay, endDay, openTime, closeTime], () => {
  emit("update:modelValue", `${startDay.value}-${endDay.value} ${openTime.value} - ${closeTime.value}`);
}, { immediate: true });

const selectClass = "border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white";
const timeClass   = "border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white w-full";
</script>

<template>
  <div class="space-y-3">
    <!-- Day range -->
    <div>
      <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Days</label>
      <div class="flex items-center gap-2">
        <select v-model="startDay" :class="selectClass">
          <option v-for="d in DAYS" :key="d" :value="d">{{ d }}</option>
        </select>
        <span class="text-gray-400 text-sm font-medium">to</span>
        <select v-model="endDay" :class="selectClass">
          <option v-for="d in DAYS" :key="d" :value="d">{{ d }}</option>
        </select>
      </div>
    </div>

    <!-- Time range -->
    <div>
      <label class="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Hours</label>
      <div class="flex items-center gap-2">
        <input v-model="openTime"  type="time" :class="timeClass" />
        <span class="text-gray-400 text-sm font-medium shrink-0">–</span>
        <input v-model="closeTime" type="time" :class="timeClass" />
      </div>
    </div>

    <!-- Preview -->
    <div class="bg-brand-50 border border-brand-100 rounded-lg px-3 py-2 text-sm text-brand-700 font-medium">
      {{ startDay }}-{{ endDay }} {{ openTime }} – {{ closeTime }}
    </div>
  </div>
</template>
