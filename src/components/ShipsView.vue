<template>
  <div class="ships-view">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Ships</h1>
      <div class="search-container">
        <input
          type="text"
          v-model="searchTerm"
          @input="handleSearch"
          placeholder="Search ships..."
          class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">Designation</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider bg-gray-50 dark:bg-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          <tr v-for="ship in ships.ships" :key="ship.ship_id" class="hover:bg-gray-100 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ ship.name || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{{ ship.designation || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
              <button 
                @click="editShip(ship)" 
                class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none mx-auto"
                title="Edit ship"
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
        of {{ totalItems }} ships
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
    
    <!-- Edit Ship Modal -->
    <EditShipModal 
      :show="showEditModal" 
      :ship="currentShip" 
      @close="closeEditModal" 
      @saved="handleShipSaved"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { usePagination } from '../composables/usePagination';
import database from '../services/database';
import EditShipModal from './EditShipModal.vue';

const ITEMS_PER_PAGE = 15;

export default {
  name: 'ShipsView',
  components: {
    EditShipModal
  },
  setup() {
    const ships = ref([]);
    const totalItems = ref(0);
    const searchTerm = ref('');
    const searchTimeout = ref(null);
    const showEditModal = ref(false);
    const currentShip = ref({});
    
    async function loadShips() {
      totalItems.value = await database.getShipsCount(searchTerm.value);
      ships.value = await database.getShipsPaginated(
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
        loadShips();
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

    onMounted(loadShips);

    // Watch for page changes
    watch(currentPage, loadShips);

    function editShip(ship) {
      currentShip.value = { ...ship }; // Create a copy to avoid direct mutation
      showEditModal.value = true;
    }

    function closeEditModal() {
      showEditModal.value = false;
    }

    async function handleShipSaved(updatedShip) {
      // Reload ships to reflect the changes
      await loadShips();
    }

    return {
      ships,
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
      editShip,
      showEditModal,
      currentShip,
      closeEditModal,
      handleShipSaved
    };
  }
}
</script>