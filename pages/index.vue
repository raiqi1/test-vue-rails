<script setup lang="ts">
interface Restaurant {
  id: number;
  name: string;
  address: string;
  phone?: string;
  opening_hours?: string;
}

interface ApiResponse {
  data: Restaurant[];
  meta: { current_page: number; total_pages: number; total_count: number; per_page: number };
}

const api = useApi();

const search = ref("");
const page = ref(1);
const showCreate = ref(false);
const creating = ref(false);
const apiErrors = ref<string[]>([]);

const { data, refresh, pending } = await useAsyncData<ApiResponse>(
  "restaurants",
  () => api.get("/restaurants", { page: page.value, per_page: 12 }),
  { watch: [page] }
);

const restaurants = computed(() => {
  const list = data.value?.data ?? [];
  if (!search.value.trim()) return list;
  return list.filter((r) => r.name.toLowerCase().includes(search.value.toLowerCase()));
});

const meta = computed(() => data.value?.meta);

const createRestaurant = async (form: any) => {
  creating.value = true;
  apiErrors.value = [];
  try {
    await api.post("/restaurants", { restaurant: form });
    showCreate.value = false;
    await refresh();
  } catch (e: any) {
    apiErrors.value = e?.data?.errors ?? ["Something went wrong"];
  } finally {
    creating.value = false;
  }
};

const deleteRestaurant = async (id: number) => {
  if (!confirm("Delete this restaurant and all its menu items?")) return;
  await api.del(`/restaurants/${id}`);
  await refresh();
};
</script>

<template>
  <div>
    <!-- Header row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Restaurants</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ meta?.total_count ?? 0 }} total</p>
      </div>
      <button
        @click="showCreate = true"
        class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Restaurant
      </button>
    </div>

    <!-- Search -->
    <div class="relative mb-6">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        v-model="search"
        type="text"
        placeholder="Search restaurants…"
        class="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
    </div>

    <!-- Loading -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div class="h-5 bg-gray-200 rounded w-3/4 mb-3" />
        <div class="h-4 bg-gray-100 rounded w-full mb-2" />
        <div class="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!restaurants.length" class="text-center py-20 text-gray-400">
      <p class="text-5xl mb-3">🍽️</p>
      <p class="font-medium">No restaurants found</p>
      <p class="text-sm mt-1">Add one to get started</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="r in restaurants"
        :key="r.id"
        class="bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-md transition-all group flex flex-col"
      >
        <NuxtLink :to="`/restaurants/${r.id}`" class="p-5 flex-1">
          <h2 class="font-semibold text-gray-900 group-hover:text-brand-600 transition">{{ r.name }}</h2>
          <p class="text-sm text-gray-500 mt-1 flex items-start gap-1.5">
            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ r.address }}
          </p>
          <p v-if="r.phone" class="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {{ r.phone }}
          </p>
          <p v-if="r.opening_hours" class="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ r.opening_hours }}
          </p>
        </NuxtLink>

        <div class="px-5 pb-4 flex justify-between items-center border-t border-gray-100 pt-3">
          <NuxtLink
            :to="`/restaurants/${r.id}`"
            class="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            View menu →
          </NuxtLink>
          <button
            @click="deleteRestaurant(r.id)"
            class="text-gray-400 hover:text-red-500 transition p-1 rounded"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="meta" class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 pt-5">
      <!-- Info -->
      <p class="text-sm text-gray-500 order-2 sm:order-1">
        Page <span class="font-medium text-gray-700">{{ meta.current_page }}</span>
        of <span class="font-medium text-gray-700">{{ meta.total_pages }}</span>
        &nbsp;·&nbsp;
        <span class="font-medium text-gray-700">{{ meta.total_count }}</span> restaurants total
      </p>

      <!-- Controls -->
      <div class="flex items-center gap-1 order-1 sm:order-2">
        <!-- Jump to first -->
        <button
          @click="page = 1"
          :disabled="page === 1"
          title="First page"
          class="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-mono"
        >«</button>

        <!-- Prev -->
        <button
          @click="page--"
          :disabled="page === 1"
          title="Previous page"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >‹ Prev</button>

        <!-- Page numbers -->
        <template v-for="p in meta.total_pages" :key="p">
          <button
            v-if="meta.total_pages <= 7 || Math.abs(p - page) <= 1 || p === 1 || p === meta.total_pages"
            @click="page = p"
            :class="[
              'px-3 py-1.5 text-sm border rounded-lg transition min-w-[36px]',
              p === page
                ? 'bg-brand-600 border-brand-600 text-white font-medium'
                : 'border-gray-300 hover:bg-gray-50 text-gray-700'
            ]"
          >{{ p }}</button>
          <span
            v-else-if="(p === page - 2 && p !== 2) || (p === page + 2 && p !== meta.total_pages - 1)"
            class="px-1 text-gray-400 text-sm"
          >…</span>
        </template>

        <!-- Next -->
        <button
          @click="page++"
          :disabled="page === meta.total_pages"
          title="Next page"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >Next ›</button>

        <!-- Jump to last -->
        <button
          @click="page = meta.total_pages"
          :disabled="page === meta.total_pages"
          title="Last page"
          class="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-mono"
        >»</button>
      </div>
    </div>

    <!-- Create Modal -->
    <AppModal title="Add Restaurant" :show="showCreate" @close="showCreate = false; apiErrors = []">
      <div v-if="apiErrors.length" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
        <p v-for="e in apiErrors" :key="e" class="text-sm text-red-600">{{ e }}</p>
      </div>
      <RestaurantForm :loading="creating" @submit="createRestaurant" />
    </AppModal>
  </div>
</template>
