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
        
        <!-- Crew Overlap Report Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-indigo-500">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold dark:text-white">Crew Overlap Analysis</h2>
            <span class="text-sm text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded">Relationships</span>
          </div>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Find mariners who served together on the same ships during overlapping time periods.
          </p>
          
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
          
          <div v-else class="h-60 flex flex-col justify-center">
            <div class="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-indigo-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p class="text-lg font-medium text-gray-900 dark:text-white">Discover Joint Voyages</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">See which mariners sailed together on the same ships</p>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button 
              @click="activateReport('crew-overlap')"
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-sm flex items-center"
            >
              <span>View Full Report</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Ship Crew Report Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-teal-500">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold dark:text-white">Ship Crew Lists</h2>
            <span class="text-sm text-teal-600 dark:text-teal-400 font-medium bg-teal-100 dark:bg-teal-900/30 px-2 py-1 rounded">Vessels</span>
          </div>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            View complete crew lists for each ship, including service dates and ranks.
          </p>
          
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          </div>
          
          <div v-else class="h-60 flex flex-col justify-center">
            <div class="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-teal-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p class="text-lg font-medium text-gray-900 dark:text-white">Ship Rosters</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Search for ships and view complete crew lists</p>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button 
              @click="activateReport('ship-crew')"
              class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-sm flex items-center"
            >
              <span>View Full Report</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Age Distribution Report Card -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-orange-500">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold dark:text-white">Age & Mortality Analysis</h2>
            <span class="text-sm text-orange-600 dark:text-orange-400 font-medium bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">Demographics</span>
          </div>
          
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Analysis of birth years, age at death, and mortality trends over time.
          </p>
          
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
          </div>
          
          <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-2">
            <div class="bg-orange-50 dark:bg-gray-700 p-3 rounded-lg">
              <h3 class="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Age at Death</h3>
              <p class="text-2xl font-bold text-orange-800 dark:text-orange-200">{{ averageAgeAtDeath }}</p>
            </div>
            
            <div class="bg-blue-50 dark:bg-gray-700 p-3 rounded-lg">
              <h3 class="text-sm font-medium text-blue-700 dark:text-blue-300">With Birth Year</h3>
              <p class="text-2xl font-bold text-blue-800 dark:text-blue-200">{{ marinersWithBirthYear }}</p>
            </div>
            
            <div class="bg-purple-50 dark:bg-gray-700 p-3 rounded-lg">
              <h3 class="text-sm font-medium text-purple-700 dark:text-purple-300">With Death Year</h3>
              <p class="text-2xl font-bold text-purple-800 dark:text-purple-200">{{ marinersWithDeathYear }}</p>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button 
              @click="activateReport('age-analysis')"
              class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-sm flex items-center"
            >
              <span>View Full Report</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
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
        
        <!-- Mortality Analysis Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <!-- Died at Sea Chart -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4 dark:text-white">Died at Sea Distribution</h2>
            <div class="h-80">
              <v-chart 
                :key="'sea-' + chartRenderKey" 
                class="w-full h-full" 
                :option="diedAtSeaChartOption" 
                autoresize 
              />
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div class="grid grid-cols-2 gap-4 text-center text-sm">
                <div>
                  <div class="font-semibold text-red-600 dark:text-red-400">{{ diedAtSeaCount }}</div>
                  <div class="text-gray-600 dark:text-gray-400">Died at Sea</div>
                </div>
                <div>
                  <div class="font-semibold text-gray-600 dark:text-gray-400">{{ unknownDeathLocationCount }}</div>
                  <div class="text-gray-600 dark:text-gray-400">Unknown</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Cause of Death Chart -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4 dark:text-white">Top Causes of Death</h2>
            <div class="h-80">
              <v-chart 
                :key="'cod-' + chartRenderKey" 
                class="w-full h-full" 
                :option="causeOfDeathChartOption" 
                autoresize 
              />
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div class="text-center text-sm">
                <div class="font-semibold text-gray-900 dark:text-white">{{ marinersWithCOD }}</div>
                <div class="text-gray-600 dark:text-gray-400">Mariners with recorded cause of death</div>
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

      <!-- Crew Overlap Report -->
      <div v-if="activeReport === 'crew-overlap'">
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
          <h1 class="text-2xl font-bold dark:text-white">Crew Overlap Analysis</h1>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-4 dark:text-white">About This Report</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
              This report identifies mariners who served together on the same ships during overlapping time periods.
              You can discover which sailors potentially knew each other or worked together during their careers.
            </p>
            
            <!-- Filters -->
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="ship-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Ship:
                </label>
                <div class="flex space-x-2">
                  <select 
                    id="ship-filter" 
                    v-model="crewShipFilter" 
                    @change="loadCrewOverlaps"
                    class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">All Ships</option>
                    <option v-for="ship in availableShips" :key="ship" :value="ship">
                      {{ ship }}
                    </option>
                  </select>
                  <button 
                    v-if="crewShipFilter" 
                    @click="clearCrewFilters('ship')"
                    class="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                    title="Clear filter"
                  >
                    <span class="text-gray-700 dark:text-gray-200">×</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label for="date-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Date (YYYY-MM-DD):
                </label>
                <div class="flex space-x-2">
                  <input 
                    id="date-filter" 
                    v-model="crewDateFilter" 
                    placeholder="e.g. 1805-07-15" 
                    class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <button 
                    @click="loadCrewOverlaps"
                    class="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500"
                    title="Apply filter"
                  >
                    <span>Apply</span>
                  </button>
                  <button 
                    v-if="crewDateFilter" 
                    @click="clearCrewFilters('date')"
                    class="px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                    title="Clear filter"
                  >
                    <span class="text-gray-700 dark:text-gray-200">×</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="isLoadingCrew" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
          
          <div v-else>
            <!-- Crew Overlaps Table -->
            <div v-if="crewOverlaps.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              No crew overlaps found with the current filters. Try adjusting your search or clearing filters.
            </div>
            
            <div v-else>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ship</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">First Mariner</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Second Mariner</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overlap Period</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ranks</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="overlap in paginatedCrewOverlaps" :key="`${overlap.assignment1_id}-${overlap.assignment2_id}`" class="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">{{ overlap.ship_name || 'Unknown' }}</div>
                        <div v-if="overlap.ship_designation" class="text-xs text-gray-500 dark:text-gray-400">{{ overlap.ship_designation }}</div>
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ overlap.surname1 }}, {{ overlap.forename1 }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                          {{ formatDate(overlap.start_date1) }} - {{ formatDate(overlap.end_date1) || 'Unknown' }}
                        </div>
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ overlap.surname2 }}, {{ overlap.forename2 }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                          {{ formatDate(overlap.start_date2) }} - {{ formatDate(overlap.end_date2) || 'Unknown' }}
                        </div>
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-900 dark:text-white">
                          {{ calculateOverlapPeriod(overlap) }}
                        </div>
                        <div v-if="calculateOverlapDuration(overlap)" class="text-xs text-gray-500 dark:text-gray-400">
                          {{ calculateOverlapDuration(overlap) }}
                        </div>
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 mr-1">
                            {{ overlap.rank1 || 'Unknown' }}
                          </span>
                          &
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 ml-1">
                            {{ overlap.rank2 || 'Unknown' }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination -->
              <div class="flex items-center justify-between mt-4">
                <div class="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span class="font-medium">{{ (crewCurrentPage - 1) * itemsPerPage + 1 }}</span> to 
                  <span class="font-medium">{{ Math.min(crewCurrentPage * itemsPerPage, crewTotalCount) }}</span> of 
                  <span class="font-medium">{{ crewTotalCount }}</span> overlaps
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="prevCrewPage" 
                    :disabled="!hasCrewPrevPage" 
                    class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 disabled:opacity-50"
                    :class="{ 'hover:bg-gray-50 dark:hover:bg-gray-600': hasCrewPrevPage }"
                  >
                    Previous
                  </button>
                  <button 
                    @click="nextCrewPage" 
                    :disabled="!hasCrewNextPage" 
                    class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 disabled:opacity-50"
                    :class="{ 'hover:bg-gray-50 dark:hover:bg-gray-600': hasCrewNextPage }"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ship Crew Report -->
      <div v-if="activeReport === 'ship-crew'">
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
          <h1 class="text-2xl font-bold dark:text-white">Ship Crew Lists</h1>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-4 dark:text-white">Find Ship Crews</h2>
            <p class="text-gray-700 dark:text-gray-300 mb-3">
              Search for a ship to view its complete crew list, including service dates and ranks of all mariners who served aboard.
            </p>
            
            <!-- Ship Search -->
            <div class="mt-6">
              <label for="ship-search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search for a ship:
              </label>
              <div class="flex space-x-2">
                <input 
                  id="ship-search" 
                  v-model="shipSearch" 
                  @keyup.enter="searchShipsForCrew"
                  placeholder="Enter ship name..." 
                  class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button 
                  @click="searchShipsForCrew"
                  class="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 dark:hover:bg-teal-500"
                  title="Search"
                >
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Display ship search results -->
          <div v-if="shipSearchPerformed && !isLoadingShipSearch">
            <div v-if="shipSearchResults.ships && shipSearchResults.ships.length > 0" class="mb-8">
              <h3 class="text-lg font-semibold mb-4 dark:text-white">Ships Found</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div 
                  v-for="ship in shipSearchResults.ships" 
                  :key="ship.shipID" 
                  @click="selectShipForCrew(ship)"
                  class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-2 hover:border-teal-500 dark:hover:border-teal-400 cursor-pointer transition-colors duration-200"
                  :class="selectedShipId === ship.shipID ? 'border-teal-500 dark:border-teal-400' : 'border-transparent'"
                >
                  <div class="font-medium text-gray-900 dark:text-white">{{ ship.name || 'Unknown' }}</div>
                  <div v-if="ship.designation" class="text-sm text-gray-500 dark:text-gray-400">{{ ship.designation }}</div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
              No ships found matching your search term. Try a different search.
            </div>
          </div>
          
          <div v-if="isLoadingShipSearch || isLoadingShipCrew" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          </div>
          
          <!-- Selected Ship Crew -->
          <div v-if="selectedShipId && shipCrewLoaded && !isLoadingShipCrew" class="mt-8">
            <div class="mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-md">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-lg font-semibold text-teal-800 dark:text-teal-300">
                    {{ selectedShipDetails.name || 'Unknown Ship' }}
                  </h3>
                  <p v-if="selectedShipDetails.designation" class="text-sm text-teal-600 dark:text-teal-400">
                    {{ selectedShipDetails.designation }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-teal-600 dark:text-teal-400">
                    <span class="font-medium">Total Crew:</span> {{ shipCrewTotal }}
                  </p>
                </div>
              </div>
            </div>
            
            <div v-if="shipCrew.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              No crew records found for this ship.
            </div>
            
            <div v-else>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mariner</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service Period</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Birthplace</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="crewMember in shipCrew" :key="crewMember.assignment_id" class="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ crewMember.surname }}, {{ crewMember.forename }}
                        </div>
                        <div v-if="crewMember.year_of_birth" class="text-xs text-gray-500 dark:text-gray-400">
                          b. {{ crewMember.year_of_birth }}
                        </div>
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-700 dark:text-gray-300">
                          {{ crewMember.rank || 'Unknown' }}
                        </div>
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-700 dark:text-gray-300">
                          {{ formatDate(crewMember.start_date) || 'Unknown' }} - 
                          {{ formatDate(crewMember.end_date) || 'Unknown' }}
                        </div>
                        <div v-if="calculateServiceDuration(crewMember)" class="text-xs text-gray-500 dark:text-gray-400">
                          {{ calculateServiceDuration(crewMember) }}
                        </div>
                      </td>
                      <td class="px-4 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-700 dark:text-gray-300">
                          {{ crewMember.place_of_birth || 'Unknown' }}
                        </div>
                        <div v-if="crewMember.died_at_sea" class="text-xs text-red-500 dark:text-red-400 font-medium">
                          Died at sea
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination -->
              <div class="flex items-center justify-between mt-4">
                <div class="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span class="font-medium">{{ ((shipCrewPage || 1) - 1) * itemsPerPage + 1 }}</span> to 
                  <span class="font-medium">{{ Math.min((shipCrewPage || 1) * itemsPerPage, shipCrewTotal) }}</span> of 
                  <span class="font-medium">{{ shipCrewTotal }}</span> crew members
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="prevShipCrewPage" 
                    :disabled="!hasShipCrewPrevPage" 
                    class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 disabled:opacity-50"
                    :class="{ 'hover:bg-gray-50 dark:hover:bg-gray-600': hasShipCrewPrevPage }"
                  >
                    Previous
                  </button>
                  <button 
                    @click="nextShipCrewPage" 
                    :disabled="!hasShipCrewNextPage" 
                    class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 disabled:opacity-50"
                    :class="{ 'hover:bg-gray-50 dark:hover:bg-gray-600': hasShipCrewNextPage }"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Age Analysis Report -->
      <div v-if="activeReport === 'age-analysis'">
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
          <h1 class="text-2xl font-bold dark:text-white">Age & Mortality Analysis</h1>
        </div>

        <div class="space-y-6">
          <!-- Key Statistics -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4 dark:text-white">Key Statistics</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div class="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-orange-700 dark:text-orange-300">Average Age at Death</h3>
                <p class="text-3xl font-bold text-orange-800 dark:text-orange-200">{{ averageAgeAtDeath }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Based on {{ marinersWithBothDates }} mariners</p>
              </div>
              
              <div class="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-blue-700 dark:text-blue-300">Mariners with Birth Year</h3>
                <p class="text-3xl font-bold text-blue-800 dark:text-blue-200">{{ marinersWithBirthYear }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ birthYearPercentage }}% of total</p>
              </div>
              
              <div class="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-purple-700 dark:text-purple-300">Mariners with Death Year</h3>
                <p class="text-3xl font-bold text-purple-800 dark:text-purple-200">{{ marinersWithDeathYear }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ deathYearPercentage }}% of total</p>
              </div>
              
              <div class="bg-green-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-green-700 dark:text-green-300">Complete Records</h3>
                <p class="text-3xl font-bold text-green-800 dark:text-green-200">{{ marinersWithBothDates }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">Both birth & death years</p>
              </div>
              
              <div 
                @click="longestLife.person_id && navigateToMariner(longestLife.person_id)"
                class="bg-indigo-50 dark:bg-gray-700 p-4 rounded-lg"
                :class="{ 'cursor-pointer hover:bg-indigo-100 dark:hover:bg-gray-600 transition-colors': longestLife.person_id }"
              >
                <h3 class="text-sm font-medium text-indigo-700 dark:text-indigo-300">Longest Life</h3>
                <p class="text-3xl font-bold text-indigo-800 dark:text-indigo-200">{{ longestLife.age }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ longestLife.name }}</p>
              </div>
              
              <div 
                @click="shortestLife.person_id && navigateToMariner(shortestLife.person_id)"
                class="bg-red-50 dark:bg-gray-700 p-4 rounded-lg"
                :class="{ 'cursor-pointer hover:bg-red-100 dark:hover:bg-gray-600 transition-colors': shortestLife.person_id }"
              >
                <h3 class="text-sm font-medium text-red-700 dark:text-red-300">Shortest Life</h3>
                <p class="text-3xl font-bold text-red-800 dark:text-red-200">{{ shortestLife.age }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">{{ shortestLife.name }}</p>
              </div>
            </div>
          </div>

          <!-- Birth Year Trend Chart -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4 dark:text-white">Births by Year</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Distribution of mariner birth years over time (only valid years shown).
            </p>
            <div class="h-96">
              <v-chart 
                :key="'birth-' + chartRenderKey" 
                class="w-full h-full" 
                :option="birthYearChartOption" 
                autoresize 
              />
            </div>
          </div>

          <!-- Age at Death Distribution Chart -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4 dark:text-white">Age at Death Distribution</h2>
            <p class="text-gray-600 dark:text-gray-300 mb-4">
              Distribution of ages at death for mariners with both birth and death years recorded.
            </p>
            <div class="h-96">
              <v-chart 
                :key="'death-' + chartRenderKey" 
                class="w-full h-full" 
                :option="ageAtDeathChartOption" 
                autoresize 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import database from '../services/database';
import { getStandardizedPlace } from '../data/birthplaces';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent
} from 'echarts/components';
import VChart from 'vue-echarts';
import { usePagination } from '../composables/usePagination';

// Register ECharts components
use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent
]);

