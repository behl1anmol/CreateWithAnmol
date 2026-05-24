import { getBlogs } from '@/lib/api'
import BlogsClient from './BlogsClient'

export const revalidate = 3600

export default async function BlogsPage() {
  const blogs = await getBlogs()
  return <BlogsClient initialData={blogs} />
}
