<template>
  <div class="reports-view">
    <!-- Grid of report tiles shown when no report is active -->
    <div v-if="!activeReport">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold dark:text-white">Reports</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Birthplace Distribution Report Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-blue-500">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold dark:text-white">Birthplace Distribution</h2>
            <span class="text-sm text-blue-600 dark:text-blue-400 font-medium bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">Demographics</span>
          </div>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Analysis of mariners by their place of birth, showing regional distribution patterns.
          </p>
          
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
          
          <div v-else class="h-60">
            <!-- Preview chart for the tile -->
            <v-chart 
              :key="chartRenderKey" 
              class="w-full h-full" 
              :option="generatePreviewChartOption()" 
              autoresize 
            />
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button 
              @click="activateReport('birthplace')"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-sm flex items-center"
            >
              <span>View Full Report</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Dataset Statistics Report Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-green-500">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold dark:text-white">Dataset Statistics</h2>
            <span class="text-sm text-green-600 dark:text-green-400 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Overview</span>
          </div>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Summary statistics and key metrics about the mariners dataset.
          </p>
          
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
          </div>
          
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
            <div class="bg-blue-50 dark:bg-gray-700 p-3 rounded-lg">
              <h3 class="text-sm font-medium text-blue-700 dark:text-blue-300">Total Mariners</h3>
              <p class="text-2xl font-bold text-blue-800 dark:text-blue-200">{{ totalMariners }}</p>
            </div>
            
            <div class="bg-green-50 dark:bg-gray-700 p-3 rounded-lg">
              <h3 class="text-sm font-medium text-green-700 dark:text-green-300">Shetland Born</h3>
              <p class="text-2xl font-bold text-green-800 dark:text-green-200">{{ shetlandCount }}</p>
            </div>
            
            <div class="bg-purple-50 dark:bg-gray-700 p-3 rounded-lg">
              <h3 class="text-sm font-medium text-purple-700 dark:text-purple-300">Missing Data</h3>
              <p class="text-2xl font-bold text-purple-800 dark:text-purple-200">{{ missingBirthplaceCount }}</p>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button 
              @click="activateReport('statistics')"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-sm flex items-center"
            >
              <span>View Full Report</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Age Distribution (Placeholder/Coming Soon) -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-gray-400 opacity-75">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold dark:text-white">Age Distribution</h2>
            <span class="text-sm text-gray-600 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Coming Soon</span>
          </div>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Analysis of mariners by age distribution and life expectancy.
          </p>
          
          <div class="flex flex-col items-center justify-center h-60 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400 text-center">This report is under development<br>and will be available soon.</p>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button 
              disabled
              class="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-50 text-sm flex items-center"
            >
              <span>Coming Soon</span>
            </button>
          </div>
        </div>
        
        <!-- Career Paths (Placeholder/Coming Soon) -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-gray-400 opacity-75">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold dark:text-white">Career Paths</h2>
            <span class="text-sm text-gray-600 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Coming Soon</span>
          </div>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Analysis of mariner career progressions and ship assignments.
          </p>
          
          <div class="flex flex-col items-center justify-center h-60 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p class="text-gray-500 dark:text-gray-400 text-center">This report is under development<br>and will be available soon.</p>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button 
              disabled
              class="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-50 text-sm flex items-center"
            >
              <span>Coming Soon</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Individual Report Detail View -->
    <div v-else>
      <!-- Birthplace Distribution Report -->
      <div v-if="activeReport === 'birthplace'">
        <div class="flex items-center mb-6">
          <button 
            @click="activeReport = null" 
            class="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Reports
          </button>
          <h1 class="text-2xl font-bold dark:text-white">Birthplace Distribution</h1>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Pie Chart -->
            <div class="h-80 relative">
              <v-chart 
                :key="chartRenderKey" 
                class="w-full h-full" 
                :option="chartOption" 
                autoresize 
                @click="handleChartClick" 
              />
              <!-- Back button when showing Other details -->
              <button 
                v-if="showingOtherDetails" 
                @click="returnToMainChart"
                class="absolute top-2 left-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to main view
              </button>
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
                    class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
          
          <!-- Filtered Mariners Table -->
          <div v-if="selectedLocation" class="mt-8">
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
                    <tr v-for="mariner in paginatedMariners" :key="mariner.person_id" class="hover:bg-gray-100 dark:hover:bg-gray-700">
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
      
      <!-- Dataset Statistics Report -->
      <div v-if="activeReport === 'statistics'">
        <div class="flex items-center mb-6">
          <button 
            @click="activeReport = null" 
            class="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Reports
          </button>
          <h1 class="text-2xl font-bold dark:text-white">Dataset Statistics</h1>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
          
          <div v-else>
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
            
            <!-- Additional statistics sections would go here -->
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow p-6 mb-6">
              <h3 class="text-lg font-medium dark:text-white mb-4">Data Completeness</h3>
              
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Birth Information</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ Math.round((totalMariners - missingBirthInfo) / totalMariners * 100) }}%
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div class="bg-blue-600 h-2.5 rounded-full" :style="{width: `${Math.round((totalMariners - missingBirthInfo) / totalMariners * 100)}%`}"></div>
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Death Information</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ Math.round((totalMariners - missingDeathInfo) / totalMariners * 100) }}%
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div class="bg-green-600 h-2.5 rounded-full" :style="{width: `${Math.round((totalMariners - missingDeathInfo) / totalMariners * 100)}%`}"></div>
                  </div>
                </div>
                
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Ship Assignments</span>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {{ Math.round((marinersWithShips) / totalMariners * 100) }}%
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div class="bg-purple-600 h-2.5 rounded-full" :style="{width: `${Math.round((marinersWithShips) / totalMariners * 100)}%`}"></div>
                  </div>
                </div>
              </div>
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
    const chartRenderKey = ref(0); // Key to force chart recreation
    const selectedLocation = ref('');
    const availableLocations = ref([]);
    const filteredMariners = ref([]);
    const filteredCount = ref(0);
    const showingOtherDetails = ref(false);
    const otherPlacesData = ref([]);
    const activeReport = ref(null);
    
    // Placeholders for additional statistics
    const missingBirthInfo = ref(0);
    const missingDeathInfo = ref(0);
    const marinersWithShips = ref(0);
    
    // Track dark mode state through direct DOM observation
    const isDarkModeActive = ref(document.documentElement.classList.contains('dark'));
    
    // Create a MutationObserver to watch for dark mode class changes
    onMounted(() => {
      // Set up the observer to watch the html element for class changes
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'class') {
            const isDark = document.documentElement.classList.contains('dark');
            
            if (isDark !== isDarkModeActive.value) {
              isDarkModeActive.value = isDark;
              
              // Update chart with new theme
              generateChartData();
              
              // Force chart recreation
              chartRenderKey.value++;
            }
          }
        });
      });
      
      // Start observing
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class']
      });
    });

    // Load all mariners data
    const loadMarinersData = async () => {
      isLoading.value = true;
      try {
        // Get the total count first
        const count = await database.getMarinersCount();
        
        // Then get all mariners
        const result = await database.getMarinersPaginated(1, count);
        mariners.value = result.mariners || [];
        
        // Calculate additional statistics
        calculateExtendedStatistics();
        
        // Generate chart data once we have the mariners
        generateChartData();
        updateAvailableLocations();
      } catch (error) {
        console.error('Error loading mariner data:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    const calculateExtendedStatistics = () => {
      // Calculate mariners missing birth info
      missingBirthInfo.value = mariners.value.filter(m => !m.year_of_birth && !m.place_of_birth).length;
      
      // Calculate mariners missing death info
      missingDeathInfo.value = mariners.value.filter(m => !m.year_of_death).length;
      
      // Calculate mariners with ship assignments
      marinersWithShips.value = mariners.value.filter(m => 
        m.ship1 || m.ship2 || m.ship3 || 
        (m.shipAssignments && m.shipAssignments.length > 0)
      ).length;
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
    
    // Generate simplified chart for preview
    const generatePreviewChartOption = () => {
      if (mariners.value.length === 0) return {};
      
      // Count occurrences of each birthplace group (simplified)
      const shetlandMarinersCount = shetlandMariners.value.length;
      const otherMarinersCount = otherMariners.value.length;
      const unknownCount = totalMariners.value - shetlandMarinersCount - otherMarinersCount;
      
      // Prepare data for the preview chart
      const previewData = [
        { value: shetlandMarinersCount, name: 'Shetland' },
        { value: otherMarinersCount, name: 'Other' }
      ];
      
      if (unknownCount > 0) {
        previewData.push({ value: unknownCount, name: 'Unknown' });
      }
      
      // Return simplified chart options
      return {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 5,
              borderColor: isDarkModeActive.value ? '#1f2937' : '#fff',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold',
                color: isDarkModeActive.value ? '#fff' : '#333'
              }
            },
            labelLine: {
              show: false
            },
            data: previewData.map(item => {
              if (item.name === 'Unknown') {
                return {
                  ...item, 
                  itemStyle: {
                    color: isDarkModeActive.value ? '#6b7280' : '#9ca3af'
                  }
                };
              }
              return item;
            })
          }
        ]
      };
    };
    
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
      otherPlacesData.value = otherPlaces;
      const otherCount = otherPlaces.reduce((sum, place) => sum + place.count, 0);
      
      // Prepare data for the pie chart
      let chartData;
      let chartTitle;
      
      if (showingOtherDetails.value) {
        // When showing details of "Other" category, display those places
        chartData = otherPlaces.map(place => ({ value: place.count, name: place.name }));
        chartTitle = 'Other Birthplaces';
      } else {
        // Normal view showing top places + "Other"
        chartData = [
          ...topPlaces.map(place => ({ value: place.count, name: place.name }))
        ];
        
        // Only add "Other" category if there are other places
        if (otherCount > 0) {
          chartData.push({ value: otherCount, name: 'Other' });
        }
        chartTitle = 'Place of Birth';
      }
      
      // Update the chart options
      chartOption.value = {
        title: {
          text: chartTitle,
          left: 'center',
          top: 0,
          textStyle: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 30,
          bottom: 20,
          textStyle: {
            color: isDarkModeActive.value ? '#fff' : '#333'
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
              borderColor: isDarkModeActive.value ? '#1f2937' : '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center',
              color: isDarkModeActive.value ? '#fff' : '#333'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold',
                color: isDarkModeActive.value ? '#fff' : '#333'
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
                    color: isDarkModeActive.value ? '#6b7280' : '#9ca3af' // grey-500 or grey-400 for "Other"
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
      if (params.name === 'Other') {
        // When "Other" is clicked, show the breakdown of other places
        showingOtherDetails.value = true;
        generateChartData();
        return;
      }
      
      // For all other locations, filter by that location
      selectedLocation.value = params.name;
      currentPage.value = 1; // Reset to first page when changing location
      loadFilteredMariners();
    };

    const returnToMainChart = () => {
      showingOtherDetails.value = false;
      generateChartData();
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

    const activateReport = (reportType) => {
      activeReport.value = reportType;
      // Reset pagination when switching reports
      currentPage.value = 1;
    };

    const getReportTitle = (reportType) => {
      const titles = {
        'birthplace': 'Birthplace Distribution',
        'statistics': 'Dataset Statistics'
      };
      return titles[reportType] || 'Report';
    };

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
      chartRenderKey,
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
      clearLocationFilter,
      showingOtherDetails,
      returnToMainChart,
      activeReport,
      activateReport,
      getReportTitle,
      generatePreviewChartOption,
      // Additional stats for extended reports
      missingBirthInfo,
      missingDeathInfo,
      marinersWithShips
    };
  }
}
</script>