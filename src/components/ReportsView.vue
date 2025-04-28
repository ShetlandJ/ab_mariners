<template>
  <div class="reports-view">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Reports</h1>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">Birthplace Distribution</h2>
      
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Pie Chart -->
        <div class="h-80">
          <v-chart class="w-full h-full" :option="chartOption" autoresize @click="handleChartClick" />
        </div>
        
        <!-- Legend and Data Summary -->
        <div class="flex flex-col justify-center">
          <h3 class="text-lg font-medium mb-3 dark:text-white">Birthplace Distribution</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            This chart shows the distribution of mariners by their place of birth. 
            The top 9 locations are shown individually, with the rest grouped as "Other".
          </p>
          <div class="mt-2 mb-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium dark:text-white">Total Mariners with Known Birthplace:</span>
              <span class="font-bold dark:text-white">{{ totalMarinersWithBirthplace }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium dark:text-white">Missing Birthplace Data:</span>
              <span class="font-bold dark:text-white">{{ missingBirthplaceCount }}</span>
            </div>
          </div>
          
          <!-- Location Dropdown -->
          <div class="mt-4">
            <label for="location-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by location:
            </label>
            <div class="flex space-x-2">
              <select 
                id="location-select" 
                v-model="selectedLocation" 
                @change="handleLocationSelect"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">All Locations</option>
                <option v-for="location in availableLocations" :key="location" :value="location">
                  {{ location }}
                </option>
              </select>
              <button 
                v-if="selectedLocation" 
                @click="clearLocationFilter"
                class="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                title="Clear filter"
              >
                <span class="text-gray-700 dark:text-gray-200">×</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">Dataset Overview</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      
      <!-- Filtered Mariners Table -->
      <div v-if="selectedLocation">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold dark:text-white">
            Mariners from {{ selectedLocation }}
            <span class="text-sm font-normal text-gray-500 dark:text-gray-400">({{ filteredCount }} total)</span>
          </h3>
        </div>
        
        <div v-if="filteredCount === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          No mariners found for this location.
        </div>
        
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Birth Year</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Birth Place</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Died at Sea</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="mariner in paginatedMariners" :key="mariner.person_id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {{ mariner.surname }}, {{ mariner.forename }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ mariner.year_of_birth || 'Unknown' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ mariner.place_of_birth || 'Unknown' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {{ mariner.died_at_sea ? 'Yes' : 'No' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div class="flex items-center justify-between mt-4">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to 
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredCount) }}</span> of 
              <span class="font-medium">{{ filteredCount }}</span> mariners
            </div>
            <div class="flex space-x-2">
              <button 
                @click="prevPage" 
                :disabled="!hasPrevPage" 
                class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 disabled:opacity-50"
                :class="{ 'hover:bg-gray-50 dark:hover:bg-gray-600': hasPrevPage }"
              >
                Previous
              </button>
              <button 
                @click="nextPage" 
                :disabled="!hasNextPage" 
                class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 disabled:opacity-50"
                :class="{ 'hover:bg-gray-50 dark:hover:bg-gray-600': hasNextPage }"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import database from '../services/database';
import { getStandardizedPlace } from '../data/birthplaces';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { usePagination } from '../composables/usePagination';

// Register ECharts components
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent
]);

const ITEMS_PER_PAGE = 15;

