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
import type { User } from '@/services/types'

const users = ref<User[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Create form state
const newUser = ref({ username: '', email: '' })
const creating = ref(false)
const createError = ref<string | null>(null)
const createSuccess = ref(false)

const loadUsers = async () => {
  try {
    loading.value = true
    error.value = null
    users.value = await api.getUsers()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to fetch users'
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  if (!newUser.value.username || !newUser.value.email) {
    createError.value = 'Username and email are required'
    return
  }

  try {
    creating.value = true
    createError.value = null
    createSuccess.value = false
    await api.createUser(newUser.value.username, newUser.value.email)
    createSuccess.value = true
    newUser.value = { username: '', email: '' }
    await loadUsers()
    setTimeout(() => {
      createSuccess.value = false
    }, 3000)
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'Failed to create user'
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-3">Users</h1>
        <p class="text-slate-400">User management and directory</p>
      </div>

      <!-- Create User Form -->
      <Card class="glass-card mb-6">
        <CardHeader>
          <CardTitle class="text-white">Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="createUser" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="username" class="block text-sm font-medium text-slate-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  v-model="newUser.username"
                  type="text"
                  placeholder="Enter username"
                  class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                  :disabled="creating"
                />
              </div>
              <div>
                <label for="email" class="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  v-model="newUser.email"
                  type="email"
                  placeholder="Enter email"
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
              <p class="text-green-400 text-sm">User created successfully!</p>
            </div>

            <button
              type="submit"
              :disabled="creating"
              class="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ creating ? 'Creating...' : 'Create User' }}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card class="glass-card">
        <CardHeader>
          <CardTitle class="text-white">User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="text-center py-12">
            <div
              class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"
            ></div>
            <p class="mt-4 text-slate-400">Loading users...</p>
          </div>

          <div v-else-if="error" class="text-center py-12">
            <div
              class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-red-400 text-2xl">⚠</span>
            </div>
            <p class="text-red-400">{{ error }}</p>
          </div>

          <div v-else-if="users.length === 0" class="text-center py-12">
            <div
              class="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-slate-400 text-2xl">👤</span>
            </div>
            <p class="text-slate-400">No users found</p>
          </div>

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead class="text-slate-300">ID</TableHead>
                <TableHead class="text-slate-300">Name</TableHead>
                <TableHead class="text-slate-300">Email</TableHead>
                <TableHead class="text-slate-300">Role</TableHead>
                <TableHead class="text-slate-300">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="user in users" :key="user.id" class="hover:bg-white/5">
                <TableCell class="font-medium text-white">{{ user.id }}</TableCell>
                <TableCell class="text-slate-200">{{ user.name }}</TableCell>
                <TableCell class="text-slate-300">{{ user.email }}</TableCell>
                <TableCell>
                  <span
                    class="px-3 py-1 text-xs rounded-full bg-white/10 text-white border border-white/20"
                  >
                    {{ user.role || 'User' }}
                  </span>
                </TableCell>
                <TableCell class="text-slate-400">
                  {{ user.created_at ? new Date(user.created_at).toLocaleDateString() : '-' }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
