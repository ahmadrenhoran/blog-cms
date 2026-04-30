<script setup lang="ts">
const publicApiBaseUrl = 'https://acaca28-backend.hf.space/api/v1/post/creator'

const creatorListUrl = `${publicApiBaseUrl}/:userId`
const creatorDetailUrl = `${publicApiBaseUrl}/:userId/:postId`

const creatorListCurl = `curl "${publicApiBaseUrl}/7"`
const creatorDetailCurl = `curl "${publicApiBaseUrl}/7/12"`

const creatorListFetch = `const userId = 7

async function getCreatorPosts() {
  const response = await fetch(\`https://acaca28-backend.hf.space/api/v1/post/creator/\${userId}\`)
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch creator posts')
  }

  return result.data
}`

const creatorDetailFetch = `const userId = 7
const postId = 12

async function getCreatorPostDetail() {
  const response = await fetch(
    \`https://acaca28-backend.hf.space/api/v1/post/creator/\${userId}/\${postId}\`
  )
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch post detail')
  }

  return result.data
}`

const creatorListAxios = `import axios from 'axios'

const userId = 7

async function getCreatorPosts() {
  const { data } = await axios.get(
    \`https://acaca28-backend.hf.space/api/v1/post/creator/\${userId}\`
  )

  return data.data
}`

const creatorRenderExample = `const container = document.querySelector('#posts')
const posts = await getCreatorPosts()

container.innerHTML = posts.map(post => \`
  <article>
    <h2>\${post.title}</h2>
    <p>\${post.excerpt || ''}</p>
    <a href="/blog/\${post.slug}">Baca selengkapnya</a>
  </article>
\`).join('')`

const creatorListResponse = `{
  "success": true,
  "message": "Posts fetched successfully",
  "data": [
    {
      "id": 12,
      "title": "Belajar Menulis Blog yang Konsisten",
      "slug": "belajar-menulis-blog-yang-konsisten",
      "excerpt": "Tips menjaga ritme menulis agar blog tetap hidup.",
      "status": "published",
      "coverImage": "https://cdn.example.com/cover.jpg",
      "createdAt": "2026-04-30T08:10:00.000Z",
      "updatedAt": "2026-04-30T08:10:00.000Z"
    }
  ]
}`

const creatorDetailResponse = `{
  "success": true,
  "message": "Post fetched successfully",
  "data": {
    "id": 12,
    "title": "Belajar Menulis Blog yang Konsisten",
    "slug": "belajar-menulis-blog-yang-konsisten",
    "excerpt": "Tips menjaga ritme menulis agar blog tetap hidup.",
    "content": "<p>Isi artikel lengkap...</p>",
    "status": "published",
    "coverImage": "https://cdn.example.com/cover.jpg",
    "createdAt": "2026-04-30T08:10:00.000Z",
    "updatedAt": "2026-04-30T08:10:00.000Z"
  }
}`
</script>

