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
      
      <!-- Global Search Box (hidden on Mariners/Ships views) -->
      <div v-if="!isOnSearchableView" class="mt-auto pt-4 pb-4 border-t border-gray-700">
        <div class="px-2">
          <label class="text-xs text-gray-400 mb-1 block">Quick Search</label>
          <div class="relative">
            <input 
              v-model="globalSearchQuery"
              @keyup.enter="performGlobalSearch"
              placeholder="Search mariners or ships..."
              class="w-full px-3 py-2 pr-10 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button 
              @click="performGlobalSearch"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              title="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          <div class="flex gap-2 mt-2">
            <button 
              @click="searchType = 'mariners'"
              class="flex-1 text-xs py-1 px-2 rounded transition-colors"
              :class="searchType === 'mariners' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            >
              Mariners
            </button>
            <button 
              @click="searchType = 'ships'"
              class="flex-1 text-xs py-1 px-2 rounded transition-colors"
              :class="searchType === 'ships' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            >
              Ships
            </button>
          </div>
        </div>
      </div>
      
      <!-- Dark mode toggle now in sidebar -->
      <div class="pt-4 border-t border-gray-700" :class="{ 'mt-auto': isOnSearchableView }">
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
    <div class="pl-64 w-full min-h-screen bg-blue-50 dark:bg-gray-900 transition-colors duration-200">
      <!-- Router view for page content -->
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDarkMode } from './composables/useDarkMode';

export default {
  name: 'App',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    
    // Global search state
    const globalSearchQuery = ref('');
    const searchType = ref('mariners');
    
    // Check if we're on a view that already has search
    const isOnSearchableView = computed(() => {
      return route.path === '/mariners' || route.path === '/ships';
    });
    
    const performGlobalSearch = () => {
      if (!globalSearchQuery.value.trim()) return;
      
      if (searchType.value === 'mariners') {
        router.push({
          path: '/mariners',
          query: { search: globalSearchQuery.value.trim(), page: '1' }
        });
      } else {
        router.push({
          path: '/ships',
          query: { search: globalSearchQuery.value.trim(), page: '1' }
        });
      }
      
      // Clear the search input after navigating
      globalSearchQuery.value = '';
    };

    return {
      isDarkMode,
      toggleDarkMode,
      globalSearchQuery,
      searchType,
      isOnSearchableView,
      performGlobalSearch
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
        { 
          path: '/merge', 
          name: 'Merge Sailors',
          icon: {
            template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>`
          }
        },
        { 
          path: '/backup', 
          name: 'Backup',
          icon: {
            template: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
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
  @apply bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200;
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