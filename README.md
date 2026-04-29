# Blog CMS

Link: https://ahmadrenhoran.github.io/blog-cms/#/
Sistem manajemen konten (CMS) sederhana untuk blog, dibangun dengan Vue 3, TypeScript, dan Tailwind CSS 4.

## 🚀 Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Routing:** [Vue Router](https://router.vuejs.org/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Rich Text Editor:** [Vue Quill](https://vueup.github.io/vue-quill/)

## ✨ Fitur Utama

- **Authentication:** Sistem login dengan penyimpanan token JWT.
- **Protected Routes:** Guarding route untuk memastikan hanya user yang terautentikasi yang bisa mengakses dashboard.
- **Dynamic Layouts:** Sistem layout dinamis (AuthLayout & AppLayout).
- **Feature-based Architecture:** Struktur kode yang modular berdasarkan fitur.
- **API Interceptors:** Penanganan otomatis header Authorization dan normalisasi error response.
- **Reusable UI Components:** Komponen UI yang konsisten (LoadButton, TextField, DialogConfirm, dll).
- **File Upload:** Utility terintegrasi untuk menangani upload file.

## 📁 Struktur Proyek

```text
src/
├── api/          # Konfigurasi Axios dan interceptors
├── assets/       # Gambar dan file CSS global
├── components/   # Komponen UI yang dapat digunakan kembali
├── features/     # Modul per fitur (Auth, Home, dll)
│   └── [feature]/
│       ├── services/ # Logika API spesifik fitur
│       ├── stores/   # Store Pinia spesifik fitur
│       └── views/    # Halaman/Views fitur
├── layouts/      # Template layout (App, Auth)
├── router/       # Konfigurasi Vue Router
├── stores/       # Store Pinia global
└── utils/        # Fungsi helper dan utility
```

## 🛠️ Instalasi & Pengembangan

1.  **Clone repository:**
    ```bash
    git clone https://github.com/ahmadrenhoran/blog-cms.git
    cd blog-cms
    ```

2.  **Install dependensi:**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment:**
    Buat file `.env` di root folder dan sesuaikan:
    ```env
    VITE_API_BASE_URL=your_api_url
    ```

4.  **Jalankan development server:**
    ```bash
    npm run dev
    ```

5.  **Build untuk production:**
    ```bash
    npm run build
    ```

## 📄 Lisensi

Proyek ini bersifat private dan dikembangkan untuk kebutuhan internal.
