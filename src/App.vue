<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <nav class="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4">
      <div class="mb-8">
        <p class="text-gray-400 text-sm">Maritime Database</p>
      </div>
      
      <div class="space-y-2">
        <button 
          @click="currentView = 'people'"
          :class="[
            'w-full text-left px-4 py-2 rounded transition-colors',
            currentView === 'people' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          ]"
        >
          <span class="flex items-center">
            <!-- Heroicon: users -->
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            People
          </span>
        </button>

        <button 
          @click="currentView = 'ships'"
          :class="[
            'w-full text-left px-4 py-2 rounded transition-colors',
            currentView === 'ships' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-300 hover:bg-gray-700'
          ]"
        >
          <span class="flex items-center">
            <!-- Heroicon: office-building -->
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Ships
          </span>
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="ml-64 p-8">
      <div v-if="currentView === 'people'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4">People Database</h2>
        <p class="text-gray-600">People view coming soon...</p>
      </div>

      <div v-else-if="currentView === 'ships'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-2xl font-bold mb-4">Ships Database</h2>
        <p class="text-gray-600">Ships view coming soon...</p>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentView: 'people',
      examples: []
    }
  },
  methods: {
    async loadExamples() {
      this.examples = await window.electron.getExamples()
    },
    async addTest() {
      await window.electron.addTestExample()
      await this.loadExamples()
    }
  }
}
</script>

<style>
/* Remove existing styles - using Tailwind now */
</style>