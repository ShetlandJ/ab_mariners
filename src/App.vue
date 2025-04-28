<template>
  <div class="app-container transition-colors duration-200" :class="{ 'dark': isDarkMode }">
    <!-- Fixed sidebar navigation -->
    <nav class="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4 z-10 flex flex-col">
      <div class="mb-8">
        <p class="text-gray-400 text-sm">Maritime Database</p>
      </div>
      
      <div class="space-y-2 flex-grow">
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
      
      <!-- Dark mode toggle now in sidebar -->
      <div class="mt-auto pt-4 border-t border-gray-700">
        <button 
          @click="toggleDarkMode" 
          class="flex items-center w-full text-left px-4 py-2 rounded transition-colors text-gray-300 hover:bg-gray-700 focus:outline-none"
          :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <svg v-if="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>
    </nav>

    <!-- Main content area with proper padding for sidebar -->
    <div class="pl-64 w-full min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <!-- Router view for page content -->
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { useDarkMode } from './composables/useDarkMode';

export default {
  name: 'App',
  setup() {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return {
      isDarkMode,
      toggleDarkMode
    };
  },
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
        { 
          path: '/reports', 
          name: 'Reports',
          icon: {
            template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>`
          }
        },
      ];
    }
  }
}
</script>

<style>
/* Base styles */
body {
  @apply bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.app-container {
  display: flex;
}

.router-link-active {
  @apply bg-blue-600 text-white;
}
</style>