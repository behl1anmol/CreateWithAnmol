import { NextRequest, NextResponse } from 'next/server'
import { getPrompts, getProducts, getBlogs } from '@/lib/api'

function matches(q: string, ...fields: (string | undefined)[]): boolean {
  return fields.some(f => f?.toLowerCase().includes(q))
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() ?? ''

  if (!q || q.length < 2) {
    return NextResponse.json({ prompts: [], products: [], blogs: [] })
  }

  const [prompts, products, blogs] = await Promise.all([
    getPrompts(),
    getProducts(),
    getBlogs(),
  ])

  return NextResponse.json({
    prompts: prompts.filter(p => matches(q, p.title, p.description, p.category, p.tool)),
    products: products.filter(p => matches(q, p.title, p.description, p.category, p.badge, p.specs)),
    blogs: blogs.filter(b => matches(q, b.title, b.excerpt, b.category)),
  })
}
