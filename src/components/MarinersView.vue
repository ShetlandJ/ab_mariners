<template>
  <div class="mariners-view">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Mariners</h1>
      <div class="search-container">
        <input
          type="text"
          v-model="searchTerm"
          @input="handleSearch"
          placeholder="Search by name..."
          class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Birth Year</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Death Year</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Place of Birth</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          <tr v-for="mariner in mariners.mariners" :key="mariner.person_id" class="hover:bg-gray-100 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ mariner.surname }}, {{ mariner.forename }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ mariner.year_of_birth || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ mariner.year_of_death || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ mariner.place_of_birth || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
              <button 
                @click="editMariner(mariner)" 
                class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none mx-auto"
                title="Edit mariner"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} 
        of {{ totalItems }} mariners
      </div>
      <div class="flex space-x-2">
        <button 
          @click="prevPage" 
          :disabled="!hasPrevPage"
          class="btn btn-primary dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white"
          :class="{ 'opacity-50 cursor-not-allowed': !hasPrevPage }"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="!hasNextPage"
          class="btn btn-primary dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white"
          :class="{ 'opacity-50 cursor-not-allowed': !hasNextPage }"
        >
          Next
        </button>
      </div>
    </div>
    
    <!-- Edit Mariner Modal -->
    <EditMarinerModal 
      :show="showEditModal" 
      :mariner="currentMariner" 
      @close="closeEditModal" 
      @saved="handleMarinerSaved"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { usePagination } from '../composables/usePagination';
import database from '../services/database';
import EditMarinerModal from './EditMarinerModal.vue';

const ITEMS_PER_PAGE = 15;

export default {
  name: 'MarinersView',
  components: {
    EditMarinerModal
  },
  setup() {
    const mariners = ref([]);
    const totalItems = ref(0);
    const searchTerm = ref('');
    const searchTimeout = ref(null);
    const showEditModal = ref(false);
    const currentMariner = ref({});
    
    async function loadMariners() {
      totalItems.value = await database.getMarinersCount(searchTerm.value);
      mariners.value = await database.getMarinersPaginated(
        currentPage.value, 
        ITEMS_PER_PAGE,
        searchTerm.value
      );
    }

    function handleSearch() {
      // Debounce the search to avoid too many requests
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }
      
      searchTimeout.value = setTimeout(() => {
        currentPage.value = 1; // Reset to first page when searching
        loadMariners();
      }, 300);
    }

    const {
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage
    } = usePagination(totalItems, ITEMS_PER_PAGE);

    onMounted(loadMariners);

    // Watch for page changes
    watch(currentPage, loadMariners);

    function editMariner(mariner) {
      currentMariner.value = { ...mariner }; // Create a copy to avoid direct mutation
      showEditModal.value = true;
    }

    function closeEditModal() {
      showEditModal.value = false;
    }

    async function handleMarinerSaved(updatedMariner) {
      // Reload mariners to reflect the changes
      await loadMariners();
    }

    return {
      mariners,
      totalItems,
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage,
      itemsPerPage: ITEMS_PER_PAGE,
      searchTerm,
      handleSearch,
      editMariner,
      showEditModal,
      currentMariner,
      closeEditModal,
      handleMarinerSaved
    };
  }
}
</script>