# Blog CMS

Blog CMS adalah aplikasi dashboard untuk menulis dan mengelola artikel blog. Aplikasi ini dibangun dengan Vue 3, Vite, TypeScript, Pinia, Vue Router, Tailwind CSS, Axios, dan Quill editor.

Selain fitur CMS standar, aplikasi ini juga dilengkapi AI Writing Assistant untuk membantu proses penulisan blog langsung dari editor.

## Fitur

- Autentikasi login dan register.
- Proteksi halaman dashboard untuk user yang sudah login.
- CRUD artikel blog.
- Status artikel: `draft`, `published`, dan `archived`.
- Rich text editor untuk menulis konten.
- Upload cover image.
- AI Writing Assistant untuk membuat outline, draft, ide judul, rewrite konten, dan CTA.
- Halaman public API docs untuk mengambil daftar dan detail post yang sudah published.

## Fitur AI Writing Assistant

AI Writing Assistant tersedia di editor blog dan membantu user mempercepat proses penulisan. Fitur ini dapat membaca konteks dari judul, isi draft, dan prompt tambahan yang ditulis user.

Kemampuan AI yang tersedia:

- Membuat draft artikel dari prompt awal.
- Membuat outline atau kerangka artikel.
- Memberikan ide judul atau headline.
- Rewrite dan improve konten yang sudah ada.
- Membuat penutup atau call-to-action.
- Menampilkan model AI yang dipakai dan ringkasan penggunaan token jika tersedia dari backend.

AI writer memakai endpoint backend `POST v1/ai/writing`, sehingga user harus login terlebih dahulu sebelum bisa memakai fitur ini.

## Tech Stack

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Tailwind CSS
- Axios
- Vue Quill

## Prasyarat

Gunakan Node.js sesuai konfigurasi project:

```bash
node ^20.19.0 || >=22.12.0
```

## Instalasi

```bash
npm install
```

Salin file environment:

```bash
cp .env.example .env
```

Isi konfigurasi berikut di `.env`:

```env
VITE_API_BASE_URL=https://your-backend.example.com/api/
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_OPENROUTER_MODEL=openrouter/free
```

Catatan:

- Request API utama memakai `VITE_API_BASE_URL`. Jika tidak diisi, aplikasi memakai fallback `http://localhost:3000`.
- Fitur AI diproses lewat backend melalui endpoint `v1/ai/writing`. Pastikan backend sudah dikonfigurasi dengan provider/model AI yang sesuai.

## Menjalankan Project

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

Deploy ke GitHub Pages:

```bash
npm run deploy
```

Project ini memakai base path `/blog-cms/` untuk deployment GitHub Pages.

## Struktur Project

```text
src/
  api/                 Konfigurasi Axios dan interceptor
  assets/              CSS dan image asset
  components/          Komponen reusable
  features/
    auth/              Login, register, dan auth store
    home/              Dashboard blog CMS dan service post
    public/            Halaman public API docs
  layouts/             Layout auth dan aplikasi utama
  router/              Konfigurasi routing dan route guard
  stores/              Store umum
  utils/               Helper umum dan upload file
```

## Route Aplikasi

- `/#/login` - halaman login dan register.
- `/#/` - dashboard CMS, membutuhkan autentikasi.
- `/#/api-docs` - dokumentasi public API untuk creator posts.

Router memakai hash history agar kompatibel dengan GitHub Pages.

## Endpoint Backend yang Dipakai

Semua endpoint di bawah relatif terhadap `VITE_API_BASE_URL`.

### Auth

- `POST v1/auth/login`
- `POST v1/auth/register`

### Posts

- `GET v1/post`
- `GET v1/post/:id`
- `POST v1/post`
- `PUT v1/post/:id`
- `DELETE v1/post/:id`

### Upload

- `POST v1/upload`

### AI Writer

- `POST v1/ai/writing`

Endpoint AI writer membutuhkan auth dan dipakai untuk membantu pembuatan konten blog.

## Public API Creator Posts

Halaman `/#/api-docs` mendokumentasikan endpoint public berikut:

- `GET https://acaca28-backend.hf.space/api/v1/post/creator/:userId`
- `GET https://acaca28-backend.hf.space/api/v1/post/creator/:userId/:postId`

Endpoint tersebut tidak membutuhkan auth dan hanya mengembalikan post dengan status `published`.

## Script NPM

```bash
npm run dev        # menjalankan development server
npm run build      # type-check dan build production
npm run preview    # preview hasil build
npm run deploy     # deploy dist ke gh-pages
```
