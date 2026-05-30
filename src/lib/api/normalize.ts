import type { Prompt, Product, Blog, FeaturedItem } from '@/lib/types'
import { toEmbeddableImageUrl } from '@/lib/utils/imageUrl'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizePrompt(raw: any): Prompt {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    image: toEmbeddableImageUrl(String(raw.image ?? '')),
    promptLink: String(raw.promptLink ?? ''),
    category: raw.category ? String(raw.category) : undefined,
    tool: raw.tool ? String(raw.tool) : undefined,
    reelLink: raw.reelLink ? String(raw.reelLink) : undefined,
    featured: raw.featured === true,
    order: typeof raw.order === 'number' ? raw.order : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeProduct(raw: any): Product {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    image: toEmbeddableImageUrl(String(raw.image ?? '')),
    productLink: String(raw.productLink ?? ''),
    category: raw.category ? String(raw.category) : undefined,
    price: raw.price ? String(raw.price) : undefined,
    badge: raw.badge ? String(raw.badge) : undefined,
    specs: raw.specs ? String(raw.specs) : undefined,
    featured: raw.featured === true,
    order: typeof raw.order === 'number' ? raw.order : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeBlog(raw: any): Blog {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    excerpt: String(raw.excerpt ?? ''),
    image: toEmbeddableImageUrl(String(raw.image ?? '')),
    articleLink: String(raw.articleLink ?? ''),
    category: raw.category ? String(raw.category) : undefined,
    readTime: raw.readTime ? String(raw.readTime) : undefined,
    date: raw.date ? String(raw.date) : undefined,
    featured: raw.featured === true,
    order: typeof raw.order === 'number' ? raw.order : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeFeaturedItem(raw: any): FeaturedItem {
  return {
    id: String(raw.id ?? ''),
    contentType: raw.contentType as 'prompt' | 'product' | 'blog',
    contentId: String(raw.contentId ?? ''),
    section: String(raw.section ?? ''),
    order: typeof raw.order === 'number' ? raw.order : 999,
  }
}