<template>
  <div class="min-h-screen bg-[#f7f1e8] text-stone-900">
    <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,154,106,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.1),transparent_24%)]"></div>

    <main class="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section class="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_24px_80px_rgba(28,25,23,0.1)]">
        <div class="border-b border-stone-200 bg-[linear-gradient(135deg,#fffaf4_0%,#f7efe5_100%)] px-6 py-8 sm:px-8">
          <p class="text-xs font-medium uppercase tracking-[0.28em] text-stone-500">Public API Docs</p>
          <h1 class="mt-3 font-serif text-3xl font-semibold tracking-tight text-stone-950">Creator Posts API</h1>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
            Endpoint ini public, tidak membutuhkan auth, dan hanya mengembalikan post dengan status
            <code>published</code>. Cocok dipakai creator untuk menampilkan daftar blog atau halaman detail post di website mereka sendiri.
          </p>
        </div>

        <div class="space-y-8 px-6 py-8 sm:px-8">
          <section class="rounded-[1.5rem] border border-stone-200 bg-[#fcfaf7] p-5">
            <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Quick Start</p>
            <div class="mt-4 grid gap-4 lg:grid-cols-2">
              <div class="rounded-2xl border border-stone-200 bg-white p-4">
                <div class="flex items-center gap-3">
                  <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">GET</span>
                  <code class="text-sm text-stone-800">{{ creatorListUrl }}</code>
                </div>
                <p class="mt-3 text-sm leading-7 text-stone-600">Ambil semua post published milik creator berdasarkan <code>userId</code>.</p>
              </div>
              <div class="rounded-2xl border border-stone-200 bg-white p-4">
                <div class="flex items-center gap-3">
                  <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">GET</span>
                  <code class="text-sm text-stone-800">{{ creatorDetailUrl }}</code>
                </div>
                <p class="mt-3 text-sm leading-7 text-stone-600">Ambil satu post published milik creator berdasarkan <code>userId</code> dan <code>postId</code>.</p>
              </div>
            </div>
          </section>

          <section class="rounded-[1.5rem] border border-stone-200 bg-[#fcfaf7] p-5">
            <div class="flex flex-wrap items-center gap-3">
              <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">GET</span>
              <code class="text-sm text-stone-800">{{ creatorListUrl }}</code>
            </div>
            <p class="mt-4 text-sm leading-7 text-stone-600">Gunakan endpoint ini saat ingin menampilkan halaman daftar artikel creator.</p>

            <div class="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Path Params</p>
                <div class="mt-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                  <div><code>userId</code>: ID creator</div>
                </div>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">cURL</p>
                <pre class="mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100"><code>{{ creatorListCurl }}</code></pre>
              </div>
            </div>

            <div class="mt-5">
              <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Example Response</p>
              <pre class="mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100"><code>{{ creatorListResponse }}</code></pre>
            </div>
          </section>

          <section class="rounded-[1.5rem] border border-stone-200 bg-[#fcfaf7] p-5">
            <div class="flex flex-wrap items-center gap-3">
              <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">GET</span>
              <code class="text-sm text-stone-800">{{ creatorDetailUrl }}</code>
            </div>
            <p class="mt-4 text-sm leading-7 text-stone-600">Gunakan endpoint ini saat ingin menampilkan halaman detail satu artikel.</p>

            <div class="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Path Params</p>
                <div class="mt-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
                  <div><code>userId</code>: ID creator</div>
                  <div class="mt-2"><code>postId</code>: ID post</div>
                </div>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">cURL</p>
                <pre class="mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100"><code>{{ creatorDetailCurl }}</code></pre>
              </div>
            </div>

            <div class="mt-5">
              <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Example Response</p>
              <pre class="mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100"><code>{{ creatorDetailResponse }}</code></pre>
            </div>
          </section>

          <section class="rounded-[1.5rem] border border-stone-200 bg-[#fcfaf7] p-5">
            <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Consume from Website</p>
            <p class="mt-3 text-sm leading-7 text-stone-600">Contoh paling umum untuk dipakai creator di website mereka adalah `fetch` atau `axios` dari frontend.</p>

            <div class="mt-5 grid gap-5 xl:grid-cols-2">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Fetch for Post List</p>
                <pre class="mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100"><code>{{ creatorListFetch }}</code></pre>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Fetch for Post Detail</p>
                <pre class="mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100"><code>{{ creatorDetailFetch }}</code></pre>
              </div>
            </div>

            <div class="mt-5 grid gap-5 xl:grid-cols-2">
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Axios Example</p>
                <pre class="mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100"><code>{{ creatorListAxios }}</code></pre>
              </div>
              <div>
                <p class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Render Example</p>
                <pre class="mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100"><code>{{ creatorRenderExample }}</code></pre>
              </div>
            </div>
          </section>

          <section class="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
            Tidak perlu header auth untuk dua endpoint ini.<br />
            Jika post belum <code>published</code>, endpoint public ini tidak akan mengembalikannya.<br />
            Endpoint AI writer <code>POST /api/v1/ai/writing</code> tetap private dan membutuhkan auth.
          </section>
        </div>
      </section>
    </main>
  </div>
</template>
