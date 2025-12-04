<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 class="text-xl font-bold dark:text-white">
          {{ isCreating ? 'Create New Mariner' : `Edit Mariner: ${mariner.surname}, ${mariner.forename}` }}
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form content -->
      <div class="p-4">
        <form @submit.prevent="saveChanges">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Personal Information -->
            <div class="col-span-2">
              <h3 class="font-semibold text-lg mb-2 border-b pb-1 dark:border-gray-700 dark:text-white">Personal Information</h3>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Surname</label>
              <input type="text" v-model="form.surname" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Forename</label>
              <input type="text" v-model="form.forename" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Alias 1 Surname</label>
              <input type="text" v-model="form.alias1surname" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Alias 1 Forename</label>
              <input type="text" v-model="form.alias1forename" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Alias 2 Surname</label>
              <input type="text" v-model="form.alias2surname" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Alias 2 Forename</label>
              <input type="text" v-model="form.alias2forename" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Year of Birth</label>
              <input type="number" v-model="form.year_of_birth" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Year of Death</label>
              <input type="number" v-model="form.year_of_death" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Died at Sea</label>
              <select v-model="form.died_at_sea" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option :value="null">Unknown</option>
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Place of Birth</label>
              <input type="text" v-model="form.place_of_birth" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Remittence</label>
              <input type="text" v-model="form.remittence" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <!-- External IDs Section -->
            <div class="col-span-2">
              <h3 class="font-semibold text-lg mb-2 mt-4 border-b pb-1 dark:border-gray-700 dark:text-white">External IDs</h3>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">
                Bayanne ID
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(must be ≥ 1 or empty)</span>
              </label>
              <input 
                type="number" 
                v-model.number="form.bayanne_id" 
                min="1"
                step="1"
                class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :class="{ 'border-red-500': validationErrors.bayanne_id }"
                @input="validateExternalId('bayanne_id', $event)"
              />
              <p v-if="validationErrors.bayanne_id" class="text-red-500 text-xs mt-1">
                {{ validationErrors.bayanne_id }}
              </p>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">
                SFHS ID
                <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(Shetland Family History Society)</span>
              </label>
              <input 
                type="number" 
                v-model.number="form.sfhs_id" 
                min="1"
                step="1"
                class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :class="{ 'border-red-500': validationErrors.sfhs_id }"
                @input="validateExternalId('sfhs_id', $event)"
              />
              <p v-if="validationErrors.sfhs_id" class="text-red-500 text-xs mt-1">
                {{ validationErrors.sfhs_id }}
              </p>
            </div>

            <!-- Financial Information -->
            <div class="col-span-2">
              <h3 class="font-semibold text-lg mb-2 mt-4 border-b pb-1 dark:border-gray-700 dark:text-white">Financial & Other Information</h3>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Allotment</label>
              <input type="text" v-model="form.allotment" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Effects</label>
              <input type="text" v-model="form.effects" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Grenpen</label>
              <input type="text" v-model="form.grenpen" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="col-span-2 mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Free Text</label>
              <textarea v-model="form.freetext" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3"></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Cause of Death (COD)</label>
              <input type="text" v-model="form.cod" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <!-- Ship Assignments -->
            <div class="col-span-2">
              <h3 class="font-semibold text-lg mb-2 mt-4 border-b pb-1 dark:border-gray-700 dark:text-white">Ship Assignments</h3>
            </div>

            <!-- Debug Info -->
            <div v-if="!isCreating" class="col-span-2 mb-4">
              <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2 text-sm">
                <strong>Debug Info:</strong><br>
                Person ID: {{ mariner.person_id }}<br>
                Ship Assignments Array Length: {{ shipAssignments.length }}<br>
                Has shipAssignments in mariner: {{ mariner.shipAssignments ? 'Yes' : 'No' }}<br>
                shipAssignments in mariner length: {{ mariner.shipAssignments ? mariner.shipAssignments.length : 'N/A' }}<br>
                <button @click="testDebugQuery" class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                  Test Debug Query
                </button>
              </div>
            </div>

            <!-- Existing Ship Assignments -->
            <div v-if="!isCreating" class="col-span-2 mb-4">
              <h4 class="font-medium mb-2 dark:text-white">Current Assignments:</h4>
              <div v-if="shipAssignments.length === 0" class="text-gray-500 dark:text-gray-400 italic">
                No ship assignments found for this mariner.
              </div>
              <div v-else class="space-y-2 max-h-40 overflow-y-auto">
                <div 
                  v-for="assignment in shipAssignments" 
                  :key="assignment.id" 
                  class="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md"
                  :class="{ 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20': editingAssignmentId === assignment.id }"
                >
                  <div class="flex-1">
                    <div class="font-medium dark:text-white">{{ assignment.ship_name || 'Unknown Ship' }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                      {{ assignment.rank || 'No rank' }} • 
                      {{ formatDate(assignment.start_date) || 'Unknown start' }} - 
                      {{ formatDate(assignment.end_date) || 'Unknown end' }}
                    </div>
                  </div>
                  <div class="flex items-center space-x-1 ml-2">
                    <button 
                      v-if="editingAssignmentId !== assignment.id"
                      @click="editShipAssignment(assignment)"
                      class="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit assignment"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      @click="removeShipAssignment(assignment.id)"
                      class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Remove assignment"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Add New Ship Assignment -->
            <div class="col-span-2">
              <h4 class="font-medium mb-2 dark:text-white">
                {{ isEditingMode ? 'Edit Assignment:' : 'Add New Assignment:' }}
              </h4>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-md space-y-4">
                <!-- Edit Mode Alert -->
                <div v-if="isEditingMode" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-blue-800 dark:text-blue-300">Editing existing assignment</span>
                    <button @click="cancelEdit" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm">
                      Cancel Edit
                    </button>
                  </div>
                </div>
                <!-- Ship Selection -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium dark:text-white">Ship</label>
                  <div class="flex space-x-2">
                    <input 
                      v-model="shipSearchTerm"
                      @input="searchShips"
                      placeholder="Search for ship or enter new ship name..."
                      class="flex-1 p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                    />
                  </div>
                  
                  <!-- Ship Search Results -->
                  <div v-if="shipSearchResults.length > 0" class="max-h-32 overflow-y-auto border rounded-md bg-white dark:bg-gray-600">
                    <div 
                      v-for="ship in shipSearchResults" 
                      :key="ship.shipID"
                      @click="selectShip(ship)"
                      class="p-2 hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer border-b last:border-b-0"
                    >
                      <div class="font-medium dark:text-white">{{ ship.name }}</div>
                      <div v-if="ship.designation" class="text-sm text-gray-600 dark:text-gray-300">{{ ship.designation }}</div>
                    </div>
                  </div>

                  <!-- Selected Ship Display -->
                  <div v-if="selectedShip" class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="font-medium text-blue-800 dark:text-blue-300">{{ selectedShip.name }}</span>
                        <span v-if="selectedShip.designation" class="text-sm text-blue-600 dark:text-blue-400 ml-2">{{ selectedShip.designation }}</span>
                      </div>
                      <button @click="clearSelectedShip" class="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Assignment Details Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-sm font-medium dark:text-white mb-1">Rank</label>
                    <input 
                      v-model="newAssignment.rank"
                      placeholder="e.g., Captain, Lieutenant..."
                      class="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium dark:text-white mb-1">Start Date</label>
                    <input 
                      type="date"
                      v-model="newAssignment.start_date"
                      class="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium dark:text-white mb-1">End Date</label>
                    <input 
                      type="date"
                      v-model="newAssignment.end_date"
                      class="w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <!-- Add Assignment Button -->
                <div class="flex justify-end space-x-2">
                  <button 
                    v-if="isEditingMode"
                    @click="cancelEdit"
                    class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    @click="addShipAssignment"
                    :disabled="!canAddAssignment"
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {{ isEditingMode ? 'Update Assignment' : 'Add Assignment' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Ship List -->
            <div class="col-span-2 mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Ship List</label>
              <textarea v-model="form.shiplist" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows="3"></textarea>
            </div>
          </div>

          <!-- Form actions -->
          <div class="flex justify-end mt-6 gap-2">
            <button 
              type="button" 
              @click="closeModal" 
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="hasValidationErrors"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCreating ? 'Create Mariner' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watchEffect, computed } from 'vue';
import database from '../services/database';

export default {
  name: 'EditMarinerModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    mariner: {
      type: Object,
      required: true
    },
    isCreating: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const form = reactive({
      surname: '',
      forename: '',
      alias1surname: '',
      alias1forename: '',
      alias2surname: '',
      alias2forename: '',
      year_of_birth: null,
      year_of_death: null,
      died_at_sea: null,
      place_of_birth: '',
      remittence: '',
      allotment: '',
      effects: '',
      grenpen: '',
      freetext: '',
      cod: '',
      shiplist: '',
      bayanne_id: null,
      sfhs_id: null
    });
    
    const validationErrors = reactive({
      bayanne_id: '',
      sfhs_id: ''
    });
    
    // Ship assignment functionality
    const shipAssignments = ref([]);
    const shipSearchTerm = ref('');
    const shipSearchResults = ref([]);
    const selectedShip = ref(null);
    const editingAssignmentId = ref(null);
    const newAssignment = reactive({
      rank: '',
      start_date: '1800-01-01',
      end_date: ''
    });
    
    // Initialize form data when mariner changes
    watchEffect(() => {
      if (props.mariner) {
        Object.keys(form).forEach(key => {
          form[key] = props.mariner[key] !== undefined ? props.mariner[key] : '';
        });
        
        // Clear validation errors when modal opens
        validationErrors.bayanne_id = '';
        validationErrors.sfhs_id = '';
        
        // Load ship assignments for existing mariners
        if (!props.isCreating) {          
          if (props.mariner.shipAssignments) {
            shipAssignments.value = [...props.mariner.shipAssignments];
          } else {
            shipAssignments.value = [];
          }
        } else {
          shipAssignments.value = [];
        }
      }
    });

    // Ship search functionality
    let searchTimeout = null;
    const searchShips = async () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      
      searchTimeout = setTimeout(async () => {
        if (!shipSearchTerm.value.trim()) {
          shipSearchResults.value = [];
          return;
        }
        
        try {
          const result = await database.searchShips(shipSearchTerm.value.trim());
          shipSearchResults.value = result.ships || [];
        } catch (error) {
          console.error('Error searching ships:', error);
          shipSearchResults.value = [];
        }
      }, 300);
    };

    const selectShip = (ship) => {
      selectedShip.value = ship;
      shipSearchTerm.value = ship.name;
      shipSearchResults.value = [];
    };

    const clearSelectedShip = () => {
      selectedShip.value = null;
      shipSearchTerm.value = '';
      shipSearchResults.value = [];
    };

    const canAddAssignment = computed(() => {
      return (selectedShip.value || shipSearchTerm.value.trim()) && 
             newAssignment.rank.trim() && 
             newAssignment.start_date;
    });

    const isEditingMode = computed(() => editingAssignmentId.value !== null);

    const addShipAssignment = async () => {
      if (!canAddAssignment.value) return;
      
      try {
        const assignment = {
          ship_name: selectedShip.value ? selectedShip.value.name : shipSearchTerm.value.trim(),
          ship_id: selectedShip.value ? selectedShip.value.shipID : null,
          rank: newAssignment.rank.trim(),
          start_date: newAssignment.start_date,
          end_date: newAssignment.end_date || null
        };

        if (isEditingMode.value) {
          // Update existing assignment
          await database.updateShipAssignment(editingAssignmentId.value, {
            ship_id: assignment.ship_id,
            rank: assignment.rank,
            start_date: assignment.start_date,
            end_date: assignment.end_date
          });
          
          // Update local assignment data
          const assignmentIndex = shipAssignments.value.findIndex(a => a.id === editingAssignmentId.value);
          if (assignmentIndex !== -1) {
            shipAssignments.value[assignmentIndex] = {
              ...shipAssignments.value[assignmentIndex],
              ...assignment
            };
          }
          
          // Clear editing mode
          editingAssignmentId.value = null;
        } else if (!props.isCreating) {
          // Add new assignment for existing mariner
          await database.addShipAssignment(props.mariner.person_id, assignment);
          // Reload mariner data to get the updated assignments
          const updatedMariner = await database.getMarinerById(props.mariner.person_id);
          shipAssignments.value = updatedMariner.shipAssignments || [];
        } else {
          // For new mariners, just add to local array (will be saved when mariner is created)
          shipAssignments.value.push({
            id: Date.now(), // temporary ID
            ...assignment,
            ship_name: assignment.ship_name
          });
        }

        // Reset form
        resetAssignmentForm();
      } catch (error) {
        console.error('Error saving ship assignment:', error);
        // You might want to show an error message to the user
      }
    };

    const editShipAssignment = (assignment) => {
      // Set editing mode
      editingAssignmentId.value = assignment.id;
      
      // Populate form with assignment data
      newAssignment.rank = assignment.rank || '';
      newAssignment.start_date = assignment.start_date || '1800-01-01';
      newAssignment.end_date = assignment.end_date || '';
      
      // Set ship information
      if (assignment.ship_name) {
        shipSearchTerm.value = assignment.ship_name;
        if (assignment.ship_id) {
          selectedShip.value = {
            shipID: assignment.ship_id,
            name: assignment.ship_name
          };
        }
      }
    };

    const cancelEdit = () => {
      editingAssignmentId.value = null;
      resetAssignmentForm();
    };

    const resetAssignmentForm = () => {
      newAssignment.rank = '';
      newAssignment.start_date = '1800-01-01';
      newAssignment.end_date = '';
      clearSelectedShip();
    };

    const removeShipAssignment = async (assignmentId) => {
      try {
        if (!props.isCreating) {
          // For existing mariners, remove from database
          await database.deleteShipAssignment(assignmentId);
          // Remove from local array
          shipAssignments.value = shipAssignments.value.filter(a => a.id !== assignmentId);
        } else {
          // For new mariners, just remove from local array
          shipAssignments.value = shipAssignments.value.filter(a => a.id !== assignmentId);
        }
        
        // If we were editing this assignment, cancel edit mode
        if (editingAssignmentId.value === assignmentId) {
          cancelEdit();
        }
      } catch (error) {
        console.error('Error removing ship assignment:', error);
      }
    };

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

    const testDebugQuery = async () => {
      try {
        const result = await database.debugGetShipAssignments(props.mariner.person_id);
        alert(`Debug query returned ${result.length} assignments.`);
      } catch (error) {
        console.error('Debug query error:', error);
        alert('Debug query failed.');
      }
    };

    // Validation function for external IDs
    const validateExternalId = (fieldName, event) => {
      const value = event.target.value;
      
      if (value === '' || value === null) {
        validationErrors[fieldName] = '';
        form[fieldName] = null;
        return;
      }
      
      const numValue = parseInt(value, 10);
      
      if (isNaN(numValue) || numValue < 1) {
        validationErrors[fieldName] = 'Must be a number greater than or equal to 1';
        return;
      }
      
      validationErrors[fieldName] = '';
      form[fieldName] = numValue;
    };

    // Computed property to check if there are validation errors
    const hasValidationErrors = computed(() => {
      return !!(validationErrors.bayanne_id || validationErrors.sfhs_id);
    });

    // Close the modal
    function closeModal() {
      // Clear validation errors when closing
      validationErrors.bayanne_id = '';
      validationErrors.sfhs_id = '';
      emit('close');
    }

    // Save the mariner changes
    async function saveChanges() {
      // Validate before saving
      if (hasValidationErrors.value) {
        alert('Please fix validation errors before saving');
        return;
      }
      
      try {
        // Copy form values to a new object
        const updatedMariner = { ...form };
        
        // Ensure external IDs are null if empty
        if (updatedMariner.bayanne_id === '' || updatedMariner.bayanne_id === 0) {
          updatedMariner.bayanne_id = null;
        }
        if (updatedMariner.sfhs_id === '' || updatedMariner.sfhs_id === 0) {
          updatedMariner.sfhs_id = null;
        }
        
        if (props.isCreating) {
          // Create new mariner
          const newMariner = await database.createMariner(updatedMariner);
          
          // Emit saved event with the new mariner
          emit('saved', newMariner);
        } else {
          // Add the person_id (which doesn't change) for updates
          updatedMariner.person_id = props.mariner.person_id;
          
          // Update the mariner in the database
          await database.updateMariner(updatedMariner);
          
          // Emit saved event
          emit('saved', updatedMariner);
        }
        
        // Close the modal
        closeModal();
      } catch (error) {
        console.error(`Failed to ${props.isCreating ? 'create' : 'update'} mariner:`, error);
        // You could add error handling here, like displaying an error message
      }
    }

    return {
      form,
      validationErrors,
      hasValidationErrors,
      validateExternalId,
      shipAssignments,
      shipSearchTerm,
      shipSearchResults,
      selectedShip,
      newAssignment,
      canAddAssignment,
      isEditingMode,
      editingAssignmentId,
      closeModal,
      saveChanges,
      searchShips,
      selectShip,
      clearSelectedShip,
      addShipAssignment,
      editShipAssignment,
      cancelEdit,
      removeShipAssignment,
      formatDate,
      testDebugQuery
    };
  }
}
</script>
