<script setup lang="ts">
interface MenuItem {
  id: number; name: string; description?: string;
  price: string; category?: string; is_available: boolean;
}
interface Restaurant {
  id: number; name: string; address: string;
  phone?: string; opening_hours?: string; menu_items: MenuItem[];
}
interface MenuMeta {
  current_page: number; total_pages: number; total_count: number; per_page: number;
}

const route = useRoute();
const router = useRouter();
const api = useApi();
const id = route.params.id as string;

const CATEGORIES = ["", "appetizer", "main", "dessert", "drink"];
const categoryFilter = ref("");
const nameSearch = ref("");
const menuPage = ref(1);

// Reset page when filters change
watch([categoryFilter, nameSearch], () => { menuPage.value = 1; });

// ─── Restaurant data ────────────────────────────────────────────────────────
const { data: restaurantData, refresh: refreshRestaurant } = await useAsyncData<{ data: Restaurant }>(
  `restaurant-${id}`,
  () => api.get(`/restaurants/${id}`)
);
const restaurant = computed(() => restaurantData.value?.data);

// ─── Menu items data (with pagination) ──────────────────────────────────────
const { data: menuData, refresh: refreshMenu } = await useAsyncData<{ data: MenuItem[]; meta: MenuMeta }>(
  `menu-${id}`,
  () => api.get(`/restaurants/${id}/menu_items`, {
    category: categoryFilter.value || undefined,
    name: nameSearch.value || undefined,
    page: menuPage.value,
    per_page: 8,
  }),
  { watch: [categoryFilter, nameSearch, menuPage] }
);
const menuItems = computed(() => menuData.value?.data ?? []);
const menuMeta = computed(() => menuData.value?.meta);

// ─── Price formatter (Thai Baht) ─────────────────────────────────────────────
const formatPrice = (price: string | number) =>
  `฿${Number(price).toLocaleString("th-TH")}`;

// ─── Edit restaurant ─────────────────────────────────────────────────────────
const showEditRestaurant = ref(false);
const savingRestaurant = ref(false);
const updateRestaurant = async (form: any) => {
  savingRestaurant.value = true;
  try {
    await api.put(`/restaurants/${id}`, { restaurant: form });
    showEditRestaurant.value = false;
    await refreshRestaurant();
  } finally {
    savingRestaurant.value = false;
  }
};

const deleteRestaurant = async () => {
  if (!confirm(`Delete "${restaurant.value?.name}" and all its menu items?`)) return;
  await api.del(`/restaurants/${id}`);
  router.push("/");
};

// ─── Add menu item ───────────────────────────────────────────────────────────
const showAddItem = ref(false);
const addingItem = ref(false);
const addItem = async (form: any) => {
  addingItem.value = true;
  try {
    await api.post(`/restaurants/${id}/menu_items`, { menu_item: form });
    showAddItem.value = false;
    await refreshMenu();
  } finally {
    addingItem.value = false;
  }
};

// ─── Edit menu item ──────────────────────────────────────────────────────────
const editingItem = ref<MenuItem | null>(null);
const savingItem = ref(false);
const updateItem = async (form: any) => {
  if (!editingItem.value) return;
  savingItem.value = true;
  try {
    await api.put(`/menu_items/${editingItem.value.id}`, { menu_item: form });
    editingItem.value = null;
    await refreshMenu();
  } finally {
    savingItem.value = false;
  }
};

const toggleAvailability = async (item: MenuItem) => {
  await api.put(`/menu_items/${item.id}`, { menu_item: { is_available: !item.is_available } });
  await refreshMenu();
};

const deleteItem = async (item: MenuItem) => {
  if (!confirm(`Delete "${item.name}"?`)) return;
  await api.del(`/menu_items/${item.id}`);
  await refreshMenu();
};

const categoryLabel = (cat: string) =>
  ({ appetizer: "🥗 Appetizer", main: "🍛 Main", dessert: "🍮 Dessert", drink: "🧋 Drink" }[cat] ?? cat);
</script>