const ITEMS_PER_PAGE = 15;

export default {
  name: 'ReportsView',
  components: {
    VChart
  },
  setup() {
    const router = useRouter();
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
    
    // Age analysis chart options
    const birthYearChartOption = ref({});
    const ageAtDeathChartOption = ref({});
    
    // Mortality analysis chart options
    const diedAtSeaChartOption = ref({});
    const causeOfDeathChartOption = ref({});
    
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
              generateAgeAnalysisCharts();
              generateMortalityCharts();
              
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
        generateAgeAnalysisCharts();
        generateMortalityCharts();
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

    const generateAgeAnalysisCharts = () => {
      // Generate Birth Year Trend Chart
      const birthYearData = {};
      mariners.value.forEach(m => {
        const year = m.year_of_birth;
        if (year && !isNaN(year) && year >= 1600 && year <= 2100) {
          birthYearData[year] = (birthYearData[year] || 0) + 1;
        }
      });
      
      const birthYears = Object.keys(birthYearData).sort((a, b) => a - b);
      const birthCounts = birthYears.map(year => birthYearData[year]);
      
      birthYearChartOption.value = {
        title: {
          text: 'Births by Year',
          left: 'center',
          textStyle: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}: {c} mariners'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: birthYears,
          axisLabel: {
            color: isDarkModeActive.value ? '#fff' : '#333',
            rotate: 45
          }
        },
        yAxis: {
          type: 'value',
          name: 'Number of Mariners',
          axisLabel: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          },
          nameTextStyle: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        series: [{
          data: birthCounts,
          type: 'line',
          smooth: true,
          itemStyle: {
            color: '#3b82f6'
          },
          areaStyle: {
            color: isDarkModeActive.value ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
          }
        }]
      };
      
      // Generate Age at Death Distribution Chart
      const ageAtDeathData = {};
      mariners.value.forEach(m => {
        const birth = m.year_of_birth;
        const death = m.year_of_death;
        if (birth && death && 
            !isNaN(birth) && !isNaN(death) &&
            birth >= 1600 && birth <= 2100 &&
            death >= 1600 && death <= 2100 &&
            death >= birth) {
          const age = death - birth;
          // Group into 5-year buckets
          const bucket = Math.floor(age / 5) * 5;
          ageAtDeathData[bucket] = (ageAtDeathData[bucket] || 0) + 1;
        }
      });
      
      const ageBuckets = Object.keys(ageAtDeathData).sort((a, b) => a - b);
      const ageCounts = ageBuckets.map(bucket => ageAtDeathData[bucket]);
      const ageLabels = ageBuckets.map(bucket => `${bucket}-${parseInt(bucket) + 4}`);
      
      ageAtDeathChartOption.value = {
        title: {
          text: 'Age at Death Distribution',
          left: 'center',
          textStyle: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b} years: {c} mariners'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ageLabels,
          name: 'Age Range (years)',
          axisLabel: {
            color: isDarkModeActive.value ? '#fff' : '#333',
            rotate: 45
          },
          nameTextStyle: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        yAxis: {
          type: 'value',
          name: 'Number of Mariners',
          axisLabel: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          },
          nameTextStyle: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        series: [{
          data: ageCounts,
          type: 'bar',
          itemStyle: {
            color: '#f97316'
          }
        }]
      };
    };

    const generateMortalityCharts = () => {
      // Generate Died at Sea Chart
      const seaData = [
        { value: diedAtSeaCount.value, name: 'Died at Sea' },
        { value: unknownDeathLocationCount.value, name: 'Unknown' }
      ];
      
      diedAtSeaChartOption.value = {
        title: {
          text: 'Mortality Location',
          left: 'center',
          textStyle: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 10,
            borderColor: isDarkModeActive.value ? '#1f2937' : '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold',
              color: isDarkModeActive.value ? '#fff' : '#333'
            }
          },
          data: seaData.map(item => {
            let color;
            if (item.name === 'Died at Sea') color = '#ef4444';
            else color = '#6b7280';
            
            return {
              ...item,
              itemStyle: { color }
            };
          })
        }]
      };
      
      // Generate Cause of Death Chart
      const codData = {};
      mariners.value.forEach(m => {
        if (m.cod && m.cod.trim() !== '') {
          const cause = m.cod.trim();
          codData[cause] = (codData[cause] || 0) + 1;
        }
      });
      
      // Sort and get top 10 causes
      const sortedCauses = Object.entries(codData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      const causes = sortedCauses.map(([cause]) => cause);
      const counts = sortedCauses.map(([, count]) => count);
      
      causeOfDeathChartOption.value = {
        title: {
          text: 'Top 10 Causes of Death',
          left: 'center',
          textStyle: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        yAxis: {
          type: 'category',
          data: causes,
          axisLabel: {
            color: isDarkModeActive.value ? '#fff' : '#333'
          }
        },
        series: [{
          type: 'bar',
          data: counts,
          itemStyle: {
            color: '#8b5cf6'
          }
        }]
      };
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

    const navigateToMariner = (personId) => {
      router.push(`/mariners/${personId}`);
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
    
    // Age analysis computed properties
    const marinersWithBirthYear = computed(() => {
      return mariners.value.filter(m => {
        const year = m.year_of_birth;
        return year && !isNaN(year) && year >= 1600 && year <= 2100;
      }).length;
    });
    
    const marinersWithDeathYear = computed(() => {
      return mariners.value.filter(m => {
        const year = m.year_of_death;
        return year && !isNaN(year) && year >= 1600 && year <= 2100;
      }).length;
    });
    
    const marinersWithBothDates = computed(() => {
      return mariners.value.filter(m => {
        const birth = m.year_of_birth;
        const death = m.year_of_death;
        return birth && death && 
               !isNaN(birth) && !isNaN(death) &&
               birth >= 1600 && birth <= 2100 &&
               death >= 1600 && death <= 2100 &&
               death >= birth;
      }).length;
    });
    
    const averageAgeAtDeath = computed(() => {
      const marinersWithAge = mariners.value.filter(m => {
        const birth = m.year_of_birth;
        const death = m.year_of_death;
        return birth && death && 
               !isNaN(birth) && !isNaN(death) &&
               birth >= 1600 && birth <= 2100 &&
               death >= 1600 && death <= 2100 &&
               death >= birth;
      });
      
      if (marinersWithAge.length === 0) return 'N/A';
      
      const totalAge = marinersWithAge.reduce((sum, m) => {
        return sum + (m.year_of_death - m.year_of_birth);
      }, 0);
      
      return Math.round(totalAge / marinersWithAge.length);
    });
    
    const birthYearPercentage = computed(() => {
      if (totalMariners.value === 0) return 0;
      return Math.round((marinersWithBirthYear.value / totalMariners.value) * 100);
    });
    
    const deathYearPercentage = computed(() => {
      if (totalMariners.value === 0) return 0;
      return Math.round((marinersWithDeathYear.value / totalMariners.value) * 100);
    });
    
    const longestLife = computed(() => {
      const marinersWithAge = mariners.value.filter(m => {
        const birth = m.year_of_birth;
        const death = m.year_of_death;
        return birth && death && 
               !isNaN(birth) && !isNaN(death) &&
               birth >= 1600 && birth <= 2100 &&
               death >= 1600 && death <= 2100 &&
               death >= birth;
      });
      
      if (marinersWithAge.length === 0) return { age: 'N/A', name: 'N/A' };
      
      const oldest = marinersWithAge.reduce((max, m) => {
        const age = m.year_of_death - m.year_of_birth;
        const maxAge = max.year_of_death - max.year_of_birth;
        return age > maxAge ? m : max;
      });
      
      return {
        age: oldest.year_of_death - oldest.year_of_birth,
        name: `${oldest.forename} ${oldest.surname}`,
        person_id: oldest.person_id
      };
    });
    
    const shortestLife = computed(() => {
      const marinersWithAge = mariners.value.filter(m => {
        const birth = m.year_of_birth;
        const death = m.year_of_death;
        return birth && death && 
               !isNaN(birth) && !isNaN(death) &&
               birth >= 1600 && birth <= 2100 &&
               death >= 1600 && death <= 2100 &&
               death >= birth;
      });
      
      if (marinersWithAge.length === 0) return { age: 'N/A', name: 'N/A' };
      
      const youngest = marinersWithAge.reduce((min, m) => {
        const age = m.year_of_death - m.year_of_birth;
        const minAge = min.year_of_death - min.year_of_birth;
        return age < minAge ? m : min;
      });
      
      return {
        age: youngest.year_of_death - youngest.year_of_birth,
        name: `${youngest.forename} ${youngest.surname}`,
        person_id: youngest.person_id
      };
    });
    
    // Count mariners from other places
    const otherMariners = computed(() => {
      return mariners.value.filter(mariner => {
        if (!mariner.place_of_birth) return false;
        
        const standardizedPlace = getStandardizedPlace(mariner.place_of_birth);
        return standardizedPlace && standardizedPlace.group === 'other';
      });
    });
    
    const otherCount = computed(() => otherMariners.value.length);
    
    // Mortality analysis computed properties
    const diedAtSeaCount = computed(() => {
      return mariners.value.filter(m => m.died_at_sea === true || m.died_at_sea === 1).length;
    });
    
    const unknownDeathLocationCount = computed(() => {
      return mariners.value.filter(m => m.died_at_sea === null || m.died_at_sea === undefined).length;
    });
    
    const marinersWithCOD = computed(() => {
      return mariners.value.filter(m => m.cod && m.cod.trim() !== '').length;
    });
    
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

    // Crew Overlap Report functionality
    const isLoadingCrew = ref(false);
    const crewOverlaps = ref([]);
    const crewTotalCount = ref(0);
    const crewShipFilter = ref('');
    const crewDateFilter = ref('');
    const availableShips = ref([]);
    
    // Pagination for crew overlaps
    const crewCurrentPage = ref(1);
    const crewTotalPages = computed(() => {
      return Math.ceil(crewTotalCount.value / ITEMS_PER_PAGE);
    });
    
    const hasCrewNextPage = computed(() => {
      return crewCurrentPage.value < crewTotalPages.value;
    });
    
    const hasCrewPrevPage = computed(() => {
      return crewCurrentPage.value > 1;
    });
    
    const nextCrewPage = () => {
      if (hasCrewNextPage.value) {
        crewCurrentPage.value++;
        loadCrewOverlaps();
      }
    };
    
    const prevCrewPage = () => {
      if (hasCrewPrevPage.value) {
        crewCurrentPage.value--;
        loadCrewOverlaps();
      }
    };
    
    const paginatedCrewOverlaps = computed(() => {
      return crewOverlaps.value;
    });
    
    const loadCrewOverlaps = async () => {
      isLoadingCrew.value = true;
      try {
        const result = await database.getCrewOverlaps(
          crewCurrentPage.value,
          ITEMS_PER_PAGE,
          crewShipFilter.value,
          crewDateFilter.value
        );
        
        crewOverlaps.value = result.overlaps || [];
        crewTotalCount.value = result.total || 0;
      } catch (error) {
        console.error('Error loading crew overlaps:', error);
        crewOverlaps.value = [];
        crewTotalCount.value = 0;
      } finally {
        isLoadingCrew.value = false;
      }
    };
    
    const loadAvailableShips = async () => {
      try {
        // Get all ships for the filter dropdown
        const shipsResponse = await database.getShipsPaginated(1, 1000);
        availableShips.value = shipsResponse.ships
          .filter(ship => ship.name)
          .map(ship => ship.name)
          .sort();
      } catch (error) {
        console.error('Error loading ships:', error);
        availableShips.value = [];
      }
    };
    
    const clearCrewFilters = (filterType) => {
      if (filterType === 'ship') {
        crewShipFilter.value = '';
      } else if (filterType === 'date') {
        crewDateFilter.value = '';
      } else {
        crewShipFilter.value = '';
        crewDateFilter.value = '';
      }
      
      crewCurrentPage.value = 1;
      loadCrewOverlaps();
    };
    
    const calculateOverlapPeriod = (overlap) => {
      // Get the latest start date and earliest end date
      const start1 = overlap.start_date1 ? new Date(overlap.start_date1) : null;
      const start2 = overlap.start_date2 ? new Date(overlap.start_date2) : null;
      const end1 = overlap.end_date1 ? new Date(overlap.end_date1) : null;
      const end2 = overlap.end_date2 ? new Date(overlap.end_date2) : null;
      
      // If any date is invalid, return a placeholder
      if (!start1 || !start2) {
        return 'Dates incomplete';
      }
      
      // Calculate the overlap start (latest of the two start dates)
      const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
      
      // Calculate the overlap end (earliest of the two end dates, or null if any is null)
      let overlapEnd = null;
      if (end1 && end2) {
        overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
      }
      
      return `${formatDate(overlapStart)} - ${formatDate(overlapEnd) || 'Unknown'}`;
    };
    
    const calculateOverlapDuration = (overlap) => {
      // Get the latest start date and earliest end date
      const start1 = overlap.start_date1 ? new Date(overlap.start_date1) : null;
      const start2 = overlap.start_date2 ? new Date(overlap.start_date2) : null;
      const end1 = overlap.end_date1 ? new Date(overlap.end_date1) : null;
      const end2 = overlap.end_date2 ? new Date(overlap.end_date2) : null;
      
      // If any date is invalid, return a placeholder
      if (!start1 || !start2) {
        return '';
      }
      
      // Calculate the overlap start (latest of the two start dates)
      const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
      
      // Calculate the overlap end (earliest of the two end dates, or null if any is null)
      let overlapEnd = null;
      if (end1 && end2) {
        overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
        
        // Calculate duration in days
        const durationMs = overlapEnd.getTime() - overlapStart.getTime();
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
        
        if (durationDays < 0) {
          // Error in calculation, dates might be wrong
          return '';
        }
        
        // Express duration more naturally
        if (durationDays === 0) {
          return 'Same day';
        } else if (durationDays === 1) {
          return '1 day';
        } else if (durationDays < 30) {
          return `${durationDays} days`;
        } else if (durationDays < 365) {
          const months = Math.round(durationDays / 30);
          return `~${months} ${months === 1 ? 'month' : 'months'}`;
        } else {
          const years = Math.round(durationDays / 365 * 10) / 10;
          return `~${years} ${years === 1 ? 'year' : 'years'}`;
        }
      }
      
      return '';
    };
    
    // Load crew data when the report is activated
    watch(activeReport, (newValue) => {
      if (newValue === 'crew-overlap') {
        loadAvailableShips();
        loadCrewOverlaps();
      }
    });
    
    // Format date for display
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString();
      } catch (e) {
        return dateStr;
      }
    };

    // Ship Crew Report functionality
    const shipSearch = ref('');
    const shipSearchPerformed = ref(false);
    const shipSearchResults = ref({});
    const isLoadingShipSearch = ref(false);
    const selectedShipId = ref(null);
    const selectedShipDetails = ref({});
    const shipCrew = ref([]);
    const shipCrewTotal = ref(0);
    const shipCrewPage = ref(1);
    const shipCrewLoaded = ref(false);
    const isLoadingShipCrew = ref(false);

    const hasShipCrewNextPage = computed(() => {
      return shipCrewPage.value < Math.ceil(shipCrewTotal.value / ITEMS_PER_PAGE);
    });

    const hasShipCrewPrevPage = computed(() => {
      return shipCrewPage.value > 1;
    });

    const nextShipCrewPage = () => {
      if (hasShipCrewNextPage.value) {
        shipCrewPage.value++;
        loadShipCrew();
      }
    };

    const prevShipCrewPage = () => {
      if (hasShipCrewPrevPage.value) {
        shipCrewPage.value--;
        loadShipCrew();
      }
    };

    const searchShipsForCrew = async () => {
      if (!shipSearch.value.trim()) return;
      isLoadingShipSearch.value = true;
      shipSearchPerformed.value = true;
      try {
        const result = await database.searchShips(shipSearch.value.trim());
        shipSearchResults.value = result || {};
      } catch (error) {
        console.error('Error searching ships:', error);
        shipSearchResults.value = {};
      } finally {
        isLoadingShipSearch.value = false;
      }
    };

    const selectShipForCrew = (ship) => {
      selectedShipId.value = ship.shipID;
      selectedShipDetails.value = ship;
      shipCrewPage.value = 1;
      loadShipCrew();
    };

    const loadShipCrew = async () => {
      if (!selectedShipId.value) return;
      isLoadingShipCrew.value = true;
      try {
        const result = await database.getShipCrew(selectedShipId.value, shipCrewPage.value, ITEMS_PER_PAGE);
        shipCrew.value = result.crew || [];
        shipCrewTotal.value = result.total || 0;
        shipCrewLoaded.value = true;
      } catch (error) {
        console.error('Error loading ship crew:', error);
        shipCrew.value = [];
        shipCrewTotal.value = 0;
        shipCrewLoaded.value = false;
      } finally {
        isLoadingShipCrew.value = false;
      }
    };

    const calculateServiceDuration = (crewMember) => {
      const start = crewMember.start_date ? new Date(crewMember.start_date) : null;
      const end = crewMember.end_date ? new Date(crewMember.end_date) : null;

      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return '';

      const durationMs = end.getTime() - start.getTime();
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

      if (durationDays < 0 || isNaN(durationDays)) return '';

      if (durationDays === 0) {
        return 'Same day';
      } else if (durationDays === 1) {
        return '1 day';
      } else if (durationDays < 30) {
        return `${durationDays} days`;
      } else if (durationDays < 365) {
        const months = Math.round(durationDays / 30);
        return `~${months} ${months === 1 ? 'month' : 'months'}`;
      } else {
        const years = Math.round(durationDays / 365 * 10) / 10;
        if (isNaN(years)) return '';
        return `~${years} ${years === 1 ? 'year' : 'years'}`;
      }
    };

    watch(activeReport, (newValue) => {
      if (newValue === 'ship-crew') {
        shipSearchPerformed.value = false;
        shipSearchResults.value = {};
        selectedShipId.value = null;
        selectedShipDetails.value = {};
        shipCrew.value = [];
        shipCrewTotal.value = 0;
        shipCrewPage.value = 1;
        shipCrewLoaded.value = false;
      }
    });

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
      navigateToMariner,
      getReportTitle,
      generatePreviewChartOption,
      // Additional stats for extended reports
      missingBirthInfo,
      missingDeathInfo,
      marinersWithShips,
      // Age Analysis Report
      birthYearChartOption,
      ageAtDeathChartOption,
      marinersWithBirthYear,
      marinersWithDeathYear,
      marinersWithBothDates,
      averageAgeAtDeath,
      birthYearPercentage,
      deathYearPercentage,
      longestLife,
      shortestLife,
      // Mortality Analysis
      diedAtSeaChartOption,
      causeOfDeathChartOption,
      diedAtSeaCount,
      unknownDeathLocationCount,
      marinersWithCOD,
      // Crew Overlap Report
      isLoadingCrew,
      crewOverlaps,
      crewTotalCount,
      crewShipFilter,
      crewDateFilter,
      availableShips,
      crewCurrentPage,
      crewTotalPages,
      hasCrewNextPage,
      hasCrewPrevPage,
      nextCrewPage,
      prevCrewPage,
      paginatedCrewOverlaps,
      loadCrewOverlaps,
      loadAvailableShips,
      clearCrewFilters,
      calculateOverlapPeriod,
      calculateOverlapDuration,
      formatDate,
      // Ship Crew Report
      shipSearch,
      shipSearchPerformed,
      shipSearchResults,
      isLoadingShipSearch,
      selectedShipId,
      selectedShipDetails,
      shipCrew,
      shipCrewTotal,
      shipCrewPage,
      shipCrewLoaded,
      isLoadingShipCrew,
      hasShipCrewNextPage,
      hasShipCrewPrevPage,
      nextShipCrewPage,
      prevShipCrewPage,
      searchShipsForCrew,
      selectShipForCrew,
      loadShipCrew,
      calculateServiceDuration
    };
  }
}
</script>