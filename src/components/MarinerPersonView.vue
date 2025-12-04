<template>
  <div class="mariner-person-view p-4">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <button 
          @click="goBack" 
          class="flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none mr-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <h1 class="text-2xl font-bold dark:text-white">{{ marinerName }}</h1>
      </div>
      <button 
        @click="editMariner" 
        class="btn btn-primary dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white"
      >
        Edit Mariner
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-32">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="error" class="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
      {{ error }}
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Personal Information -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">Personal Information</h2>
        <div class="space-y-3">
          <div class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Full Name:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.forename }} {{ mariner.surname }}</span>
          </div>
          <div v-if="mariner.alias1surname || mariner.alias1forename" class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Alias 1:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.alias1forename }} {{ mariner.alias1surname }}</span>
          </div>
          <div v-if="mariner.alias2surname || mariner.alias2forename" class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Alias 2:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.alias2forename }} {{ mariner.alias2surname }}</span>
          </div>
          <div class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Birth Year:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.year_of_birth || 'Unknown' }}</span>
          </div>
          <div class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Birthplace:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.place_of_birth || 'Unknown' }}</span>
          </div>
          <div class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Death Year:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.year_of_death || 'Unknown' }}</span>
          </div>
          <div class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Died at Sea:</span>
            <span class="text-gray-900 dark:text-white">
              <span v-if="mariner.died_at_sea === true">Yes</span>
              <span v-else-if="mariner.died_at_sea === false">No</span>
              <span v-else>Unknown</span>
            </span>
          </div>
          <div v-if="mariner.cod" class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Cause of Death:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.cod }}</span>
          </div>
          <hr />
          <div class="flex items-center">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Bayanne ID:</span>
            <span v-if="!editingBayanneId" class="flex items-center gap-2">
              <span v-if="mariner.bayanne_id" class="text-gray-900 dark:text-white">
                <button
                  @click="openBayanneProfile(mariner.bayanne_id)"
                  class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer bg-transparent border-none p-0"
                >
                  {{ mariner.bayanne_id }}
                </button>
              </span>
              <span v-else class="text-gray-900 dark:text-white mr-2">-</span>
              <button
                v-if="!mariner.bayanne_id"
                @click="startEditingBayanneId"
                class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer"
              >
                Add
              </button>
              <button
                v-else
                @click="startEditingBayanneId"
                class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
              >
                Edit
              </button>
              <button
                v-if="!mariner.bayanne_id"
                @click="openBayanneSearch()"
                class="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 cursor-pointer"
              >
                Search Bayanne
              </button>
            </span>
            <span v-else class="flex items-center gap-2">
              <input
                v-model="bayanneIdInput"
                type="number"
                min="1"
                placeholder="Enter ID"
                class="w-32 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                @click="saveBayanneId"
                class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
              >
                Save
              </button>
              <button
                @click="cancelBayanneIdEdit"
                class="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
            </span>
          </div>
          <div class="flex items-center">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">SFHS ID:</span>
            <span v-if="!editingSfhsId" class="flex items-center gap-2">
              <span class="text-gray-900 dark:text-white">{{ mariner.sfhs_id || '-' }}</span>
              <button
                @click="startEditingSfhsId"
                class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer"
              >
                {{ mariner.sfhs_id ? 'Edit' : 'Add' }}
              </button>
            </span>
            <span v-else class="flex items-center gap-2">
              <input
                v-model="sfhsIdInput"
                type="number"
                min="1"
                placeholder="Enter ID"
                class="w-32 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                @click="saveSfhsId"
                class="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
              >
                Save
              </button>
              <button
                @click="cancelSfhsIdEdit"
                class="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Cancel
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Ship Information -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">Ship Assignments</h2>
        
        <!-- Show from person_ship relationship table -->
        <div v-if="hasShipAssignmentsFromRelation" class="space-y-4">
          <div v-for="assignment in mariner.shipAssignments" :key="assignment.id" class="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
            <div class="font-medium text-gray-800 dark:text-white">{{ assignment.ship_name || 'Unknown Ship' }}</div>
            <div v-if="assignment.designation" class="text-sm text-gray-600 dark:text-gray-400">
              {{ assignment.designation }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <div v-if="assignment.rank">Rank: {{ assignment.rank }}</div>
              <div>From: <span v-if="assignment.start_date">{{ formatDate(assignment.start_date) }}</span><span v-else class="italic">Unknown</span></div>
              <div>To: <span v-if="assignment.end_date">{{ formatDate(assignment.end_date) }}</span><span v-else class="italic">Unknown</span></div>
            </div>
          </div>
        </div>

        <!-- Fallback to old data model if relationships are not available -->
        <div v-else-if="hasShipAssignments" class="space-y-4">
          <div v-if="mariner.ship1" class="border-b border-gray-200 dark:border-gray-700 pb-3">
            <div class="font-medium text-gray-800 dark:text-white">{{ mariner.ship1 }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <div>From: <span v-if="mariner.appdate1">{{ formatDate(mariner.appdate1) }}</span><span v-else class="italic">Unknown</span></div>
              <div>To: <span v-if="mariner.entdate1">{{ formatDate(mariner.entdate1) }}</span><span v-else class="italic">Unknown</span></div>
            </div>
            <div v-if="mariner.where1" class="text-sm text-gray-600 dark:text-gray-400">
              Location: {{ mariner.where1 }}
            </div>
          </div>
          <div v-if="mariner.ship2" class="border-b border-gray-200 dark:border-gray-700 pb-3">
            <div class="font-medium text-gray-800 dark:text-white">{{ mariner.ship2 }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <div>From: <span v-if="mariner.appdate2">{{ formatDate(mariner.appdate2) }}</span><span v-else class="italic">Unknown</span></div>
              <div>To: <span v-if="mariner.entdate2">{{ formatDate(mariner.entdate2) }}</span><span v-else class="italic">Unknown</span></div>
            </div>
            <div v-if="mariner.where2" class="text-sm text-gray-600 dark:text-gray-400">
              Location: {{ mariner.where2 }}
            </div>
          </div>
          <div v-if="mariner.ship3" class="pb-3">
            <div class="font-medium text-gray-800 dark:text-white">{{ mariner.ship3 }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <div>From: <span v-if="mariner.appdate3">{{ formatDate(mariner.appdate3) }}</span><span v-else class="italic">Unknown</span></div>
              <div>To: <span v-if="mariner.entdate3">{{ formatDate(mariner.entdate3) }}</span><span v-else class="italic">Unknown</span></div>
            </div>
            <div v-if="mariner.where3" class="text-sm text-gray-600 dark:text-gray-400">
              Location: {{ mariner.where3 }}
            </div>
          </div>
        </div>
        
        <div v-else class="text-gray-500 dark:text-gray-400 italic">
          No ship assignments found.
        </div>
        
        <div v-if="mariner.shiplist" class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h3 class="font-medium mb-2 dark:text-white">Additional Ship Information</h3>
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ mariner.shiplist }}</p>
        </div>
        
        <!-- Add Ship Assignment Form -->
        <div class="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-medium mb-4 dark:text-white">Add New Ship Assignment</h3>
          
          <div v-if="addShipError" class="mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            {{ addShipError }}
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Ship Selection Method Toggle -->
            <div class="col-span-1 md:col-span-2">
              <div class="flex space-x-4">
                <label class="inline-flex items-center">
                  <input type="radio" v-model="shipSelectionMethod" value="search" class="form-radio text-blue-600">
                  <span class="ml-2 text-gray-700 dark:text-gray-300">Search Existing Ships</span>
                </label>
                <label class="inline-flex items-center">
                  <input type="radio" v-model="shipSelectionMethod" value="manual" class="form-radio text-blue-600">
                  <span class="ml-2 text-gray-700 dark:text-gray-300">Enter Ship Name</span>
                </label>
              </div>
            </div>
            
            <!-- Ship Search -->
            <div v-if="shipSelectionMethod === 'search'" class="col-span-1 md:col-span-2">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Search Ships
              </label>
              <div class="flex space-x-2">
                <input 
                  type="text" 
                  v-model="shipSearch" 
                  @input="searchShips"
                  placeholder="Enter ship name to search..."
                  class="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
                >
                <button 
                  @click="searchShips" 
                  class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Search
                </button>
              </div>
              
              <!-- Search Results -->
              <div v-if="searchResults.ships && searchResults.ships.length > 0" class="mt-2 max-h-60 overflow-y-auto border rounded dark:border-gray-600">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Designation</th>
                      <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Select</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr v-for="ship in searchResults.ships" :key="ship.shipID" class="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td class="px-4 py-2 text-sm text-gray-900 dark:text-white">{{ ship.name || 'Unknown' }}</td>
                      <td class="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{{ ship.designation || '-' }}</td>
                      <td class="px-4 py-2 text-center">
                        <button 
                          @click="selectShip(ship)" 
                          class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else-if="searchPerformed && (!searchResults.ships || searchResults.ships.length === 0)" class="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                No ships found matching your search.
              </div>
            </div>
            
            <!-- Manual Ship Name Entry -->
            <div v-if="shipSelectionMethod === 'manual'" class="col-span-1 md:col-span-2">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Ship Name
              </label>
              <input 
                type="text" 
                v-model="newAssignment.ship_name" 
                placeholder="Enter ship name"
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              >
            </div>
            
            <!-- Selected Ship Info -->
            <div v-if="selectedShip" class="col-span-1 md:col-span-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded mb-4">
              <h4 class="font-medium text-gray-800 dark:text-white">Selected Ship:</h4>
              <div class="text-gray-700 dark:text-gray-300">
                <strong>{{ selectedShip.name || 'Unknown' }}</strong>
                <span v-if="selectedShip.designation"> ({{ selectedShip.designation }})</span>
              </div>
            </div>
            
            <!-- Assignment Details -->
            <div class="col-span-1 md:col-span-2">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Rank
              </label>
              <input 
                type="text" 
                v-model="newAssignment.rank" 
                placeholder="e.g. Captain, Sailor, etc."
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              >
            </div>
            
            <div class="col-span-1">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Start Date
              </label>
              <input 
                type="date" 
                v-model="newAssignment.start_date" 
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              >
            </div>
            
            <div class="col-span-1">
              <label class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                End Date
              </label>
              <input 
                type="date" 
                v-model="newAssignment.end_date" 
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-white dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              >
            </div>
          </div>
          
          <div class="flex justify-end">
            <button 
              @click="saveShipAssignment" 
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline dark:bg-blue-700 dark:hover:bg-blue-600"
              :disabled="addingShip || !canSaveAssignment"
            >
              <span v-if="addingShip">Saving...</span>
              <span v-else>Save Assignment</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-end">
      <button 
        @click="deleteMariner" 
        class="btn bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600 dark:text-white"
      >
        Delete Mariner
      </button>
    </div>

    <!-- Edit Mariner Modal -->
    <EditMarinerModal 
      :show="showEditModal" 
      :mariner="mariner" 
      @close="closeEditModal" 
      @saved="handleMarinerSaved"
    />

    <!-- Delete Mariner Modal -->
    <DeleteMarinerModal
      :show="showDeleteModal"
      :mariner="mariner"
      @close="closeDeleteModal"
      @deleted="handleMarinerDeleted"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import database from '../services/database';
import EditMarinerModal from './EditMarinerModal.vue';
import DeleteMarinerModal from './DeleteMarinerModal.vue';

export default {
  name: 'MarinerPersonView',
  components: {
    EditMarinerModal,
    DeleteMarinerModal
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const mariner = ref({});
    const loading = ref(true);
    const error = ref(null);
    const showEditModal = ref(false);
    const showDeleteModal = ref(false);
    const addShipError = ref(null);
    const addingShip = ref(false);
    const shipSelectionMethod = ref('search');
    
    // Inline editing state for external IDs
    const editingBayanneId = ref(false);
    const editingSfhsId = ref(false);
    const bayanneIdInput = ref(null);
    const sfhsIdInput = ref(null);
    const shipSearch = ref('');
    const searchResults = ref({ ships: [] });
    const searchPerformed = ref(false);
    const selectedShip = ref(null);
    const newAssignment = ref({
      ship_name: '',
      rank: '',
      start_date: '',
      end_date: ''
    });

    const marinerId = computed(() => route.params.id);
    const marinerName = computed(() => {
      if (!mariner.value || !mariner.value.forename) return 'Mariner Details';
      return `${mariner.value.forename} ${mariner.value.surname}`;
    });

    const hasShipAssignments = computed(() => {
      return !!(mariner.value.ship1 || mariner.value.ship2 || mariner.value.ship3);
    });

    const hasShipAssignmentsFromRelation = computed(() => {
      return mariner.value.shipAssignments && mariner.value.shipAssignments.length > 0;
    });

    const hasFinancialInfo = computed(() => {
      return !!(mariner.value.remittence || mariner.value.allotment || 
                mariner.value.effects || mariner.value.grenpen);
    });

    const canSaveAssignment = computed(() => {
      if (shipSelectionMethod.value === 'search') {
        return !!selectedShip.value && newAssignment.value.rank && newAssignment.value.start_date;
      }
      return newAssignment.value.ship_name && newAssignment.value.rank && newAssignment.value.start_date;
    });

    function formatDate(dateStr) {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString();
      } catch (e) {
        return dateStr;
      }
    }

    async function loadMariner() {
      try {
        loading.value = true;
        error.value = null;
        
        const result = await database.getMarinerById(marinerId.value);
        if (!result) {
          error.value = 'Mariner not found';
          return;
        }
        
        mariner.value = result;
      } catch (err) {
        console.error('Error loading mariner:', err);
        error.value = 'Failed to load mariner details: ' + (err.message || 'Unknown error');
      } finally {
        loading.value = false;
      }
    }

    function goBack() {
      router.push({
        name: 'Mariners',
        query: {
          page: route.query.page || '1',
          search: route.query.search || ''
        }
      });
    }

    function editMariner() {
      showEditModal.value = true;
    }

    function closeEditModal() {
      showEditModal.value = false;
    }

    async function handleMarinerSaved(updatedMariner) {
      await loadMariner();
    }

    async function searchShips() {
      try {
        searchPerformed.value = true;
        const results = await database.searchShips(shipSearch.value);
        searchResults.value = results;
      } catch (err) {
        console.error('Error searching ships:', err);
        searchResults.value = { ships: [] };
      }
    }

    function selectShip(ship) {
      selectedShip.value = ship;
      newAssignment.value.ship_name = ship.name;
    }

    async function saveShipAssignment() {
      try {
        addingShip.value = true;
        addShipError.value = null;

        const assignment = {
          ...newAssignment.value,
          ship_id: selectedShip.value ? selectedShip.value.shipID : null
        };

        await database.addShipAssignment(marinerId.value, assignment);
        await loadMariner();
        newAssignment.value = {
          ship_name: '',
          rank: '',
          start_date: '',
          end_date: ''
        };
        selectedShip.value = null;
        shipSelectionMethod.value = 'search';
      } catch (err) {
        console.error('Error saving ship assignment:', err);
        addShipError.value = 'Failed to save ship assignment: ' + (err.message || 'Unknown error');
      } finally {
        addingShip.value = false;
      }
    }

    function getBayanneProfileUrl(bayanneId) {
      return `https://www.bayanne.info/Shetland/getperson.php?personID=I${bayanneId}&tree=ID1`;
    }

    function getBayanneSearchUrl() {
      const params = new URLSearchParams({
        mybool: 'AND',
        nr: '50',
        tree: 'ID1',
        branch: '',
        mylastname: mariner.value.surname || '',
        lnqualify: 'contains',
        myfirstname: mariner.value.forename || '',
        fnqualify: 'contains',
        mybirthyear: mariner.value.year_of_birth || '',
        byqualify: '',
        mydeathyear: mariner.value.year_of_death || '',
        dyqualify: ''
      });
      return `https://www.bayanne.info/Shetland/search.php?${params.toString()}`;
    }

    function openBayanneProfile(bayanneId) {
      const url = getBayanneProfileUrl(bayanneId);
      if (window.electronAPI && window.electronAPI.openExternal) {
        window.electronAPI.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    }

    function openBayanneSearch() {
      const url = getBayanneSearchUrl();
      if (window.electronAPI && window.electronAPI.openExternal) {
        window.electronAPI.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    }

    function startEditingBayanneId() {
      editingBayanneId.value = true;
      bayanneIdInput.value = mariner.value.bayanne_id || '';
    }

    function startEditingSfhsId() {
      editingSfhsId.value = true;
      sfhsIdInput.value = mariner.value.sfhs_id || '';
    }

    async function saveBayanneId() {
      try {
        const value = bayanneIdInput.value ? parseInt(bayanneIdInput.value) : null;
        if (value !== null && (isNaN(value) || value < 1)) {
          alert('Bayanne ID must be a number greater than 0');
          return;
        }
        
        await database.updateMariner(marinerId.value, { bayanne_id: value });
        mariner.value.bayanne_id = value;
        editingBayanneId.value = false;
      } catch (err) {
        console.error('Error saving Bayanne ID:', err);
        alert('Failed to save Bayanne ID: ' + (err.message || 'Unknown error'));
      }
    }

    async function saveSfhsId() {
      try {
        const value = sfhsIdInput.value ? parseInt(sfhsIdInput.value) : null;
        if (value !== null && (isNaN(value) || value < 1)) {
          alert('SFHS ID must be a number greater than 0');
          return;
        }
        
        await database.updateMariner(marinerId.value, { sfhs_id: value });
        mariner.value.sfhs_id = value;
        editingSfhsId.value = false;
      } catch (err) {
        console.error('Error saving SFHS ID:', err);
        alert('Failed to save SFHS ID: ' + (err.message || 'Unknown error'));
      }
    }

    function cancelBayanneIdEdit() {
      editingBayanneId.value = false;
      bayanneIdInput.value = null;
    }

    function cancelSfhsIdEdit() {
      editingSfhsId.value = false;
      sfhsIdInput.value = null;
    }

    function deleteMariner() {
      showDeleteModal.value = true;
    }

    function closeDeleteModal() {
      showDeleteModal.value = false;
    }

    async function handleMarinerDeleted() {
      router.push({ name: 'Mariners' });
    }

    onMounted(loadMariner);

    return {
      mariner,
      loading,
      error,
      marinerName,
      hasShipAssignments,
      hasShipAssignmentsFromRelation,
      hasFinancialInfo,
      formatDate,
      goBack,
      editMariner,
      showEditModal,
      closeEditModal,
      handleMarinerSaved,
      addShipError,
      addingShip,
      shipSelectionMethod,
      shipSearch,
      searchResults,
      searchPerformed,
      selectedShip,
      newAssignment,
      canSaveAssignment,
      searchShips,
      selectShip,
      saveShipAssignment,
      getBayanneProfileUrl,
      getBayanneSearchUrl,
      openBayanneProfile,
      openBayanneSearch,
      editingBayanneId,
      editingSfhsId,
      bayanneIdInput,
      sfhsIdInput,
      startEditingBayanneId,
      startEditingSfhsId,
      saveBayanneId,
      saveSfhsId,
      cancelBayanneIdEdit,
      cancelSfhsIdEdit,
      deleteMariner,
      showDeleteModal,
      closeDeleteModal,
      handleMarinerDeleted
    };
  }
}
</script>