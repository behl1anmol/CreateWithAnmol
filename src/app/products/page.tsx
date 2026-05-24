import { getProducts } from '@/lib/api'
import ProductsClient from './ProductsClient'

export const revalidate = 3600

export default async function ProductsPage() {
  const products = await getProducts()
  return <ProductsClient initialData={products} />
}
