<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import TextField from '@/components/forms/TextField.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import DialogConfirm from '@/components/DialogConfirm.vue'
import Navbar from '@/components/Navbar.vue'
import { getErrorMessage, uploadSingleFile } from '@/utils/utils'
import { createPost, getPosts, updatePost, deletePost as deletePostService } from '../services/home.service'
import {
  generateWritingAssistance,
  type AIWritingAction,
} from '../services/ai-writing.service'

type BlogStatus = 'draft' | 'published' | 'archived'

interface BlogPost {
  id: number
  user_id: number
  title: string
  slug: string
  excerpt: string
  status: BlogStatus
  content: string
  coverImage: string
  createdAt: string
  updatedAt: string
}

const router = useRouter()
const authStore = useAuthStore()

const blogs = ref<BlogPost[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingBlogId = ref<number | null>(null)
const saving = ref(false)
const showAiPanel = ref(false)

const confirmVisible = ref(false)
const confirmMessage = ref('')
const confirmId = ref<number | null>(null)

const form = reactive({
  title: '',
  status: 'draft' as BlogStatus,
  content: '',
})

const aiPromptSuggestions = [
  'Nada profesional tapi tetap hangat',
  'Fokus ke manfaat praktis untuk pembaca',
  'Tambahkan hook pembuka yang kuat',
  'Optimalkan agar lebih SEO-friendly',
  'Gunakan contoh konkret dan mudah dipahami',
]

const aiState = reactive({
  prompt: '',
  result: '',
  model: '',
  lastAction: 'draft' as AIWritingAction,
  usage: null as null | Record<string, unknown>,
  error: '',
  loading: false,
})

const coverImageFile = ref<File | null>(null)
const coverImagePreview = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const showCoverModal = ref(false)

const isEditMode = computed(() => editingBlogId.value !== null)
const isAiConfigured = computed(() => authStore.isAuthenticated)
const plainContent = computed(() => stripHtml(form.content))
const aiHasContext = computed(() => Boolean(form.title.trim() || plainContent.value.trim() || aiState.prompt.trim()))

const usageSummary = computed(() => {
  if (!aiState.usage) return ''
  const totalTokens = aiState.usage.total_tokens
  const promptTokens = aiState.usage.prompt_tokens
  const completionTokens = aiState.usage.completion_tokens
  if (typeof totalTokens === 'number') return `${totalTokens} tokens`
  if (typeof promptTokens === 'number' || typeof completionTokens === 'number')
    return `${promptTokens || 0}/${completionTokens || 0} tokens`
  return ''
})

const aiContextSummary = computed(() => ([
  { label: 'Judul', ready: Boolean(form.title.trim()) },
  { label: 'Draft', ready: Boolean(plainContent.value) },
  { label: 'Prompt', ready: Boolean(aiState.prompt.trim()) },
]))

const aiResultPrimaryActionLabel = computed(() =>
  aiState.lastAction === 'title' ? 'Pakai jadi judul' : 'Ganti isi editor'
)
const aiResultSecondaryActionLabel = computed(() =>
  aiState.lastAction === 'title' ? '' : 'Tambahkan ke editor'
)
const aiIntentLabel = computed(() => {
  const labels: Record<AIWritingAction, string> = {
    outline: 'Outline',
    draft: 'Draft',
    improve: 'Rewrite',
    title: 'Judul',
    cta: 'Penutup',
  }
  return labels[aiState.lastAction]
})

const wordCount = computed(() => {
  const text = form.content.replace(/<[^>]*>/g, '').trim()
  return text ? text.split(/\s+/).length : 0
})
const charCount = computed(() => form.content.replace(/<[^>]*>/g, '').length)

const statusOptions: { label: string; value: BlogStatus }[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]
const statusLabel: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}
const statusClass: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800 border-amber-200',
  published: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  archived: 'bg-stone-100 text-stone-600 border-stone-200',
}

