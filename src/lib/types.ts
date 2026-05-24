export interface Prompt {
  id: string
  title: string
  description: string
  image: string
  category?: string
  tool?: string
  reelLink?: string
  promptLink: string
  featured?: boolean
  order?: number
}

export interface Product {
  id: string
  title: string
  description: string
  image: string
  productLink: string
  category?: string
  price?: string
  badge?: string
  specs?: string
  featured?: boolean
  order?: number
}

export interface Blog {
  id: string
  title: string
  excerpt: string
  image: string
  articleLink: string
  category?: string
  readTime?: string
  date?: string
  featured?: boolean
  order?: number
}

export interface FeaturedItem {
  id: string
  contentType: 'prompt' | 'product' | 'blog'
  contentId: string
  section: string
  order: number
}
