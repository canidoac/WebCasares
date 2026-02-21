'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/auth'

export async function getProducts() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('Products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data || []
}

export async function getProductById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('Products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw new Error(error.message)
  return data
}

export async function createProduct(formData: FormData) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()
  
  const product = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    price: parseInt(formData.get('price') as string),
    image_front: formData.get('image_front') as string,
    image_back: formData.get('image_back') as string || null,
    badge: formData.get('badge') as string || null,
    description: formData.get('description') as string,
    in_stock: formData.get('in_stock') === 'true',
    is_3d: formData.get('is_3d') === 'true',
    render_3d_url: formData.get('render_3d_url') as string || null,
    category: formData.get('category') as string || null,
    variants: formData.get('variants') ? JSON.parse(formData.get('variants') as string) : null,
  }

  const { error } = await supabase
    .from('Products')
    .insert(product)

  if (error) throw new Error(error.message)

  revalidatePath('/tienda')
  revalidatePath('/admin/tienda')
}

export async function updateProduct(id: string, formData: FormData) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()
  
  const product = {
    name: formData.get('name') as string,
    price: parseInt(formData.get('price') as string),
    image_front: formData.get('image_front') as string,
    image_back: formData.get('image_back') as string || null,
    badge: formData.get('badge') as string || null,
    description: formData.get('description') as string,
    in_stock: formData.get('in_stock') === 'true',
    is_3d: formData.get('is_3d') === 'true',
    render_3d_url: formData.get('render_3d_url') as string || null,
    category: formData.get('category') as string || null,
    variants: formData.get('variants') ? JSON.parse(formData.get('variants') as string) : null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('Products')
    .update(product)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/tienda')
  revalidatePath('/admin/tienda')
}

export async function deleteProduct(id: string) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()
  
  const { error } = await supabase
    .from('Products')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/tienda')
  revalidatePath('/admin/tienda')
}

export async function toggleProductStock(id: string) {
  const userIsAdmin = await isAdmin()
  if (!userIsAdmin) {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()
  
  // Obtener el estado actual
  const { data: product } = await supabase
    .from('Products')
    .select('in_stock')
    .eq('id', id)
    .single()

  if (!product) throw new Error('Producto no encontrado')

  // Actualizar el estado
  const { error } = await supabase
    .from('Products')
    .update({ in_stock: !product.in_stock, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/tienda')
  revalidatePath('/admin/tienda')
}
