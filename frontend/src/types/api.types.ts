export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type ApiError = {
  success: false
  message: string
  errors?: Record<string, string[]>
}