const editorOptions = {
  placeholder: 'Mulai menulis blog Anda di sini...',
  theme: 'snow',
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  },
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function textToHtml(input: string) {
  const lines = input.replace(/\r/g, '').split('\n')
  const chunks: string[] = []
  let listBuffer: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = () => {
    if (!listBuffer.length || !listType) return
    chunks.push(`<${listType}>${listBuffer.join('')}</${listType}>`)
    listBuffer = []
    listType = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) { flushList(); continue }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/)
    if (headingMatch) {
      flushList()
      chunks.push(`<h${headingMatch[1]!.length}>${escapeHtml(headingMatch[2] ?? line)}</h${headingMatch[1]!.length}>`)
      continue
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/)
    if (orderedMatch) {
      if (listType && listType !== 'ol') flushList()
      listType = 'ol'
      listBuffer.push(`<li>${escapeHtml(orderedMatch[1] ?? line)}</li>`)
      continue
    }

    const bulletMatch = line.match(/^[-*]\s+(.*)$/)
    if (bulletMatch) {
      if (listType && listType !== 'ul') flushList()
      listType = 'ul'
      listBuffer.push(`<li>${escapeHtml(bulletMatch[1] ?? line)}</li>`)
      continue
    }

    flushList()
    chunks.push(`<p>${escapeHtml(line)}</p>`)
  }

  flushList()
  return chunks.join('')
}

function handleCoverImageSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    coverImageFile.value = file
    coverImagePreview.value = URL.createObjectURL(file)
    showCoverModal.value = false
  }
}
function removeCoverImage() {
  coverImageFile.value = null
  coverImagePreview.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}
function triggerFileInput() { fileInputRef.value?.click() }

function resetAiState() {
  aiState.prompt = ''
  aiState.result = ''
  aiState.model = ''
  aiState.lastAction = 'draft'
  aiState.usage = null
  aiState.error = ''
  aiState.loading = false
}

function applyPromptSuggestion(value: string) {
  aiState.prompt = aiState.prompt.trim() ? `${aiState.prompt.trim()}\n${value}` : value
}

function applyAiPrimaryAction() {
  if (aiState.lastAction === 'title') {
    form.title = aiState.result.trim()
    return
  }
  form.content = textToHtml(aiState.result)
}

function appendAiToEditor() {
  const html = textToHtml(aiState.result)
  form.content = form.content.trim() ? `${form.content}${html}` : html
}

function resolveAiAction(): AIWritingAction {
  const prompt = aiState.prompt.toLowerCase()
  const hasContent = Boolean(plainContent.value.trim())
  if (/(judul|headline|title)/.test(prompt)) return 'title'
  if (/(penutup|cta|call to action|closing)/.test(prompt)) return 'cta'
  if (/(outline|kerangka|struktur)/.test(prompt)) return 'outline'
  if (hasContent) return 'improve'
  return 'draft'
}

