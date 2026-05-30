import { fetchFromCMS } from './client'
import {
  normalizePrompt,
  normalizeProduct,
  normalizeBlog,
  normalizeFeaturedItem,
} from './normalize'
import type { Prompt, Product, Blog, FeaturedItem } from '@/lib/types'

export async function getPrompts(): Promise<Prompt[]> {
  const raw = await fetchFromCMS<unknown>('prompts')
  return raw.map(normalizePrompt).filter(p => p.id)
}

export async function getProducts(): Promise<Product[]> {
  const raw = await fetchFromCMS<unknown>('products')
  return raw.map(normalizeProduct).filter(p => p.id)
}

export async function getBlogs(): Promise<Blog[]> {
  const raw = await fetchFromCMS<unknown>('blogs')
  return raw.map(normalizeBlog).filter(b => b.id)
}

export async function getFeaturedItems(): Promise<FeaturedItem[]> {
  const raw = await fetchFromCMS<unknown>('featured')
  return raw.map(normalizeFeaturedItem).filter(f => f.id && f.contentId)
}

export async function getHomepageData() {
  const [prompts, products, blogs, featured] = await Promise.all([
    getPrompts(),
    getProducts(),
    getBlogs(),
    getFeaturedItems(),
  ])

  const resolve = <T extends { id: string }>(
    section: string,
    items: T[],
    contentType: string
  ): T[] =>
    featured
      .filter(f => f.section === section && f.contentType === contentType)
      .sort((a, b) => a.order - b.order)
      .map(f => items.find(item => item.id === f.contentId))
      .filter((item): item is T => item !== undefined)

  const featuredPromptsFromTab = resolve('featured-prompts', prompts, 'prompt')
  const featuredProductsFromTab = resolve('featured-products', products, 'product')
  const featuredBlogsFromTab = resolve('featured-blogs', blogs, 'blog')

  // Fall back to featured:true flag if Featured tab is empty/not configured
  const featuredPrompts = featuredPromptsFromTab.length > 0
    ? featuredPromptsFromTab
    : prompts.filter(p => p.featured).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  const featuredProducts = featuredProductsFromTab.length > 0
    ? featuredProductsFromTab
    : products.filter(p => p.featured).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  const featuredBlogs = featuredBlogsFromTab.length > 0
    ? featuredBlogsFromTab
    : blogs.filter(b => b.featured).sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

  return { featuredPrompts, featuredProducts, featuredBlogs }
}
