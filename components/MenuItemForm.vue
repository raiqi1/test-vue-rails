<script setup lang="ts">
const props = defineProps<{
  initial?: {
    name: string; description?: string; price: number | string;
    category?: string; is_available?: boolean;
  };
  loading?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: {
    name: string; description: string; price: number;
    category: string; is_available: boolean;
  }];
}>();

const CATEGORIES = ["appetizer", "main", "dessert", "drink"];

const form = reactive({
  name:         props.initial?.name ?? "",
  description:  props.initial?.description ?? "",
  price:        props.initial?.price ?? "",
  category:     props.initial?.category ?? "",
  is_available: props.initial?.is_available ?? true,
});

const errors = ref<string[]>([]);

const handleSubmit = () => {
  errors.value = [];
  if (!form.name.trim()) errors.value.push("Name is required");
  if (!form.price || isNaN(Number(form.price))) errors.value.push("Valid price is required");
  if (Number(form.price) < 0) errors.value.push("Price must be 0 or more");
  if (errors.value.length) return;
  emit("submit", {
    name:         form.name,
    description:  form.description,
    price:        Number(form.price),
    category:     form.category,
    is_available: form.is_available,
  });
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
        placeholder="e.g. Tom Yum Kung"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea
        v-model="form.description"
        rows="2"
        placeholder="Short description of the dish…"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
      />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Price (THB) <span class="text-red-500">*</span></label>
        <input
          v-model="form.price"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          v-model="form.category"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
        >
          <option value="">— none —</option>
          <option v-for="cat in CATEGORIES" :key="cat" :value="cat" class="capitalize">{{ cat }}</option>
        </select>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        @click="form.is_available = !form.is_available"
        :class="[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          form.is_available ? 'bg-brand-500' : 'bg-gray-300',
        ]"
      >
        <span
          :class="[
            'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
            form.is_available ? 'translate-x-6' : 'translate-x-1',
          ]"
        />
      </button>
      <span class="text-sm text-gray-700">{{ form.is_available ? "Available" : "Unavailable" }}</span>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition"
    >
      {{ loading ? "Saving…" : "Save Menu Item" }}
    </button>
  </form>
</template>
