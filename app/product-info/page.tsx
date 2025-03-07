import { Suspense } from "react"
import { MainLayout } from "@/components/home/main-layout"
import { ProductInfoContent } from "./product-info-content"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export default async function ProductInfoPage() {
  const supabase = createServerClient()
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <MainLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductInfoContent initialProducts={products || []} />
      </Suspense>
    </MainLayout>
  )
}