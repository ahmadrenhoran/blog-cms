<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/features/auth/stores/auth.store'
import TextField from '@/components/forms/TextField.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import DialogConfirm from '@/components/DialogConfirm.vue'
import { uploadSingleFile } from '@/utils/utils'
import { createPost, getPosts, updatePost, deletePost as deletePostService } from '../services/home.service'

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

// State
const blogs = ref<BlogPost[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingBlogId = ref<number | null>(null)
const saving = ref(false)

// Confirm dialog state
const confirmVisible = ref(false)
const confirmMessage = ref('')
const confirmId = ref<number | null>(null)

const form = reactive({
  title: '',
  status: 'draft' as BlogStatus,
  content: '',
})

const coverImageFile = ref<File | null>(null)
const coverImagePreview = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

const isEditMode = computed(() => editingBlogId.value !== null)

// Cover image handlers
function handleCoverImageSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    coverImageFile.value = file
    coverImagePreview.value = URL.createObjectURL(file)
  }
}

function removeCoverImage() {
  coverImageFile.value = null
  coverImagePreview.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

// Status helpers
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

// Quill config
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

const wordCount = computed(() => {
  const text = form.content.replace(/<[^>]*>/g, '').trim()
  return text ? text.split(/\s+/).length : 0
})

const charCount = computed(() => form.content.replace(/<[^>]*>/g, '').length)

// Format date
function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// Modal actions
function openCreateModal() {
  editingBlogId.value = null
  form.title = ''
  form.status = 'draft'
  form.content = ''
  removeCoverImage()
  showModal.value = true
}

function openEditModal(blog: BlogPost) {
  editingBlogId.value = blog.id
  form.title = blog.title
  form.status = blog.status
  form.content = blog.content
  coverImageFile.value = null
  coverImagePreview.value = blog.coverImage || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingBlogId.value = null
}

// API calls
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
        title: form.title,
        content: form.content,
        cover_image: coverImageUrl,
        status: form.status,
      })
    } else {
      await createPost({
        title: form.title,
        content: form.content,
        cover_image: coverImageUrl,
      })
    }

    closeModal()
    await fetchPosts()
  } catch (e) {
    console.error('Failed to save post', e)
  } finally {
    saving.value = false
  }
}

