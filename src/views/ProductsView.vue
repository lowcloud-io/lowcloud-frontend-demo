<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Table from '@/components/ui/Table.vue'
import TableHeader from '@/components/ui/TableHeader.vue'
import TableBody from '@/components/ui/TableBody.vue'
import TableRow from '@/components/ui/TableRow.vue'
import TableHead from '@/components/ui/TableHead.vue'
import TableCell from '@/components/ui/TableCell.vue'
import { api } from '@/services/api'
import type { Product } from '@/services/types'

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Create form state
const newProduct = ref({ name: '', description: '', price: 0, stock: 0 })
const creating = ref(false)
const createError = ref<string | null>(null)
const createSuccess = ref(false)

const loadProducts = async () => {
  try {
    loading.value = true
    error.value = null
    products.value = await api.getProducts()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch products'
  } finally {
    loading.value = false
  }
}

const createProduct = async () => {
  if (!newProduct.value.name || newProduct.value.price <= 0) {
    createError.value = 'Name and valid price are required'
    return
  }

  try {
    creating.value = true
    createError.value = null
    createSuccess.value = false
    await api.createProduct(
      newProduct.value.name,
      newProduct.value.description,
      newProduct.value.price,
      newProduct.value.stock,
    )
    createSuccess.value = true
    newProduct.value = { name: '', description: '', price: 0, stock: 0 }
    await loadProducts()
    setTimeout(() => {
      createSuccess.value = false
    }, 3000)
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'Failed to create product'
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  loadProducts()
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price)
}
</script>

<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-3">Products</h1>
        <p class="text-slate-400">Product catalog and inventory</p>
      </div>

      <!-- Create Product Form -->
      <Card class="glass-card mb-6">
        <CardHeader>
          <CardTitle class="text-white">Create New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="createProduct" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="name" class="block text-sm font-medium text-slate-300 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  v-model="newProduct.name"
                  type="text"
                  placeholder="Enter product name"
                  class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                  :disabled="creating"
                />
              </div>
              <div>
                <label for="description" class="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <input
                  id="description"
                  v-model="newProduct.description"
                  type="text"
                  placeholder="Enter description"
                  class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                  :disabled="creating"
                />
              </div>
              <div>
                <label for="price" class="block text-sm font-medium text-slate-300 mb-2">
                  Price (€)
                </label>
                <input
                  id="price"
                  v-model.number="newProduct.price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                  :disabled="creating"
                />
              </div>
              <div>
                <label for="stock" class="block text-sm font-medium text-slate-300 mb-2">
                  Stock
                </label>
                <input
                  id="stock"
                  v-model.number="newProduct.stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                  :disabled="creating"
                />
              </div>
            </div>

            <div v-if="createError" class="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p class="text-red-400 text-sm">{{ createError }}</p>
            </div>

            <div
              v-if="createSuccess"
              class="p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
            >
              <p class="text-green-400 text-sm">Product created successfully!</p>
            </div>

            <button
              type="submit"
              :disabled="creating"
              class="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ creating ? 'Creating...' : 'Create Product' }}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card class="glass-card">
        <CardHeader>
          <CardTitle class="text-white">Product Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="text-center py-12">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"
            ></div>
            <p class="mt-4 text-slate-400">Loading products...</p>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <div
              class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-red-400 text-2xl">⚠</span>
            </div>
            <p class="text-red-400">{{ error }}</p>
          </div>

          <div v-else-if="products.length === 0" class="text-center py-12">
            <div
              class="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-slate-400 text-2xl">📦</span>
            </div>
            <p class="text-slate-400">No products found</p>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead class="text-slate-300">ID</TableHead>
                <TableHead class="text-slate-300">Name</TableHead>
                <TableHead class="text-slate-300">Description</TableHead>
                <TableHead class="text-slate-300">Category</TableHead>
                <TableHead class="text-slate-300">Price</TableHead>
                <TableHead class="text-slate-300">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="product in products" :key="product.id" class="hover:bg-white/5">
                <TableCell class="font-medium text-white">{{ product.id }}</TableCell>
                <TableCell class="font-semibold text-slate-200">{{ product.name }}</TableCell>
                <TableCell class="max-w-xs truncate text-slate-400">
                  {{ product.description || '-' }}
                </TableCell>
                <TableCell>
                  <span
                    class="px-3 py-1 text-xs rounded-full bg-white/10 text-white border border-white/20"
                  >
                    {{ product.category || 'General' }}
                  </span>
                </TableCell>
                <TableCell class="font-semibold text-green-400">
                  {{ formatPrice(product.price) }}
                </TableCell>
                <TableCell>
                  <span
                    :class="[
                      'px-3 py-1 text-xs rounded-full border',
                      product.stock && product.stock > 10
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : product.stock && product.stock > 0
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30',
                    ]"
                  >
                    {{ product.stock ?? 'N/A' }}
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
