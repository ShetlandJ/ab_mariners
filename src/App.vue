<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <nav class="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4">
      <div class="mb-8">
        <p class="text-gray-400 text-sm">Maritime Database</p>
      </div>
      
      <div class="space-y-2">
        <router-link 
          v-for="route in routes" 
          :key="route.path"
          :to="route.path"
          class="flex items-center w-full text-left px-4 py-2 rounded transition-colors text-gray-300 hover:bg-gray-700"
          :class="{ 'bg-blue-600 text-white': $route.path === route.path }"
        >
          <component :is="route.icon" class="w-5 h-5 mr-3" />
          {{ route.name }}
        </router-link>
      </div>
    </nav>

    <main class="ml-64 p-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    routes() {
      return [
        { 
          path: '/mariners', 
          name: 'Mariners',
          icon: {
            template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>`
          }
        },
        { 
          path: '/ships', 
          name: 'Ships',
          icon: {
            template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1zM4 6h8M4 10h8M4 14h8M16 8h6M16 12h6M16 16h6" />
            </svg>`
          }
        },
      ];
    }
  }
}
</script>

<style>
.router-link-active {
  @apply bg-blue-600 text-white;
}
</style>