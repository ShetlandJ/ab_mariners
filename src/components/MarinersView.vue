<template>
  <div class="mariners-view">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Mariners</h1>
      <div class="search-container">
        <input
          type="text"
          v-model="searchTerm"
          @input="handleSearch"
          placeholder="Search by name..."
          class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>Name</th>
            <th>Birth Year</th>
            <th>Death Year</th>
            <th>Place of Birth</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="mariner in mariners.mariners" :key="mariner.person_id">
            <td>{{ mariner.surname }}, {{ mariner.forename }}</td>
            <td>{{ mariner.year_of_birth || '-' }}</td>
            <td>{{ mariner.year_of_death || '-' }}</td>
            <td>{{ mariner.place_of_birth || '-' }}</td>
            <td class="text-center">
              <button 
                @click="editMariner(mariner)" 
                class="text-blue-500 hover:text-blue-700 focus:outline-none mx-auto"
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
      <div class="text-sm text-gray-700">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalItems) }} 
        of {{ totalItems }} mariners
      </div>
      <div class="flex space-x-2">
        <button 
          @click="prevPage" 
          :disabled="!hasPrevPage"
          class="btn btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !hasPrevPage }"
        >
          Previous
        </button>
        <button 
          @click="nextPage" 
          :disabled="!hasNextPage"
          class="btn btn-primary"
          :class="{ 'opacity-50 cursor-not-allowed': !hasNextPage }"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { usePagination } from '../composables/usePagination';
import database from '../services/database';

const ITEMS_PER_PAGE = 15;

export default {
  name: 'MarinersView',
  setup() {
    const mariners = ref([]);
    const totalItems = ref(0);
    const searchTerm = ref('');
    const searchTimeout = ref(null);
    
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
      console.log('Edit mariner:', mariner);
      // You can implement the edit functionality here
      // For example, navigate to an edit page or open a modal
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
      editMariner
    };
  }
}
</script>