<template>
  <div v-if="restaurant">
    <!-- Back -->
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 mb-6 transition">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      All Restaurants
    </NuxtLink>

    <!-- Restaurant header -->
    <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">{{ restaurant.name }}</h1>
          <div class="mt-2 space-y-1">
            <p class="text-sm text-gray-500 flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ restaurant.address }}
            </p>
            <p v-if="restaurant.phone" class="text-sm text-gray-500 flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {{ restaurant.phone }}
            </p>
            <p v-if="restaurant.opening_hours" class="text-sm text-gray-500 flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ restaurant.opening_hours }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            @click="showEditRestaurant = true"
            class="inline-flex items-center gap-1.5 text-sm border border-gray-300 hover:border-brand-400 hover:text-brand-600 px-3 py-1.5 rounded-lg transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            @click="deleteRestaurant"
            class="inline-flex items-center gap-1.5 text-sm border border-gray-300 hover:border-red-400 hover:text-red-500 px-3 py-1.5 rounded-lg transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Menu items section -->
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h2 class="text-lg font-semibold text-gray-900">
          Menu Items
          <span class="text-gray-400 font-normal text-base">({{ menuMeta?.total_count ?? 0 }})</span>
        </h2>
        <button
          @click="showAddItem = true"
          class="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          v-model="nameSearch"
          type="text"
          placeholder="Search by name…"
          class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <select
          v-model="categoryFilter"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
        >
          <option value="">All Categories</option>
          <option v-for="cat in CATEGORIES.filter(Boolean)" :key="cat" :value="cat">{{ categoryLabel(cat) }}</option>
        </select>
      </div>

      <!-- Empty -->
      <div v-if="!menuItems.length" class="text-center py-14 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
        <p class="text-4xl mb-2">🍴</p>
        <p class="font-medium">No menu items yet</p>
        <p class="text-sm mt-1">Add your first dish!</p>
      </div>

      <template v-else>
        <!-- Menu table -->
        <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-5 py-3 font-medium text-gray-600">Item</th>
                <th class="text-left px-5 py-3 font-medium text-gray-600 hidden sm:table-cell">Category</th>
                <th class="text-right px-5 py-3 font-medium text-gray-600">Harga</th>
                <th class="text-center px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Tersedia</th>
                <th class="px-5 py-3" />
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in menuItems" :key="item.id" class="hover:bg-gray-50 transition">
                <td class="px-5 py-4">
                  <p class="font-medium text-gray-900" :class="{ 'opacity-40 line-through': !item.is_available }">
                    {{ item.name }}
                  </p>
                  <p v-if="item.description" class="text-xs text-gray-400 mt-0.5 line-clamp-1">{{ item.description }}</p>
                </td>
                <td class="px-5 py-4 hidden sm:table-cell">
                  <AppBadge v-if="item.category" :category="item.category" />
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
                <td class="px-5 py-4 text-right font-semibold text-gray-800 whitespace-nowrap">
                  {{ formatPrice(item.price) }}
                </td>
                <td class="px-5 py-4 text-center hidden md:table-cell">
                  <button @click="toggleAvailability(item)" class="focus:outline-none" title="Toggle availability">
                    <span v-if="item.is_available" class="inline-block w-5 h-5 text-green-500">
                      <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    </span>
                    <span v-else class="inline-block w-5 h-5 text-gray-300">
                      <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
                    </span>
                  </button>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="editingItem = item" class="text-gray-400 hover:text-brand-600 transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="deleteItem(item)" class="text-gray-400 hover:text-red-500 transition">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Menu Pagination -->
        <div v-if="menuMeta" class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 pt-4">
          <!-- Info -->
          <p class="text-sm text-gray-500 order-2 sm:order-1">
            Page <span class="font-medium text-gray-700">{{ menuMeta.current_page }}</span>
            of <span class="font-medium text-gray-700">{{ menuMeta.total_pages }}</span>
            &nbsp;·&nbsp;
            <span class="font-medium text-gray-700">{{ menuMeta.total_count }}</span> items total
          </p>

          <!-- Controls -->
          <div class="flex items-center gap-1 order-1 sm:order-2">
            <!-- Jump to first -->
            <button
              @click="menuPage = 1"
              :disabled="menuPage === 1"
              title="First page"
              class="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-mono"
            >«</button>

            <!-- Prev -->
            <button
              @click="menuPage--"
              :disabled="menuPage === 1"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >‹ Prev</button>

            <!-- Page numbers -->
            <template v-for="p in menuMeta.total_pages" :key="p">
              <button
                v-if="menuMeta.total_pages <= 7 || Math.abs(p - menuPage) <= 1 || p === 1 || p === menuMeta.total_pages"
                @click="menuPage = p"
                :class="[
                  'px-3 py-1.5 text-sm border rounded-lg transition min-w-[36px]',
                  p === menuPage
                    ? 'bg-brand-600 border-brand-600 text-white font-medium'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700',
                ]"
              >{{ p }}</button>
              <span
                v-else-if="(p === menuPage - 2 && p !== 2) || (p === menuPage + 2 && p !== menuMeta.total_pages - 1)"
                class="px-1 text-gray-400 text-sm"
              >…</span>
            </template>

            <!-- Next -->
            <button
              @click="menuPage++"
              :disabled="menuPage === menuMeta.total_pages"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >Next ›</button>

            <!-- Jump to last -->
            <button
              @click="menuPage = menuMeta.total_pages"
              :disabled="menuPage === menuMeta.total_pages"
              title="Last page"
              class="px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition font-mono"
            >»</button>
          </div>
        </div>
      </template>
    </div>

    <!-- Edit Restaurant Modal -->
    <AppModal title="Edit Restaurant" :show="showEditRestaurant" @close="showEditRestaurant = false">
      <RestaurantForm :initial="restaurant" :loading="savingRestaurant" @submit="updateRestaurant" />
    </AppModal>

    <!-- Add Menu Item Modal -->
    <AppModal title="Add Menu Item" :show="showAddItem" @close="showAddItem = false">
      <MenuItemForm :loading="addingItem" @submit="addItem" />
    </AppModal>

    <!-- Edit Menu Item Modal -->
    <AppModal title="Edit Menu Item" :show="!!editingItem" @close="editingItem = null">
      <MenuItemForm v-if="editingItem" :initial="editingItem" :loading="savingItem" @submit="updateItem" />
    </AppModal>
  </div>

  <!-- 404 state -->
  <div v-else class="text-center py-20 text-gray-400">
    <p class="text-5xl mb-3">🔍</p>
    <p class="font-medium">Restaurant not found</p>
    <NuxtLink to="/" class="mt-4 inline-block text-sm text-brand-600 hover:underline">← Back to list</NuxtLink>
  </div>
</template>
