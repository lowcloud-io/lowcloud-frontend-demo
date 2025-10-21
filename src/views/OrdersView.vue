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
import type { Order } from '@/services/types'

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Create form state
const newOrder = ref({
  user_id: 0,
  status: 'pending',
  items: [{ product_id: 0, quantity: 1, price: 0 }],
})
const creating = ref(false)
const createError = ref<string | null>(null)
const createSuccess = ref(false)

const loadOrders = async () => {
  try {
    loading.value = true
    error.value = null
    orders.value = await api.getOrders()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch orders'
  } finally {
    loading.value = false
  }
}

const addItem = () => {
  newOrder.value.items.push({ product_id: 0, quantity: 1, price: 0 })
}

const removeItem = (index: number) => {
  if (newOrder.value.items.length > 1) {
    newOrder.value.items.splice(index, 1)
  }
}

const createOrder = async () => {
  if (newOrder.value.user_id <= 0) {
    createError.value = 'Valid user ID is required'
    return
  }

  if (newOrder.value.items.some((item) => item.product_id <= 0 || item.quantity <= 0)) {
    createError.value = 'All items must have valid product ID and quantity'
    return
  }

  try {
    creating.value = true
    createError.value = null
    createSuccess.value = false
    await api.createOrder(newOrder.value.user_id, newOrder.value.items, newOrder.value.status)
    createSuccess.value = true
    newOrder.value = {
      user_id: 0,
      status: 'pending',
      items: [{ product_id: 0, quantity: 1, price: 0 }],
    }
    await loadOrders()
    setTimeout(() => {
      createSuccess.value = false
    }, 3000)
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'Failed to create order'
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  loadOrders()
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price)
}

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'cancelled':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'processing':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-3">Orders</h1>
        <p class="text-slate-400">Order management and tracking</p>
      </div>

      <!-- Create Order Form -->
      <Card class="glass-card mb-6">
        <CardHeader>
          <CardTitle class="text-white">Create New Order</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="createOrder" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="user_id" class="block text-sm font-medium text-slate-300 mb-2">
                  User ID
                </label>
                <input
                  id="user_id"
                  v-model.number="newOrder.user_id"
                  type="number"
                  min="1"
                  placeholder="Enter user ID"
                  class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                  :disabled="creating"
                />
              </div>
              <div>
                <label for="status" class="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  v-model="newOrder.status"
                  class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                  :disabled="creating"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <!-- Items Section -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <label class="block text-sm font-medium text-slate-300">Order Items</label>
                <button
                  type="button"
                  @click="addItem"
                  :disabled="creating"
                  class="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Item
                </button>
              </div>

              <div
                v-for="(item, index) in newOrder.items"
                :key="index"
                class="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3"
              >
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-slate-300">Item {{ index + 1 }}</span>
                  <button
                    v-if="newOrder.items.length > 1"
                    type="button"
                    @click="removeItem(index)"
                    :disabled="creating"
                    class="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label :for="'product_id_' + index" class="block text-xs text-slate-400 mb-1">
                      Product ID
                    </label>
                    <input
                      :id="'product_id_' + index"
                      v-model.number="item.product_id"
                      type="number"
                      min="1"
                      placeholder="Product ID"
                      class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                      :disabled="creating"
                    />
                  </div>
                  <div>
                    <label :for="'quantity_' + index" class="block text-xs text-slate-400 mb-1">
                      Quantity
                    </label>
                    <input
                      :id="'quantity_' + index"
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                      :disabled="creating"
                    />
                  </div>
                  <div>
                    <label :for="'price_' + index" class="block text-xs text-slate-400 mb-1">
                      Price (€)
                    </label>
                    <input
                      :id="'price_' + index"
                      v-model.number="item.price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                      :disabled="creating"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div v-if="createError" class="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p class="text-red-400 text-sm">{{ createError }}</p>
            </div>

            <div
              v-if="createSuccess"
              class="p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
            >
              <p class="text-green-400 text-sm">Order created successfully!</p>
            </div>

            <button
              type="submit"
              :disabled="creating"
              class="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ creating ? 'Creating...' : 'Create Order' }}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card class="glass-card">
        <CardHeader>
          <CardTitle class="text-white">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="text-center py-12">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"
            ></div>
            <p class="mt-4 text-slate-400">Loading orders...</p>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <div
              class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-red-400 text-2xl">⚠</span>
            </div>
            <p class="text-red-400">{{ error }}</p>
          </div>

          <div v-else-if="orders.length === 0" class="text-center py-12">
            <div
              class="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-slate-400 text-2xl">🛒</span>
            </div>
            <p class="text-slate-400">No orders found</p>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead class="text-slate-300">Order ID</TableHead>
                <TableHead class="text-slate-300">User ID</TableHead>
                <TableHead class="text-slate-300">Product ID</TableHead>
                <TableHead class="text-slate-300">Quantity</TableHead>
                <TableHead class="text-slate-300">Total</TableHead>
                <TableHead class="text-slate-300">Status</TableHead>
                <TableHead class="text-slate-300">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="order in orders" :key="order.id" class="hover:bg-white/5">
                <TableCell class="font-medium text-white">#{{ order.id }}</TableCell>
                <TableCell class="text-slate-200">{{ order.user_id }}</TableCell>
                <TableCell class="text-slate-200">{{ order.product_id }}</TableCell>
                <TableCell class="font-semibold text-slate-200">{{ order.quantity }}x</TableCell>
                <TableCell class="font-semibold text-green-400">
                  {{ formatPrice(order.total) }}
                </TableCell>
                <TableCell>
                  <span
                    :class="['px-3 py-1 text-xs rounded-full border', getStatusColor(order.status)]"
                  >
                    {{ order.status || 'Pending' }}
                  </span>
                </TableCell>
                <TableCell class="text-slate-400">
                  {{ order.created_at ? new Date(order.created_at).toLocaleDateString() : '-' }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