async function generateWithAi() {
  if (aiState.loading || !aiHasContext.value) return
  const resolvedAction = resolveAiAction()
  aiState.loading = true
  aiState.error = ''
  aiState.lastAction = resolvedAction
  try {
    const response = await generateWritingAssistance({
      action: resolvedAction,
      prompt: aiState.prompt,
      title: form.title,
      content: plainContent.value,
    })
    aiState.result = response.text
    aiState.model = response.model
    aiState.usage = response.usage || null
  } catch (error) {
    aiState.error = getErrorMessage(error)
  } finally {
    aiState.loading = false
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function openCreateModal() {
  editingBlogId.value = null
  form.title = ''
  form.status = 'draft'
  form.content = ''
  removeCoverImage()
  resetAiState()
  showAiPanel.value = false
  showModal.value = true
}

function openEditModal(blog: BlogPost) {
  editingBlogId.value = blog.id
  form.title = blog.title
  form.status = blog.status
  form.content = blog.content
  coverImageFile.value = null
  coverImagePreview.value = blog.coverImage || ''
  resetAiState()
  showAiPanel.value = false
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  showAiPanel.value = false
  editingBlogId.value = null
  resetAiState()
}

async function fetchPosts() {
  loading.value = true
  try {
    const response = await getPosts()
    blogs.value = response.data.data.data ?? []
  } catch (e) {
    console.error('Failed to fetch posts', e)
  } finally {
    loading.value = false
  }
}

async function saveBlog() {
  if (!form.title.trim() || saving.value) return
  saving.value = true
  try {
    let coverImageUrl = coverImagePreview.value
    if (coverImageFile.value) {
      const uploadRes = await uploadSingleFile(coverImageFile.value)
      coverImageUrl = uploadRes.data.url
    }
    if (isEditMode.value && editingBlogId.value) {
      await updatePost(editingBlogId.value, {
        title: form.title, content: form.content, cover_image: coverImageUrl, status: form.status,
      })
    } else {
      await createPost({ title: form.title, content: form.content, cover_image: coverImageUrl })
    }
    closeModal()
    await fetchPosts()
  } catch (e) {
    console.error('Failed to save post', e)
  } finally {
    saving.value = false
  }
}

function askDeletePost(id: number) {
  confirmId.value = id
  confirmMessage.value = 'Yakin ingin menghapus blog ini? Tindakan ini tidak dapat dibatalkan.'
  confirmVisible.value = true
}

async function handleConfirmDelete() {
  if (confirmId.value === null) return
  try {
    await deletePostService(confirmId.value)
    await fetchPosts()
  } catch (e) {
    console.error('Failed to delete post', e)
  } finally {
    confirmId.value = null
  }
}

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(fetchPosts)
</script>

<template>
  <div class="min-h-screen bg-[#f7f1e8] text-stone-900">
    <div class="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,154,106,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(217,119,87,0.1),transparent_24%)]"></div>

    <Navbar :user-name="authStore.user?.name" @logout="logout" />

    <main class="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="font-serif text-3xl font-semibold tracking-tight text-stone-950">Blog Saya</h1>
          <p class="mt-1 text-sm text-stone-500">{{ blogs.length }} tulisan tersimpan</p>
        </div>
        <button type="button" class="rounded-2xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800" @click="openCreateModal">
          + Buat Blog
        </button>
      </div>

      <div v-if="loading" class="mt-12 flex justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900"></div>
      </div>

      <div v-else-if="blogs.length === 0" class="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-[#fffaf4] p-12 text-center">
        <h2 class="font-serif text-2xl font-semibold text-stone-950">Belum ada blog</h2>
        <p class="mt-2 max-w-sm text-sm text-stone-500">Mulai tulis cerita pertama Anda sekarang.</p>
        <button type="button" class="mt-6 rounded-2xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800" @click="openCreateModal">+ Buat Blog Baru</button>
      </div>

      <div v-else class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="blog in blogs"
          :key="blog.id"
          class="group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(28,25,23,0.06)] transition-all hover:shadow-[0_14px_40px_rgba(28,25,23,0.1)]"
        >
          <div class="relative h-40 overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
            <img v-if="blog.coverImage" :src="blog.coverImage" alt="" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div v-else class="flex h-full items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg>
            </div>
            <span class="absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm" :class="statusClass[blog.status]">{{ statusLabel[blog.status] }}</span>
          </div>
          <div class="flex flex-1 flex-col p-4">
            <h3 class="line-clamp-2 font-serif text-lg font-semibold leading-snug text-stone-950">{{ blog.title }}</h3>
            <p v-if="blog.excerpt" v-html="blog.excerpt" class="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-500"></p>
            <div class="mt-auto flex items-center justify-between gap-2 pt-4">
              <span class="text-xs text-stone-400">{{ formatDate(blog.updatedAt) }}</span>
              <div class="flex gap-1.5">
                <button type="button" class="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50" @click="openEditModal(blog)">Edit</button>
                <button type="button" class="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50" @click="askDeletePost(blog.id)">Hapus</button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>

    <!-- ── Full-screen Modal ── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex flex-col bg-[#faf8f4]">

          <!-- Top Bar -->
          <header class="editor-topbar flex items-center justify-between border-b border-stone-200 bg-white/90 px-6 py-3 backdrop-blur-md">
            <div class="flex min-w-0 items-center gap-2 sm:gap-4">
              <button type="button" class="flex flex-shrink-0 items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 sm:px-3" @click="closeModal">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
                <span class="hidden sm:inline">Kembali</span>
              </button>
              <div class="h-5 w-px flex-shrink-0 bg-stone-200"></div>
              <div class="flex min-w-0 items-center gap-2">
                <span class="hidden truncate text-xs font-medium uppercase tracking-[0.18em] text-stone-400 sm:inline">{{ isEditMode ? 'Edit Blog' : 'Blog Baru' }}</span>
                <!-- Status pill -->
                <select
                  v-if="isEditMode"
                  v-model="form.status"
                  class="rounded-full border px-3 py-1 text-xs font-semibold outline-none transition"
                  :class="statusClass[form.status]"
                >
                  <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
                <span v-else class="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Draft</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Word/char count -->
              <div class="hidden items-center gap-3 text-xs text-stone-400 sm:flex">
                <span><span class="font-semibold text-stone-700">{{ wordCount }}</span> kata</span>
                <span class="text-stone-200">•</span>
                <span><span class="font-semibold text-stone-700">{{ charCount }}</span> karakter</span>
              </div>
              <div class="h-5 w-px bg-stone-200"></div>
              <!-- Save -->
              <button
                type="button"
                class="rounded-xl bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
                :disabled="saving || !form.title.trim()"
                @click="saveBlog"
              >
                {{ saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>
          </header>

          <!-- Body: editor + ai panel -->
          <div class="relative flex min-h-0 flex-1 overflow-hidden">

            <!-- ── Editor Area ── -->
            <div
              class="min-h-0 flex-1 overflow-y-auto transition-all duration-300"
              :class="showAiPanel ? 'sm:mr-[400px]' : 'mr-0'"
            >
              <div class="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">

                <!-- Cover image strip -->
                <div class="mb-6">
                  <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleCoverImageSelect" />
                  <div v-if="coverImagePreview" class="group relative h-56 overflow-hidden rounded-2xl">
                    <img :src="coverImagePreview" alt="Cover" class="h-full w-full object-cover" />
                    <div class="absolute inset-0 flex items-center justify-center gap-3 bg-black/30 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                      <button type="button" class="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-stone-800 transition hover:bg-white" @click="triggerFileInput">Ganti foto</button>
                      <button type="button" class="rounded-full bg-red-500/90 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600" @click="removeCoverImage">Hapus</button>
                    </div>
                  </div>
                  <button
                    v-else
                    type="button"
                    class="flex w-full items-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white/60 px-5 py-4 text-sm text-stone-400 transition hover:border-stone-400 hover:bg-white hover:text-stone-600"
                    @click="triggerFileInput"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg>
                    <span>Tambahkan foto cover</span>
                    <span class="ml-auto text-xs text-stone-300">PNG, JPG, WEBP</span>
                  </button>
                </div>

                <!-- Title -->
                <textarea
                  v-model="form.title"
                  rows="2"
                  placeholder="Judul blog Anda..."
                  class="title-textarea mb-6 w-full resize-none border-none bg-transparent font-serif text-2xl sm:text-4xl font-bold leading-tight text-stone-950 outline-none placeholder:text-stone-300"
                  @input="e => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px' }"
                ></textarea>

                <!-- Quill editor -->
                <div class="quill-wrapper">
                  <QuillEditor v-model:content="form.content" content-type="html" :options="editorOptions" />
                </div>

              </div>
            </div>

            <!-- ── AI Panel (slide-in) ── -->
            <Transition name="ai-slide">
              <aside
                v-if="showAiPanel"
                class="fixed inset-0 sm:inset-auto sm:right-0 sm:top-[57px] sm:bottom-0 z-40 flex w-full sm:w-[400px] flex-col border-stone-200 bg-stone-950 text-white sm:border-l sm:shadow-[-20px_0_60px_rgba(28,25,23,0.12)]"
              >
                <!-- Panel header -->
                <div class="flex-shrink-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.28),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.14),transparent_50%)] px-5 py-5">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="ai-pulse-dot"></span>
                        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">AI Writing Assistant</p>
                      </div>
                      <h3 class="mt-2 font-serif text-xl font-semibold leading-snug text-white">Bantu nulis, langsung dari editor</h3>
                    </div>
                    <button type="button" class="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white" @click="showAiPanel = false">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>

                  <!-- Context chips -->
                  <div class="mt-4 flex flex-wrap gap-2">
                    <span
                      v-for="item in aiContextSummary"
                      :key="item.label"
                      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                      :class="item.ready
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                        : 'bg-white/6 text-white/35 border border-white/10'"
                    >
                      <span class="h-1.5 w-1.5 rounded-full" :class="item.ready ? 'bg-emerald-400' : 'bg-white/20'"></span>
                      {{ item.label }}
                    </span>
                    <span class="ml-auto rounded-full bg-white/8 px-2.5 py-1 text-[11px] text-white/35">Smart mode</span>
                  </div>
                </div>

                <!-- Panel scrollable body -->
                <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">

                  <!-- Prompt -->
                  <div>
                    <label class="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Permintaan ke AI</label>
                    <textarea
                      v-model="aiState.prompt"
                      rows="5"
                      class="ai-textarea w-full"
                      placeholder="Contoh: rapikan draft ini agar lebih mengalir, tambahkan pembuka kuat, tutup dengan CTA yang natural..."
                    ></textarea>
                    <p class="mt-2 text-[11px] leading-5 text-white/30">AI otomatis membaca judul dan draft yang sedang Anda tulis.</p>
                  </div>

                  <!-- Suggestion pills -->
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="s in aiPromptSuggestions"
                      :key="s"
                      type="button"
                      class="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[11px] text-white/50 transition hover:border-amber-400/30 hover:bg-amber-400/10 hover:text-amber-300"
                      @click="applyPromptSuggestion(s)"
                    >{{ s }}</button>
                  </div>

                  <div class="h-px bg-white/6"></div>

                  <!-- Result area -->
                  <div class="flex min-h-0 flex-1 flex-col">
                    <div class="mb-2 flex items-center justify-between">
                      <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">Hasil AI</label>
                      <div class="flex items-center gap-2">
                        <span v-if="usageSummary" class="text-[10px] text-white/25">{{ usageSummary }}</span>
                        <button v-if="aiState.result && !aiState.loading" type="button" class="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/40 transition hover:border-white/20 hover:text-white/60" @click="aiState.result = ''; aiState.error = ''">Bersihkan</button>
                      </div>
                    </div>

                    <!-- Error -->
                    <div v-if="aiState.error" class="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-300">
                      {{ aiState.error }}
                    </div>

                    <!-- Loading skeleton -->
                    <div v-else-if="aiState.loading" class="flex-1 rounded-2xl border border-white/8 bg-white/4 p-4">
                      <div class="mb-4 flex items-center gap-3">
                        <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/15">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18l-1.813-2.096a4.5 4.5 0 01-.977-1.314L4.5 10.5l4.09-.71a4.5 4.5 0 011.314-.977L12 7l2.096 1.813a4.5 4.5 0 011.314.977l4.09.71-1.71 4.09a4.5 4.5 0 01-.977 1.314L15 18l-.813-2.096a4.5 4.5 0 00-1.314-.977L12 13l-.873 1.927a4.5 4.5 0 00-1.314.977z"/></svg>
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-white">Menyusun {{ aiIntentLabel }}...</p>
                          <p class="text-[11px] text-white/40">Membaca konteks blog Anda</p>
                        </div>
                      </div>
                      <div class="space-y-2.5">
                        <div class="ai-skeleton h-2.5 w-full rounded-full"></div>
                        <div class="ai-skeleton h-2.5 w-11/12 rounded-full"></div>
                        <div class="ai-skeleton h-2.5 w-10/12 rounded-full"></div>
                        <div class="ai-skeleton h-2.5 w-full rounded-full" style="animation-delay:0.15s"></div>
                        <div class="ai-skeleton h-2.5 w-8/12 rounded-full" style="animation-delay:0.3s"></div>
                        <div class="ai-skeleton h-2.5 w-11/12 rounded-full" style="animation-delay:0.1s"></div>
                        <div class="ai-skeleton h-2.5 w-9/12 rounded-full" style="animation-delay:0.25s"></div>
                      </div>
                    </div>

                    <!-- Result content -->
                    <div v-else-if="aiState.result" class="flex min-h-0 flex-1 flex-col">
                      <div class="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/8 bg-white/4 p-4 text-sm leading-7 whitespace-pre-wrap text-white/75">{{ aiState.result }}</div>
                      <div class="mt-3 grid grid-cols-2 gap-2">
                        <button type="button" class="rounded-xl bg-amber-400 px-3 py-2.5 text-xs font-bold text-stone-900 transition hover:bg-amber-300" @click="applyAiPrimaryAction">
                          {{ aiResultPrimaryActionLabel }}
                        </button>
                        <button v-if="aiResultSecondaryActionLabel" type="button" class="rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-xs font-semibold text-white/70 transition hover:bg-white/12 hover:text-white" @click="appendAiToEditor">
                          {{ aiResultSecondaryActionLabel }}
                        </button>
                      </div>
                    </div>

                    <!-- Empty state -->
                    <div v-else class="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/8 px-6 py-10 text-center">
                      <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18l-1.813-2.096a4.5 4.5 0 01-.977-1.314L4.5 10.5l4.09-.71a4.5 4.5 0 011.314-.977L12 7l2.096 1.813a4.5 4.5 0 011.314.977l4.09.71-1.71 4.09a4.5 4.5 0 01-.977 1.314L15 18l-.813-2.096a4.5 4.5 0 00-1.314-.977L12 13l-.873 1.927a4.5 4.5 0 00-1.314.977z"/></svg>
                      </div>
                      <p class="text-sm text-white/30 leading-6">Tulis permintaan, lalu generate.<br />Hasil AI langsung bisa dipakai.</p>
                    </div>
                  </div>
                </div>

                <!-- Generate button -->
                <div class="flex-shrink-0 border-t border-white/8 p-4">
                  <div v-if="!isAiConfigured" class="mb-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2.5 text-xs leading-5 text-amber-300">
                    Login terlebih dahulu untuk menggunakan AI.
                  </div>
                  <button
                    type="button"
                    class="w-full rounded-xl bg-amber-400 px-4 py-3.5 text-sm font-bold text-stone-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="!isAiConfigured || aiState.loading || !aiHasContext"
                    @click="generateWithAi"
                  >
                    <span v-if="!aiState.loading">✦ Generate dengan AI</span>
                    <span v-else class="inline-flex items-center justify-center gap-2">
                      <span class="flex items-center gap-1">
                        <span class="ai-btn-dot"></span>
                        <span class="ai-btn-dot" style="animation-delay:0.15s"></span>
                        <span class="ai-btn-dot" style="animation-delay:0.3s"></span>
                      </span>
                      AI sedang menyusun hasil...
                    </span>
                  </button>
                </div>
              </aside>
            </Transition>

            <!-- ── Floating AI Button ── -->
            <Transition name="fab-pop">
              <button
                v-if="!showAiPanel"
                type="button"
                class="ai-fab fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 shadow-[0_4px_16px_rgba(28,25,23,0.26)] transition-all hover:scale-[1.04] active:scale-[0.97]"
                @click="showAiPanel = true"
              >
                <span class="fab-pulse-ring"></span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18l-1.813-2.096a4.5 4.5 0 01-.977-1.314L4.5 10.5l4.09-.71a4.5 4.5 0 011.314-.977L12 7l2.096 1.813a4.5 4.5 0 011.314.977l4.09.71-1.71 4.09a4.5 4.5 0 01-.977 1.314L15 18l-.813-2.096a4.5 4.5 0 00-1.314-.977L12 13l-.873 1.927a4.5 4.5 0 00-1.314.977z"/></svg>
                <span class="sm:hidden">AI</span>
                <span class="hidden sm:inline">AI Assistant</span>
                <span v-if="aiState.result" class="flex h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              </button>
            </Transition>

          </div>
        </div>
      </Transition>
    </Teleport>

    <DialogConfirm
      v-model="confirmVisible"
      title="Hapus Blog"
      :message="confirmMessage"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<style scoped>
/* ── Top bar ── */
.editor-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* ── Title textarea ── */
.title-textarea {
  scrollbar-width: none;
}
.title-textarea::-webkit-scrollbar { display: none; }

/* ── Quill ── */
.quill-wrapper {
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgb(231 229 228);
  background: white;
  transition: border-color 200ms, box-shadow 200ms;
}
.quill-wrapper:focus-within {
  border-color: rgb(168 162 158);
  box-shadow: 0 0 0 4px rgba(217 119 87 / 0.07);
}
.quill-wrapper :deep(.ql-toolbar.ql-snow) {
  border: none;
  border-bottom: 1px solid rgb(231 229 228);
  background: #fffaf4;
  padding: 10px 14px;
  font-family: inherit;
}
.quill-wrapper :deep(.ql-toolbar .ql-formats) { margin-right: 12px; }
.quill-wrapper :deep(.ql-toolbar button) { width: 32px; height: 32px; border-radius: 8px; transition: background-color 160ms; }
.quill-wrapper :deep(.ql-toolbar button:hover) { background: rgba(28 25 23 / 0.06); }
.quill-wrapper :deep(.ql-toolbar button.ql-active) { background: rgb(28 25 23); color: white; }
.quill-wrapper :deep(.ql-toolbar button.ql-active .ql-stroke) { stroke: white; }
.quill-wrapper :deep(.ql-toolbar button.ql-active .ql-fill) { fill: white; }
.quill-wrapper :deep(.ql-toolbar .ql-picker) { font-size: 13px; font-weight: 500; color: rgb(68 64 60); }
.quill-wrapper :deep(.ql-toolbar .ql-picker-label) { border-radius: 8px; border-color: transparent; padding: 4px 8px; transition: background-color 160ms; }
.quill-wrapper :deep(.ql-toolbar .ql-picker-label:hover) { background: rgba(28 25 23 / 0.06); color: rgb(28 25 23); }
.quill-wrapper :deep(.ql-toolbar .ql-picker.ql-expanded .ql-picker-label) { background: rgba(28 25 23 / 0.06); border-color: transparent; }
.quill-wrapper :deep(.ql-toolbar .ql-picker-options) { border: 1px solid rgb(231 229 228); border-radius: 12px; box-shadow: 0 12px 40px rgba(28 25 23 / 0.12); padding: 6px; background: white; }
.quill-wrapper :deep(.ql-toolbar .ql-picker-item) { border-radius: 6px; padding: 4px 8px; }
.quill-wrapper :deep(.ql-toolbar .ql-picker-item:hover) { background: #fffaf4; }
.quill-wrapper :deep(.ql-container.ql-snow) { border: none; font-family: inherit; font-size: 1rem; }
.quill-wrapper :deep(.ql-editor) { min-height: 320px; padding: 16px 20px; color: rgb(68 64 60); line-height: 1.9; font-size: 1rem; }
.quill-wrapper :deep(.ql-editor.ql-blank::before) { color: rgb(168 162 158); font-style: normal; left: 28px; right: 28px; }
.quill-wrapper :deep(.ql-editor h1) { color: rgb(28 25 23); font-family: var(--font-serif); font-size: 2rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1.2; margin: 1.5rem 0 0.75rem; }
.quill-wrapper :deep(.ql-editor h2) { color: rgb(28 25 23); font-family: var(--font-serif); font-size: 1.75rem; font-weight: 600; letter-spacing: -0.03em; line-height: 1.2; margin: 1.25rem 0 0.75rem; }
.quill-wrapper :deep(.ql-editor h3) { color: rgb(28 25 23); font-family: var(--font-serif); font-size: 1.35rem; font-weight: 600; line-height: 1.3; margin: 1rem 0 0.5rem; }
.quill-wrapper :deep(.ql-editor p) { margin: 0 0 1rem; }
.quill-wrapper :deep(.ql-editor blockquote) { border-left: 3px solid rgb(214 211 209); color: rgb(87 83 78); font-family: var(--font-serif); font-size: 1.15rem; margin: 1.25rem 0; padding-left: 1rem; }
.quill-wrapper :deep(.ql-editor ul), .quill-wrapper :deep(.ql-editor ol) { margin: 1rem 0; padding-left: 1.5rem; }
.quill-wrapper :deep(.ql-editor pre.ql-syntax) { background: rgb(28 25 23); color: rgb(214 211 209); border-radius: 14px; padding: 16px 20px; font-size: 0.875rem; line-height: 1.7; margin: 1rem 0; overflow-x: auto; }
.quill-wrapper :deep(.ql-editor a) { color: rgb(180 83 9); text-decoration: underline; text-underline-offset: 2px; }
.quill-wrapper :deep(.ql-editor img) { border-radius: 14px; margin: 1rem 0; max-width: 100%; }
.quill-wrapper :deep(.ql-tooltip) { border: 1px solid rgb(231 229 228); border-radius: 12px; box-shadow: 0 12px 40px rgba(28 25 23 / 0.12); padding: 8px 14px; background: white; z-index: 10; }
.quill-wrapper :deep(.ql-tooltip input[type='text']) { border: 1px solid rgb(231 229 228); border-radius: 8px; padding: 4px 8px; font-size: 13px; outline: none; }
.quill-wrapper :deep(.ql-tooltip a.ql-action), .quill-wrapper :deep(.ql-tooltip a.ql-remove) { color: rgb(180 83 9); font-weight: 600; font-size: 13px; }
.quill-wrapper :deep(.ql-color-picker .ql-picker-options) { padding: 8px; width: 196px; }
.quill-wrapper :deep(.ql-color-picker .ql-picker-item) { border-radius: 4px; width: 20px; height: 20px; margin: 2px; }

/* ── AI Panel textarea ── */
.ai-textarea {
  background: rgba(255 255 255 / 0.06);
  border: 1px solid rgba(255 255 255 / 0.1);
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 13px;
  color: rgba(255 255 255 / 0.85);
  font-family: inherit;
  resize: none;
  outline: none;
  transition: border-color 150ms;
  line-height: 1.6;
}
.ai-textarea::placeholder { color: rgba(255 255 255 / 0.22); }
.ai-textarea:focus { border-color: rgba(251 191 36 / 0.4); }

/* ── AI skeleton ── */
.ai-skeleton {
  background: linear-gradient(
    90deg,
    rgba(255 255 255 / 0.05) 0%,
    rgba(255 255 255 / 0.14) 50%,
    rgba(255 255 255 / 0.05) 100%
  );
  background-size: 200% 100%;
  animation: ai-shimmer 1.4s linear infinite;
}
@keyframes ai-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── AI pulse dot (panel header) ── */
.ai-pulse-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgb(251 191 36);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.65); }
}

/* ── AI btn dots (generate button loading) ── */
.ai-btn-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgb(120 90 0);
  animation: btn-bounce 1.1s ease-in-out infinite;
}
@keyframes btn-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-3px); opacity: 1; }
}

/* ── Floating AI button ── */
.ai-fab {
  background: rgb(251 191 36);
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 30;
}
.fab-pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid rgb(251 191 36);
  animation: fab-ring 2.8s ease-out infinite;
  opacity: 0;
  pointer-events: none;
}
@keyframes fab-ring {
  0% { transform: scale(1); opacity: 0.55; }
  100% { transform: scale(1.22); opacity: 0; }
}

/* ── Transitions ── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 220ms ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.ai-slide-enter-active { transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease; }
.ai-slide-leave-active { transition: transform 220ms ease-in, opacity 180ms ease-in; }
.ai-slide-enter-from { transform: translateX(100%); opacity: 0; }
.ai-slide-leave-to { transform: translateX(100%); opacity: 0; }

.fab-pop-enter-active { transition: transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease; }
.fab-pop-leave-active { transition: transform 180ms ease-in, opacity 150ms ease-in; }
.fab-pop-enter-from { transform: scale(0.7) translateY(12px); opacity: 0; }
.fab-pop-leave-to { transform: scale(0.8) translateY(8px); opacity: 0; }
</style>
