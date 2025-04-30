<template>
  <div class="reports-view">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Reports</h1>
    </div>

    <div class="bg-blue-100 dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">Birthplace Distribution</h2>
      
      <div v-if="isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Pie Chart -->
        <div class="h-80 relative">
          <!-- Force chart recreation when dark mode changes by using a key -->
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
    </div>

    <div class="bg-blue-100 dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">Dataset Overview</h2>
      
      <!-- Map of Shetland -->
      <div class="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h3 class="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4">Shetland Map</h3>
        <div id="shetland-map" class="h-96 w-full rounded-lg shadow-inner"></div>
      </div>
      
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
</template>

<script>
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import database from '../services/database';
import { getStandardizedPlace, birthplaces, shetlandPlaceBuckets, getRegionForPlace } from '../data/birthplaces';
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
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    
    // Map related variables
    const shetlandMap = ref(null);
    const mapInitialized = ref(false);
    
    // Function to initialize the Leaflet map and load GeoJSON data
    const initializeMap = async () => {
      if (mapInitialized.value) return;
      
      // Make sure mariners data is loaded before initializing the map
      if (mariners.value.length === 0) {
        console.log('Waiting for mariners data to load before initializing map');
        await loadMarinersData();
      }
      
      // Give Vue time to render the map container
      await nextTick();
      
      // Make sure container exists
      const mapContainer = document.getElementById('shetland-map');
      if (!mapContainer) return;
      
      // Initialize map centered on Shetland Islands
      shetlandMap.value = L.map('shetland-map').setView([60.3, -1.3], 8);
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(shetlandMap.value);
      
      try {
        // Count mariners by regional bucket for the choropleth data
        const regionCounts = {};
        const birthplaceCounts = {};
        
        // Initialize counts for all regions
        Object.keys(shetlandPlaceBuckets).forEach(region => {
          regionCounts[region] = 0;
        });
        
        // Debug: Log standardized places
        const standardizedPlaces = new Set();
        
        console.log(`Processing ${mariners.value.length} mariners for the map`);
        
        // Count mariners by specific birthplace
        mariners.value.forEach(mariner => {
          if (mariner.place_of_birth) {
            const standardizedPlace = getStandardizedPlace(mariner.place_of_birth);
            
            if (standardizedPlace && standardizedPlace.group === 'shetland') {
              const placeValue = standardizedPlace.value;
              standardizedPlaces.add(placeValue);
              birthplaceCounts[placeValue] = (birthplaceCounts[placeValue] || 0) + 1;
              
              // Check which region this place belongs to
              for (const [region, places] of Object.entries(shetlandPlaceBuckets)) {
                if (places.includes(placeValue)) {
                  regionCounts[region] += 1;
                  console.log(`Added ${placeValue} to region ${region}, count now: ${regionCounts[region]}`);
                  break; // Place can only belong to one region
                }
              }
            }
          }
        });
        
        console.log('Region counts:', regionCounts);
        console.log('Standardized places found in data:', Array.from(standardizedPlaces));
        console.log('All available place buckets:', shetlandPlaceBuckets);
        console.log('Birthplace counts:', birthplaceCounts);
        
        // Find the maximum count for scaling the colors
        const maxCount = Math.max(...Object.values(regionCounts), 1); // Avoid division by zero
        
        // Fetch the GeoJSON data
        const response = await fetch('../../data/shetland.json');
        const geojsonData = await response.json();
        
        console.log('GeoJSON data loaded:', geojsonData.type, 'with', 
          geojsonData.features ? geojsonData.features.length : 0, 'features');
        
        // Function to get color based on mariner count
        const getColor = (count) => {
          const intensity = count / maxCount;
          
          // Choose colors that work well in both light and dark mode
          if (intensity === 0) return '#e5e7eb'; // gray-200
          if (intensity < 0.2) return '#dbeafe'; // blue-100
          if (intensity < 0.4) return '#bfdbfe'; // blue-200
          if (intensity < 0.6) return '#93c5fd'; // blue-300
          if (intensity < 0.8) return '#60a5fa'; // blue-400
          return '#3b82f6'; // blue-500
        };
        
        // Add the GeoJSON to the map with choropleth styling
        const geoJsonLayer = L.geoJSON(geojsonData, {
          style: function(feature) {
            // Get the region name from the feature properties
            const rawRegionName = feature.properties.NAME_4 || feature.properties.NAME_3;
            
            if (!rawRegionName) {
              return {
                fillColor: '#e5e7eb', // Default gray for unknown regions
                weight: 2,
                opacity: 0.8,
                color: '#3182ce',
                dashArray: '3',
                fillOpacity: 0.6
              };
            }
            
            // Try to match the region name case-insensitively
            const regionName = Object.keys(shetlandPlaceBuckets).find(
              bucket => bucket.toLowerCase() === rawRegionName.toLowerCase() ||
                        bucket.replace(/([A-Z])/g, ' $1').trim().toLowerCase() === rawRegionName.toLowerCase() ||
                        rawRegionName.replace(/\s+/g, '').toLowerCase() === bucket.toLowerCase()
            ) || rawRegionName;
            
            console.log(`Matching: GeoJSON="${rawRegionName}" -> placeBucket="${regionName}"`);
            
            // Get the count for this region
            const count = regionCounts[regionName] || 0;
            
            return {
              fillColor: getColor(count),
              weight: 2,
              opacity: 0.8,
              color: '#3182ce', // blue-600
              dashArray: count > 0 ? '0' : '3',
              fillOpacity: 0.6
            };
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const rawRegionName = feature.properties.NAME_4 || feature.properties.NAME_3;
              if (rawRegionName) {
                // Try to match the region name case-insensitively
                const regionName = Object.keys(shetlandPlaceBuckets).find(
                  bucket => bucket.toLowerCase() === rawRegionName.toLowerCase() ||
                            bucket.replace(/([A-Z])/g, ' $1').trim().toLowerCase() === rawRegionName.toLowerCase() ||
                            rawRegionName.replace(/\s+/g, '').toLowerCase() === bucket.toLowerCase()
                ) || rawRegionName;
                
                const count = regionCounts[regionName] || 0;
                
                // Create a list of places in this region
                let placesList = '';
                if (shetlandPlaceBuckets[regionName]) {
                  const places = shetlandPlaceBuckets[regionName];
                  const placesWithCounts = places.map(place => {
                    const localCount = birthplaceCounts[place] || 0;
                    const placeName = birthplaces.shetland.find(p => p.value === place)?.label || place;
                    return `${placeName}: ${localCount}`;
                  });
                  
                  // Only show places with mariners
                  const filteredPlaces = placesWithCounts.filter(p => !p.endsWith(': 0'));
                  if (filteredPlaces.length > 0) {
                    placesList = '<br><strong>Places:</strong><br>• ' + 
                      filteredPlaces.join('<br>• ');
                  }
                }
                
                // Create the popup content
                const popupContent = `
                  <div>
                    <strong>${regionName}</strong><br>
                    Total mariners: <strong>${count}</strong>
                    ${placesList}
                  </div>
                `;
                
                layer.bindPopup(popupContent);
              }
            }
          }
        }).addTo(shetlandMap.value);
        
        // Add a legend to the map
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = function(map) {
          const div = L.DomUtil.create('div', 'info legend');
          const grades = [0, Math.ceil(maxCount * 0.2), Math.ceil(maxCount * 0.4), 
                         Math.ceil(maxCount * 0.6), Math.ceil(maxCount * 0.8)];
          
          // Add a title to the legend
          div.innerHTML = '<h4 style="margin:0 0 5px 0;font-weight:bold;">Mariners Born</h4>';
          
          // Create legend items
          for (let i = 0; i < grades.length; i++) {
            const from = grades[i];
            const to = grades[i + 1] || maxCount + 1;
            
            div.innerHTML +=
              '<i style="background:' + getColor(from + 1) + '; width:18px; height:18px; float:left; margin-right:8px; opacity:0.7;"></i> ' +
              from + (to ? '&ndash;' + (to - 1) : '+') + '<br>';
          }
          
          // Add some styling
          div.style.background = 'white';
          div.style.padding = '6px 8px';
          div.style.borderRadius = '5px';
          div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
          div.style.lineHeight = '18px';
          div.style.color = '#555';
          
          return div;
        };
        
        legend.addTo(shetlandMap.value);
        
        // Fit the map bounds to the GeoJSON layer
        if (geoJsonLayer.getBounds) {
          shetlandMap.value.fitBounds(geoJsonLayer.getBounds());
        } else {
          // Fall back to a fixed view of Shetland if bounds can't be determined
          shetlandMap.value.setView([60.3, -1.3], 8);
        }
        
        mapInitialized.value = true;
        console.log('Shetland choropleth map initialized with GeoJSON data');
      } catch (error) {
        console.error('Error loading Shetland GeoJSON data:', error);
        // Fall back to a fixed view if there's an error
        shetlandMap.value.setView([60.3, -1.3], 8);
      }
    };
    
    // Cleanup function to destroy the map when component is unmounted
    const destroyMap = () => {
      if (shetlandMap.value) {
        shetlandMap.value.remove();
        shetlandMap.value = null;
        mapInitialized.value = false;
        console.log('Shetland map destroyed');
      }
    };
    
    // Track dark mode state through direct DOM observation
    const isDarkModeActive = ref(document.documentElement.classList.contains('dark'));
    
    // Create a MutationObserver to watch for dark mode class changes
    onMounted(() => {
      loadMarinersData();
      initializeMap();
      
      // Set up the observer to watch the html element for class changes
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'class') {
            const isDark = document.documentElement.classList.contains('dark');
            console.log('DOM dark mode class changed:', isDark);
            
            if (isDark !== isDarkModeActive.value) {
              isDarkModeActive.value = isDark;
              
              // Update chart with new theme
              generateChartData();
              
              // Force chart recreation
              chartRenderKey.value++;
              console.log('Chart render key updated to:', chartRenderKey.value);
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
    
    // Clean up on component unmount
    onUnmounted(() => {
      destroyMap();
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
      returnToMainChart
    };
  }
}
</script>