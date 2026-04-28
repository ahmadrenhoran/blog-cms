import api from "@/api"

export interface CreatePostPayload {
    title: string
    content: string
    cover_image?: string
}

export interface UpdatePostPayload {
    title?: string
    content?: string
    cover_image?: string
    status?: string
}

// ── Posts CRUD ──

export const getPosts = async (params?: { page?: number; pageSize?: number; search?: string }) => {
    return api.get('v1/post', { params })
}

export const getPostById = async (id: number | string) => {
    return api.get(`v1/post/${id}`)
}

export const createPost = async (data: CreatePostPayload) => {
    return api.post('v1/post', data)
}

export const updatePost = async (id: number | string, data: UpdatePostPayload) => {
    return api.put(`v1/post/${id}`, data)
}

export const deletePost = async (id: number | string) => {
    return api.delete(`v1/post/${id}`)
}


