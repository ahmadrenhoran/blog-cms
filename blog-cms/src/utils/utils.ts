import api from "@/api"

export function getErrorMessage(error: unknown) {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    return typeof message === 'string' ? message : 'Terjadi kesalahan. Silakan coba lagi.'
  }

  return 'Terjadi kesalahan. Silakan coba lagi.'
}

export const uploadFile = async (file: FormData) => {
  return api.post('v1/upload', file)
}

export async function uploadSingleFile(file: File) {
  if (!file) throw new Error("File is required");

  const formData = new FormData();
  formData.append("file", file);
  const response = await uploadFile(formData);
  console.debug(response.data);

  return response.data;
}