export interface CreditModel {
  slug: string
  name: string
  source: string
  file: string
  author: string
  license: string
  url: string
}

export interface CreditsData {
  updated_at: string
  note: string
  models: CreditModel[]
  models3d: { key: string; name: string; source: string; license: string; url: string }[]
  scenes: { file: string; name: string; source: string; license: string; url: string }[]
}