// Delete with confirm dialog
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

    <!-- ── Navbar ── -->
    <nav class="sticky top-0 z-30 border-b border-stone-200/60 bg-white/70 backdrop-blur-xl">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-sm font-bold text-white">B</div>
          <span class="font-serif text-lg font-semibold tracking-tight text-stone-900">Everyone's Blog</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="hidden text-sm font-medium text-stone-600 sm:inline">{{ authStore.user?.name || 'Writer' }}</span>
          <button type="button" class="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50" @click="logout">Keluar</button>
        </div>
      </div>
    </nav>

    <!-- ── Main Content ── -->
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

      <!-- Loading -->
      <div v-if="loading" class="mt-12 flex justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="blogs.length === 0" class="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-[#fffaf4] p-12 text-center">
        <h2 class="font-serif text-2xl font-semibold text-stone-950">Belum ada blog</h2>
        <p class="mt-2 max-w-sm text-sm text-stone-500">Mulai tulis cerita pertama Anda sekarang.</p>
        <button type="button" class="mt-6 rounded-2xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800" @click="openCreateModal">+ Buat Blog Baru</button>
      </div>

      <!-- Blog Cards Grid -->
      <div v-else class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="blog in blogs"
          :key="blog.id"
          class="group flex flex-col overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_8px_30px_rgba(28,25,23,0.06)] transition-all hover:shadow-[0_14px_40px_rgba(28,25,23,0.1)]"
        >
          <!-- Cover -->
          <div class="relative h-40 overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
            <img v-if="blog.coverImage" :src="blog.coverImage" alt="" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div v-else class="flex h-full items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg>
            </div>
            <span class="absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm" :class="statusClass[blog.status]">{{ statusLabel[blog.status] }}</span>
          </div>

          <!-- Body -->
          <div class="flex flex-1 flex-col p-4">
            <h3 class="line-clamp-2 font-serif text-lg font-semibold leading-snug text-stone-950">{{ blog.title }}</h3>
            <p v-if="blog.excerpt" v-html="blog.excerpt" class="mt-2 text-wrap line-clamp-3 text-sm leading-relaxed text-stone-500"></p>
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

    <!-- ── Modal Overlay ── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 sm:p-8" @mousedown.self="closeModal">
          <Transition name="modal-slide">
            <div v-if="showModal" class="relative w-full max-w-3xl rounded-3xl border border-stone-200/80 bg-white shadow-[0_30px_80px_rgba(28,25,23,0.18)]">
              <!-- Modal header -->
              <div class="flex items-center justify-between border-b border-stone-200 px-6 py-4">
                <div>
                  <p class="text-xs font-medium uppercase tracking-[0.2em] text-stone-400">{{ isEditMode ? 'Edit Blog' : 'Blog Baru' }}</p>
                  <h2 class="mt-1 font-serif text-xl font-semibold text-stone-950">{{ isEditMode ? 'Perbarui tulisan' : 'Tulis cerita baru' }}</h2>
                </div>
                <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700" @click="closeModal">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <!-- Modal body -->
              <div class="space-y-5 px-6 py-5 max-h-[calc(100vh-12rem)] overflow-y-auto">
                <TextField v-model="form.title" label="Judul" placeholder="Tulis judul blog" required />

                <!-- Cover image picker -->
                <div>
                  <label class="mb-2 block text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Cover Image</label>
                  <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleCoverImageSelect" />
                  <div v-if="coverImagePreview" class="relative overflow-hidden rounded-2xl border border-stone-200 bg-[#fffaf4]">
                    <img :src="coverImagePreview" alt="Cover preview" class="w-full max-h-48 object-cover" />
                    <div class="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/40 to-transparent p-3 opacity-0 transition-opacity hover:opacity-100">
                      <button type="button" class="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-700 backdrop-blur-sm transition hover:bg-white" @click="triggerFileInput">Ganti</button>
                      <button type="button" class="rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-red-600" @click="removeCoverImage">Hapus</button>
                    </div>
                  </div>
                  <button v-else type="button" class="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-[#fffaf4] px-6 py-8 transition hover:border-stone-400 hover:bg-[#fff6ec]" @click="triggerFileInput">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" /></svg>
                    <p class="text-sm font-medium text-stone-600">Pilih gambar cover</p>
                    <p class="text-xs text-stone-400">PNG, JPG, WEBP</p>
                  </button>
                </div>

                <!-- Status (edit only) -->
                <div v-if="isEditMode">
                  <label class="mb-2 block text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Status</label>
                  <select v-model="form.status" class="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-amber-100">
                    <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </div>

                <!-- Content editor -->
                <div>
                  <div class="mb-2 flex items-center justify-between">
                    <label class="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">Isi Blog</label>
                    <div class="flex gap-2 text-xs text-stone-400">
                      <span>{{ wordCount }} kata</span>
                      <span>•</span>
                      <span>{{ charCount }} karakter</span>
                    </div>
                  </div>
                  <div class="quill-wrapper">
                    <QuillEditor v-model:content="form.content" content-type="html" :options="editorOptions" />
                  </div>
                </div>
              </div>

              <!-- Modal footer -->
              <div class="flex justify-end gap-3 border-t border-stone-200 px-6 py-4">
                <button type="button" class="rounded-2xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-50" @click="closeModal">Batal</button>
                <button type="button" class="rounded-2xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50" :disabled="saving" @click="saveBlog">
                  {{ saving ? 'Menyimpan...' : 'Simpan Blog' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Confirm Delete Dialog ── -->
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
/* ── Quill wrapper styling ── */
.quill-wrapper {
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgb(231 229 228);
  background: white;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}

.quill-wrapper:focus-within {
  border-color: rgb(168 162 158);
  box-shadow: 0 0 0 4px rgba(217 119 87 / 0.08);
}

/* Toolbar */
.quill-wrapper :deep(.ql-toolbar.ql-snow) {
  border: none;
  border-bottom: 1px solid rgb(231 229 228);
  background: #fffaf4;
  padding: 10px 14px;
  font-family: inherit;
}

.quill-wrapper :deep(.ql-toolbar .ql-formats) {
  margin-right: 12px;
}

.quill-wrapper :deep(.ql-toolbar button) {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: background-color 160ms ease;
}

.quill-wrapper :deep(.ql-toolbar button:hover) {
  background: rgba(28 25 23 / 0.06);
}

.quill-wrapper :deep(.ql-toolbar button.ql-active) {
  background: rgb(28 25 23);
  color: white;
}

.quill-wrapper :deep(.ql-toolbar button.ql-active .ql-stroke) {
  stroke: white;
}

.quill-wrapper :deep(.ql-toolbar button.ql-active .ql-fill) {
  fill: white;
}

.quill-wrapper :deep(.ql-toolbar .ql-picker) {
  font-size: 13px;
  font-weight: 500;
  color: rgb(68 64 60);
}

.quill-wrapper :deep(.ql-toolbar .ql-picker-label) {
  border-radius: 8px;
  border-color: transparent;
  padding: 4px 8px;
  transition: background-color 160ms ease;
}

.quill-wrapper :deep(.ql-toolbar .ql-picker-label:hover) {
  background: rgba(28 25 23 / 0.06);
  color: rgb(28 25 23);
}

.quill-wrapper :deep(.ql-toolbar .ql-picker.ql-expanded .ql-picker-label) {
  background: rgba(28 25 23 / 0.06);
  border-color: transparent;
}

.quill-wrapper :deep(.ql-toolbar .ql-picker-options) {
  border: 1px solid rgb(231 229 228);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(28 25 23 / 0.12);
  padding: 6px;
  background: white;
}

.quill-wrapper :deep(.ql-toolbar .ql-picker-item) {
  border-radius: 6px;
  padding: 4px 8px;
}

.quill-wrapper :deep(.ql-toolbar .ql-picker-item:hover) {
  background: #fffaf4;
}

/* Editor area */
.quill-wrapper :deep(.ql-container.ql-snow) {
  border: none;
  font-family: inherit;
  font-size: 1rem;
}

.quill-wrapper :deep(.ql-editor) {
  min-height: 320px;
  padding: 20px 24px;
  color: rgb(68 64 60);
  line-height: 1.85;
  font-size: 1rem;
}

.quill-wrapper :deep(.ql-editor.ql-blank::before) {
  color: rgb(168 162 158);
  font-style: normal;
  left: 24px;
  right: 24px;
}

/* Editor content typography */
.quill-wrapper :deep(.ql-editor h1) {
  color: rgb(28 25 23);
  font-family: var(--font-serif);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 1.5rem 0 0.75rem;
}

.quill-wrapper :deep(.ql-editor h2) {
  color: rgb(28 25 23);
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 1.25rem 0 0.75rem;
}

.quill-wrapper :deep(.ql-editor h3) {
  color: rgb(28 25 23);
  font-family: var(--font-serif);
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 1rem 0 0.5rem;
}

.quill-wrapper :deep(.ql-editor p) {
  margin: 0 0 1rem;
}

.quill-wrapper :deep(.ql-editor blockquote) {
  border-left: 3px solid rgb(214 211 209);
  color: rgb(87 83 78);
  font-family: var(--font-serif);
  font-size: 1.15rem;
  margin: 1.25rem 0;
  padding-left: 1rem;
}

.quill-wrapper :deep(.ql-editor ul),
.quill-wrapper :deep(.ql-editor ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.quill-wrapper :deep(.ql-editor pre.ql-syntax) {
  background: rgb(28 25 23);
  color: rgb(214 211 209);
  border-radius: 14px;
  padding: 16px 20px;
  font-size: 0.875rem;
  line-height: 1.7;
  margin: 1rem 0;
  overflow-x: auto;
}

.quill-wrapper :deep(.ql-editor a) {
  color: rgb(180 83 9);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.quill-wrapper :deep(.ql-editor img) {
  border-radius: 14px;
  margin: 1rem 0;
  max-width: 100%;
}

/* Tooltip */
.quill-wrapper :deep(.ql-tooltip) {
  border: 1px solid rgb(231 229 228);
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(28 25 23 / 0.12);
  padding: 8px 14px;
  background: white;
  z-index: 10;
}

.quill-wrapper :deep(.ql-tooltip input[type='text']) {
  border: 1px solid rgb(231 229 228);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 13px;
  outline: none;
}

.quill-wrapper :deep(.ql-tooltip a.ql-action),
.quill-wrapper :deep(.ql-tooltip a.ql-remove) {
  color: rgb(180 83 9);
  font-weight: 600;
  font-size: 13px;
}

/* Color picker */
.quill-wrapper :deep(.ql-color-picker .ql-picker-options) {
  padding: 8px;
  width: 196px;
}

.quill-wrapper :deep(.ql-color-picker .ql-picker-item) {
  border-radius: 4px;
  width: 20px;
  height: 20px;
  margin: 2px;
}

/* ── Preview prose styling ── */
.prose-editor :deep(h2),
.prose-editor h2 {
  color: rgb(28 25 23);
  font-family: var(--font-serif);
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 1.25rem 0 0.75rem;
}

.prose-editor :deep(p),
.prose-editor p {
  margin: 0 0 1rem;
}

.prose-editor :deep(blockquote),
.prose-editor blockquote {
  border-left: 3px solid rgb(214 211 209);
  color: rgb(87 83 78);
  font-family: var(--font-serif);
  font-size: 1.25rem;
  margin: 1.25rem 0;
  padding-left: 1rem;
}

.prose-editor :deep(ul),
.prose-editor ul {
  list-style: disc;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.prose-editor :deep(ol),
.prose-editor ol {
  list-style: decimal;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.prose-editor :deep(pre) {
  background: rgb(28 25 23);
  color: rgb(214 211 209);
  border-radius: 14px;
  padding: 16px 20px;
  font-size: 0.875rem;
  line-height: 1.7;
  margin: 1rem 0;
  overflow-x: auto;
}

.prose-editor :deep(a) {
  color: rgb(180 83 9);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.prose-editor :deep(img) {
  border-radius: 14px;
  margin: 1rem 0;
  max-width: 100%;
}

/* Modal transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 200ms ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active {
  transition: transform 250ms ease-out, opacity 250ms ease-out;
}
.modal-slide-leave-active {
  transition: transform 200ms ease-in, opacity 200ms ease-in;
}
.modal-slide-enter-from {
  transform: translateY(24px);
  opacity: 0;
}
.modal-slide-leave-to {
  transform: translateY(12px);
  opacity: 0;
}
</style>