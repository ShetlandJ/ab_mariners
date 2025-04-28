<template>
  <div class="reports-view">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Reports</h1>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">Birthplace Statistics</h2>
      
      <div class="mb-4">
        <label class="block text-sm font-medium mb-1 dark:text-white">Filter by Place of Birth</label>
        <select 
          v-model="selectedPlace" 
          class="w-full md:w-64 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">All Places</option>
          <optgroup 
            v-for="group in groupedBirthplaces" 
            :key="group.label" 
            :label="group.label"
          >
            <option 
              v-for="place in group.options" 
              :key="place.value" 
              :value="place.value"
            >
              {{ place.label }}
            </option>
          </optgroup>
        </select>
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else class="mt-6">
        <p class="dark:text-white font-medium">Total mariners from selected region: <span class="font-bold">{{ filteredMarinerCount }}</span></p>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">Dataset Overview</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-blue-700 dark:text-blue-300 mb-1">Total Mariners</h3>
          <p class="text-3xl font-bold text-blue-800 dark:text-blue-200">{{ totalMariners }}</p>
        </div>
        
        <div class="bg-green-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-green-700 dark:text-green-300 mb-1">Shetland Born</h3>
          <p class="text-3xl font-bold text-green-800 dark:text-green-200">{{ shetlandCount }}</p>
          <p class="text-sm text-green-600 dark:text-green-400">{{ shetlandPercentage }}% of total</p>
        </div>
        
        <div class="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-purple-700 dark:text-purple-300 mb-1">Other Origins</h3>
          <p class="text-3xl font-bold text-purple-800 dark:text-purple-200">{{ otherCount }}</p>
          <p class="text-sm text-purple-600 dark:text-purple-400">{{ otherPercentage }}% of total</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import database from '../services/database';
import { getGroupedBirthplaces, getStandardizedPlace } from '../data/birthplaces';

export default {
  name: 'ReportsView',
  setup() {
    const isLoading = ref(true);
    const mariners = ref([]);
    const selectedPlace = ref('');
    const groupedBirthplaces = getGroupedBirthplaces();
    
    // Load all mariners data
    const loadMarinersData = async () => {
      isLoading.value = true;
      try {
        // Get the total count first
        const count = await database.getMarinersCount();
        
        // Then get all mariners (you might need to modify this if there are a lot of records)
        // This assumes you have a way to get all mariners at once
        const result = await database.getMarinersPaginated(1, count);
        mariners.value = result.mariners || [];
      } catch (error) {
        console.error('Error loading mariner data:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Total number of mariners
    const totalMariners = computed(() => mariners.value.length);
    
    // Filter mariners by selected place
    const filteredMariners = computed(() => {
      if (!selectedPlace.value) return mariners.value;
      
      return mariners.value.filter(mariner => {
        if (!mariner.place_of_birth) return false;
        
        const standardizedPlace = getStandardizedPlace(mariner.place_of_birth);
        return standardizedPlace && standardizedPlace.value === selectedPlace.value;
      });
    });
    
    // Count of filtered mariners
    const filteredMarinerCount = computed(() => filteredMariners.value.length);
    
    // Count mariners from Shetland
    const shetlandMariners = computed(() => {
      return mariners.value.filter(mariner => {
        if (!mariner.place_of_birth) return false;
        
        const standardizedPlace = getStandardizedPlace(mariner.place_of_birth);
        return standardizedPlace && standardizedPlace.group === 'shetland';
      });
    });
    
    const shetlandCount = computed(() => shetlandMariners.value.length);
    
    // Count mariners from other places
    const otherMariners = computed(() => {
      return mariners.value.filter(mariner => {
        if (!mariner.place_of_birth) return false;
        
        const standardizedPlace = getStandardizedPlace(mariner.place_of_birth);
        return standardizedPlace && standardizedPlace.group === 'other';
      });
    });
    
    const otherCount = computed(() => otherMariners.value.length);
    
    // Calculate percentages
    const shetlandPercentage = computed(() => {
      if (totalMariners.value === 0) return 0;
      return Math.round((shetlandCount.value / totalMariners.value) * 100);
    });
    
    const otherPercentage = computed(() => {
      if (totalMariners.value === 0) return 0;
      return Math.round((otherCount.value / totalMariners.value) * 100);
    });
    
    onMounted(loadMarinersData);
    
    return {
      isLoading,
      mariners,
      selectedPlace,
      groupedBirthplaces,
      totalMariners,
      filteredMariners,
      filteredMarinerCount,
      shetlandCount,
      otherCount,
      shetlandPercentage,
      otherPercentage
    };
  }
}
</script>