export default {
  name: 'ReportsView',
  components: {
    VChart
  },
  setup() {
    const isLoading = ref(true);
    const mariners = ref([]);
    const chartOption = ref({});
    const selectedLocation = ref('');
    const availableLocations = ref([]);
    const filteredMariners = ref([]);
    const filteredCount = ref(0);
    
    // Load all mariners data
    const loadMarinersData = async () => {
      isLoading.value = true;
      try {
        // Get the total count first
        const count = await database.getMarinersCount();
        
        // Then get all mariners
        const result = await database.getMarinersPaginated(1, count);
        mariners.value = result.mariners || [];
        
        // Generate chart data once we have the mariners
        generateChartData();
        updateAvailableLocations();
      } catch (error) {
        console.error('Error loading mariner data:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    const loadFilteredMariners = async () => {
      isLoading.value = true;
      try {
        if (!selectedLocation.value) {
          filteredMariners.value = [];
          filteredCount.value = 0;
          return;
        }
        
        // Filter mariners by selected location
        filteredMariners.value = mariners.value.filter(mariner => {
          if (!mariner.place_of_birth) return false;
          const standardizedPlace = getStandardizedPlace(mariner.place_of_birth);
          return standardizedPlace
            ? standardizedPlace.label === selectedLocation.value
            : mariner.place_of_birth.trim() === selectedLocation.value;
        });
        
        filteredCount.value = filteredMariners.value.length;
      } catch (error) {
        console.error('Error filtering mariners:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    // Pagination setup
    const {
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage
    } = usePagination(filteredCount, ITEMS_PER_PAGE);
    
    // Calculate paginated items
    const paginatedMariners = computed(() => {
      const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return filteredMariners.value.slice(start, end);
    });
    
    // Generate pie chart data
    const generateChartData = () => {
      // Count occurrences of each birthplace
      const birthplaceCounts = {};
      let validBirthplaceCount = 0;
      
      mariners.value.forEach(mariner => {
        if (mariner.place_of_birth) {
          validBirthplaceCount++;
          const standardizedPlace = getStandardizedPlace(mariner.place_of_birth);
          
          if (standardizedPlace) {
            const placeName = standardizedPlace.label;
            birthplaceCounts[placeName] = (birthplaceCounts[placeName] || 0) + 1;
          } else {
            // For places that couldn't be standardized
            const rawPlace = mariner.place_of_birth.trim();
            birthplaceCounts[rawPlace] = (birthplaceCounts[rawPlace] || 0) + 1;
          }
        }
      });
      
      // Convert to array and sort by count (descending)
      const sortedPlaces = Object.entries(birthplaceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      
      // Take top 9, group the rest as "Other"
      const topPlaces = sortedPlaces.slice(0, 9);
      const otherPlaces = sortedPlaces.slice(9);
      const otherCount = otherPlaces.reduce((sum, place) => sum + place.count, 0);
      
      // Prepare data for the pie chart
      const chartData = [
        ...topPlaces.map(place => ({ value: place.count, name: place.name }))
      ];
      
      // Only add "Other" category if there are other places
      if (otherCount > 0) {
        chartData.push({ value: otherCount, name: 'Other' });
      }
      
      // Update the chart options
      chartOption.value = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 20,
          bottom: 20,
          textStyle: {
            color: isDarkMode.value ? '#fff' : '#333'
          }
        },
        series: [
          {
            name: 'Place of Birth',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 10,
              borderColor: isDarkMode.value ? '#1f2937' : '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: chartData.map(item => {
              if (item.name === 'Other') {
                return {
                  ...item, 
                  itemStyle: {
                    color: isDarkMode.value ? '#6b7280' : '#9ca3af' // grey-500 or grey-400 for "Other"
                  }
                };
              }
              return item;
            })
          }
        ]
      };
    };

    const updateAvailableLocations = () => {
      const locations = new Set();
      mariners.value.forEach(mariner => {
        if (mariner.place_of_birth) {
          const standardizedPlace = getStandardizedPlace(mariner.place_of_birth);
          if (standardizedPlace) {
            locations.add(standardizedPlace.label);
          } else {
            locations.add(mariner.place_of_birth.trim());
          }
        }
      });
      availableLocations.value = Array.from(locations).sort();
    };

    const handleChartClick = params => {
      if (params.name === 'Other') return;
      selectedLocation.value = params.name;
      currentPage.value = 1; // Reset to first page when changing location
      loadFilteredMariners();
    };

    const handleLocationSelect = () => {
      currentPage.value = 1; // Reset to first page when changing location
      loadFilteredMariners();
    };

    const clearLocationFilter = () => {
      selectedLocation.value = '';
      filteredMariners.value = [];
      filteredCount.value = 0;
    };

    // Track dark mode for chart styling
    const isDarkMode = computed(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    // Watch for dark mode changes to update chart
    watch(isDarkMode, () => {
      generateChartData();
    });
    
    // Watch for location changes
    watch(selectedLocation, () => {
      loadFilteredMariners();
    });
    
    // Total number of mariners
    const totalMariners = computed(() => mariners.value.length);
    
    // Count mariners with birthplace data
    const totalMarinersWithBirthplace = computed(() => {
      return mariners.value.filter(m => m.place_of_birth && m.place_of_birth.trim() !== '').length;
    });
    
    // Count mariners missing birthplace data
    const missingBirthplaceCount = computed(() => {
      return totalMariners.value - totalMarinersWithBirthplace.value;
    });
    
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
      chartOption,
      totalMariners,
      totalMarinersWithBirthplace,
      missingBirthplaceCount,
      shetlandCount,
      otherCount,
      shetlandPercentage,
      otherPercentage,
      selectedLocation,
      availableLocations,
      filteredMariners,
      filteredCount,
      paginatedMariners,
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage,
      itemsPerPage: ITEMS_PER_PAGE,
      handleChartClick,
      handleLocationSelect,
      clearLocationFilter
    };
  }
}
</script>