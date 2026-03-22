<script setup lang="ts">
const props = defineProps<{
  initial?: { name: string; address: string; phone?: string; opening_hours?: string };
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: { name: string; address: string; phone: string; opening_hours: string }];
}>();

const form = reactive({
  name:          props.initial?.name ?? "",
  address:       props.initial?.address ?? "",
  phone:         props.initial?.phone ?? "",
  opening_hours: props.initial?.opening_hours ?? "",
});

const errors = ref<string[]>([]);

const handleSubmit = () => {
  errors.value = [];
  if (!form.name.trim()) errors.value.push("Name is required");
  if (!form.address.trim()) errors.value.push("Address is required");
  if (errors.value.length) return;
  emit("submit", { ...form });
};
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div v-if="errors.length" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p v-for="e in errors" :key="e" class="text-sm text-red-600">{{ e }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-500">*</span></label>
      <input
        v-model="form.name"
        type="text"
        placeholder="e.g. Somboon Seafood"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Address <span class="text-red-500">*</span></label>
      <input
        v-model="form.address"
        type="text"
        placeholder="e.g. 169/7-12 Surawong Rd, Bangkok"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
      <input
        v-model="form.phone"
        type="text"
        placeholder="e.g. +66 2 233 3104"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
      <OpeningHoursPicker v-model="form.opening_hours" />
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition"
    >
      {{ loading ? "Saving…" : "Save Restaurant" }}
    </button>
  </form>
</template>
