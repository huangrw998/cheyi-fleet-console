import type { CreditsData } from '@/types'

export async function getCredits(): Promise<CreditsData> {
  const response = await fetch('/media/credits.json')
  if (!response.ok) throw new Error('素材许可读取失败')
  return response.json() as Promise<CreditsData>
}