import{C as e,dt as t,h as n,p as r,s as i,u as a}from"./runtime-core.esm-bundler-BScFpKkF.js";var o={class:`min-h-screen bg-[#f7f1e8] text-stone-900`},s=`https://acaca28-backend.hf.space/api/v1/post/creator`,c=`const userId = 7

async function getCreatorPosts() {
  const response = await fetch(\`https://acaca28-backend.hf.space/api/v1/post/creator/\${userId}\`)
  const result = await response.json()

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch creator posts')
  }

  return result.data
}`,l=`const userId = 7
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
}`,u=`import axios from 'axios'

const userId = 7

async function getCreatorPosts() {
  const { data } = await axios.get(
    \`https://acaca28-backend.hf.space/api/v1/post/creator/\${userId}\`
  )

  return data.data
}`,d=`const container = document.querySelector('#posts')
const posts = await getCreatorPosts()

container.innerHTML = posts.map(post => \`
  <article>
    <h2>\${post.title}</h2>
    <p>\${post.excerpt || ''}</p>
    <a href="/blog/\${post.slug}">Baca selengkapnya</a>
  </article>
\`).join('')`,f=`{
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
}`,p=`{
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
}`,m=n({__name:`ApiDocs`,setup(n){let m=`${s}/:userId`,h=`${s}/:userId/:postId`,g=`curl "${s}/7"`,_=`curl "${s}/7/12"`;return(n,s)=>(e(),a(`div`,o,[s[23]||=i(`div`,{class:`pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,154,106,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.1),transparent_24%)]`},null,-1),i(`main`,{class:`relative mx-auto max-w-6xl px-4 py-10 sm:px-6`},[i(`section`,{class:`overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_24px_80px_rgba(28,25,23,0.1)]`},[s[22]||=i(`div`,{class:`border-b border-stone-200 bg-[linear-gradient(135deg,#fffaf4_0%,#f7efe5_100%)] px-6 py-8 sm:px-8`},[i(`p`,{class:`text-xs font-medium uppercase tracking-[0.28em] text-stone-500`},`Public API Docs`),i(`h1`,{class:`mt-3 font-serif text-3xl font-semibold tracking-tight text-stone-950`},`Creator Posts API`),i(`p`,{class:`mt-3 max-w-3xl text-sm leading-7 text-stone-600`},[r(` Endpoint ini public, tidak membutuhkan auth, dan hanya mengembalikan post dengan status `),i(`code`,null,`published`),r(`. Cocok dipakai creator untuk menampilkan daftar blog atau halaman detail post di website mereka sendiri. `)])],-1),i(`div`,{class:`space-y-8 px-6 py-8 sm:px-8`},[i(`section`,{class:`rounded-[1.5rem] border border-stone-200 bg-[#fcfaf7] p-5`},[s[4]||=i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`Quick Start`,-1),i(`div`,{class:`mt-4 grid gap-4 lg:grid-cols-2`},[i(`div`,{class:`rounded-2xl border border-stone-200 bg-white p-4`},[i(`div`,{class:`flex items-center gap-3`},[s[0]||=i(`span`,{class:`rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700`},`GET`,-1),i(`code`,{class:`text-sm text-stone-800`},t(m))]),s[1]||=i(`p`,{class:`mt-3 text-sm leading-7 text-stone-600`},[r(`Ambil semua post published milik creator berdasarkan `),i(`code`,null,`userId`),r(`.`)],-1)]),i(`div`,{class:`rounded-2xl border border-stone-200 bg-white p-4`},[i(`div`,{class:`flex items-center gap-3`},[s[2]||=i(`span`,{class:`rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700`},`GET`,-1),i(`code`,{class:`text-sm text-stone-800`},t(h))]),s[3]||=i(`p`,{class:`mt-3 text-sm leading-7 text-stone-600`},[r(`Ambil satu post published milik creator berdasarkan `),i(`code`,null,`userId`),r(` dan `),i(`code`,null,`postId`),r(`.`)],-1)])])]),i(`section`,{class:`rounded-[1.5rem] border border-stone-200 bg-[#fcfaf7] p-5`},[i(`div`,{class:`flex flex-wrap items-center gap-3`},[s[5]||=i(`span`,{class:`rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700`},`GET`,-1),i(`code`,{class:`text-sm text-stone-800`},t(m))]),s[9]||=i(`p`,{class:`mt-4 text-sm leading-7 text-stone-600`},`Gunakan endpoint ini saat ingin menampilkan halaman daftar artikel creator.`,-1),i(`div`,{class:`mt-5 grid gap-4 lg:grid-cols-2`},[s[7]||=i(`div`,null,[i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`Path Params`),i(`div`,{class:`mt-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700`},[i(`div`,null,[i(`code`,null,`userId`),r(`: ID creator`)])])],-1),i(`div`,null,[s[6]||=i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`cURL`,-1),i(`pre`,{class:`mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100`},[i(`code`,null,t(g))])])]),i(`div`,{class:`mt-5`},[s[8]||=i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`Example Response`,-1),i(`pre`,{class:`mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100`},[i(`code`,null,t(f))])])]),i(`section`,{class:`rounded-[1.5rem] border border-stone-200 bg-[#fcfaf7] p-5`},[i(`div`,{class:`flex flex-wrap items-center gap-3`},[s[10]||=i(`span`,{class:`rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700`},`GET`,-1),i(`code`,{class:`text-sm text-stone-800`},t(h))]),s[14]||=i(`p`,{class:`mt-4 text-sm leading-7 text-stone-600`},`Gunakan endpoint ini saat ingin menampilkan halaman detail satu artikel.`,-1),i(`div`,{class:`mt-5 grid gap-4 lg:grid-cols-2`},[s[12]||=i(`div`,null,[i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`Path Params`),i(`div`,{class:`mt-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700`},[i(`div`,null,[i(`code`,null,`userId`),r(`: ID creator`)]),i(`div`,{class:`mt-2`},[i(`code`,null,`postId`),r(`: ID post`)])])],-1),i(`div`,null,[s[11]||=i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`cURL`,-1),i(`pre`,{class:`mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100`},[i(`code`,null,t(_))])])]),i(`div`,{class:`mt-5`},[s[13]||=i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`Example Response`,-1),i(`pre`,{class:`mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100`},[i(`code`,null,t(p))])])]),i(`section`,{class:`rounded-[1.5rem] border border-stone-200 bg-[#fcfaf7] p-5`},[s[19]||=i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`Consume from Website`,-1),s[20]||=i(`p`,{class:`mt-3 text-sm leading-7 text-stone-600`},"Contoh paling umum untuk dipakai creator di website mereka adalah `fetch` atau `axios` dari frontend.",-1),i(`div`,{class:`mt-5 grid gap-5 xl:grid-cols-2`},[i(`div`,null,[s[15]||=i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`Fetch for Post List`,-1),i(`pre`,{class:`mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100`},[i(`code`,null,t(c))])]),i(`div`,null,[s[16]||=i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`Fetch for Post Detail`,-1),i(`pre`,{class:`mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100`},[i(`code`,null,t(l))])])]),i(`div`,{class:`mt-5 grid gap-5 xl:grid-cols-2`},[i(`div`,null,[s[17]||=i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`Axios Example`,-1),i(`pre`,{class:`mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100`},[i(`code`,null,t(u))])]),i(`div`,null,[s[18]||=i(`p`,{class:`text-xs font-medium uppercase tracking-[0.22em] text-stone-500`},`Render Example`,-1),i(`pre`,{class:`mt-3 overflow-x-auto rounded-2xl bg-stone-950 p-4 text-xs leading-6 text-stone-100`},[i(`code`,null,t(d))])])])]),s[21]||=i(`section`,{class:`rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950`},[r(` Tidak perlu header auth untuk dua endpoint ini.`),i(`br`),r(` Jika post belum `),i(`code`,null,`published`),r(`, endpoint public ini tidak akan mengembalikannya.`),i(`br`),r(` Endpoint AI writer `),i(`code`,null,`POST /api/v1/ai/writing`),r(` tetap private dan membutuhkan auth. `)],-1)])])])]))}});export{m as default};