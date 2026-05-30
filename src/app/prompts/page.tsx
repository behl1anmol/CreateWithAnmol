import { getPrompts } from '@/lib/api'
import PromptsClient from './PromptsClient'

export const revalidate = 3600

export default async function PromptsPage() {
  const prompts = await getPrompts()
  return <PromptsClient initialData={prompts} />
}
