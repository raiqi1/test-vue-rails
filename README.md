# Restaurant Menu Management — Frontend

Frontend untuk Restaurant Menu Management API, dibangun dengan **Nuxt 3**, **Vue 3**, dan **Tailwind CSS**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 |
| Language | Vue 3 (Composition API) |
| Styling | Tailwind CSS |
| Icons | Heroicons |
| HTTP Client | `$fetch` (Nuxt built-in) |

---

## Setup

### Prerequisites

- Node.js 18+
- Backend API berjalan (lihat [test-3 README](../test-3/README.md))

### 1. Install dependencies

```bash
cd test-3-fe
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Isi `.env`:

```
NUXT_PUBLIC_API_BASE=http://localhost:3000
NUXT_PUBLIC_API_KEY=rahasia123
```

| Variable | Keterangan |
|----------|-----------|
| `NUXT_PUBLIC_API_BASE` | URL backend Rails API |
| `NUXT_PUBLIC_API_KEY` | API key (harus sama dengan `API_KEY` di backend) |

### 3. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Fitur

- **Daftar Restaurant** — list semua restaurant dengan pagination & search
- **Detail Restaurant** — info restaurant + daftar menu items
- **CRUD Restaurant** — tambah, edit, hapus restaurant
- **CRUD Menu Items** — tambah, edit, hapus menu item per restaurant
- **Filter Menu** — filter by kategori (appetizer, main, dessert, drink) & search by nama
- **Pagination** — di semua list endpoint, lengkap dengan jump to first/last
- **Toggle Availability** — aktif/nonaktifkan menu item langsung dari tabel
- **Opening Hours Picker** — pilih hari & jam dengan UI yang proper

---

## Struktur Project

```
test-3-fe/
├── pages/
│   ├── index.vue                  # Halaman daftar restaurant
│   └── restaurants/
│       └── [id].vue               # Halaman detail restaurant + menu
├── components/
│   ├── AppModal.vue               # Reusable modal
│   ├── AppBadge.vue               # Badge kategori menu
│   ├── RestaurantCard.vue         # Card restaurant di list
│   ├── RestaurantForm.vue         # Form create/edit restaurant
│   ├── MenuItemForm.vue           # Form create/edit menu item
│   └── OpeningHoursPicker.vue     # Picker hari & jam operasional
├── composables/
│   └── useApi.ts                  # HTTP client wrapper (base URL + API key)
├── nuxt.config.ts
└── tailwind.config.js
```

---

## Build untuk Production

```bash
npm run build
npm run preview
```

---

## Catatan

- Kalau `NUXT_PUBLIC_API_KEY` dikosongkan dan backend juga tidak set `API_KEY`, auth dimatikan otomatis
- Frontend tidak memerlukan database — semua data dari backend API
