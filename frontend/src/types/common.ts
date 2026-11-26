export type Money = number

export interface PageMeta {
  page: number
  page_size: number
  total: number
}

export interface ListResponse<T> {
  data: T[]
  meta: PageMeta
}

export interface ApiErrorShape {
  error: { code: string; message: string }
}