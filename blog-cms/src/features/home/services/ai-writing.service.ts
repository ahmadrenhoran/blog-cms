import api from '@/api'

export type AIWritingAction = 'title' | 'outline' | 'draft' | 'improve' | 'cta'

export interface GenerateWritingPayload {
  action: AIWritingAction
  prompt: string
  title?: string
  content?: string
}

export interface AIWritingUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  [key: string]: unknown
}

interface AIWritingResult {
  model: string
  text: string
  usage?: AIWritingUsage
}

interface AIWritingApiEnvelope {
  success?: boolean
  message?: string
  data?: AIWritingResult
  model?: string
  text?: string
  usage?: AIWritingUsage
}

export async function generateWritingAssistance(payload: GenerateWritingPayload) {
  const response = await api.post<AIWritingApiEnvelope>('v1/ai/writing', payload)
  const result = response.data.data ?? {
    model: response.data.model || '',
    text: response.data.text || '',
    usage: response.data.usage,
  }

  if (!result.text?.trim()) {
    throw new Error(response.data.message || 'AI tidak mengembalikan teks yang bisa dipakai.')
  }

  return {
    model: result.model || 'AI Writer',
    text: result.text,
    usage: result.usage,
  }
}
