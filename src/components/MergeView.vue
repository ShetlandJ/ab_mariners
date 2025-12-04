<template>
  <div class="merge-view">
    <h1 class="text-3xl font-bold mb-6 dark:text-white">Merge Sailors</h1>
    
    <!-- Step 1: Select Sailors -->
    <div v-if="step === 1" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">Step 1: Select Two Sailors to Merge</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- Sailor 1 Search -->
        <div>
          <label class="block text-sm font-medium mb-2 dark:text-white">
            Primary Sailor (data will be kept here)
          </label>
          <input
            v-model="sailor1Search"
            @input="searchSailor1"
            placeholder="Search by name..."
            class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2"
          />
          
          <!-- Sailor 1 Results -->
          <div v-if="sailor1Results.length > 0" class="max-h-64 overflow-y-auto border rounded-md dark:border-gray-600">
            <div
              v-for="sailor in sailor1Results"
              :key="sailor.person_id"
              @click="selectSailor1(sailor)"
              class="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0 dark:border-gray-700"
              :class="{ 'bg-blue-50 dark:bg-blue-900': sailor1 && sailor1.person_id === sailor.person_id }"
            >
              <div class="font-medium dark:text-white">{{ sailor.forename }} {{ sailor.surname }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Born: {{ sailor.year_of_birth || '?' }} | 
                Died: {{ sailor.year_of_death || '?' }} |
                Place: {{ sailor.place_of_birth || 'Unknown' }}
              </div>
            </div>
          </div>
          
          <!-- Selected Sailor 1 -->
          <div v-if="sailor1" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-md">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-bold text-lg dark:text-white">{{ sailor1.forename }} {{ sailor1.surname }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  ID: {{ sailor1.person_id }} | Born: {{ sailor1.year_of_birth || '?' }}
                </div>
              </div>
              <button @click="sailor1 = null" class="text-red-500 hover:text-red-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Sailor 2 Search -->
        <div>
          <label class="block text-sm font-medium mb-2 dark:text-white">
            Secondary Sailor (will be merged into primary)
          </label>
          <input
            v-model="sailor2Search"
            @input="searchSailor2"
            placeholder="Search by name..."
            class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-2"
          />
          
          <!-- Sailor 2 Results -->
          <div v-if="sailor2Results.length > 0" class="max-h-64 overflow-y-auto border rounded-md dark:border-gray-600">
            <div
              v-for="sailor in sailor2Results"
              :key="sailor.person_id"
              @click="selectSailor2(sailor)"
              class="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0 dark:border-gray-700"
              :class="{ 'bg-blue-50 dark:bg-blue-900': sailor2 && sailor2.person_id === sailor.person_id }"
            >
              <div class="font-medium dark:text-white">{{ sailor.forename }} {{ sailor.surname }}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Born: {{ sailor.year_of_birth || '?' }} | 
                Died: {{ sailor.year_of_death || '?' }} |
                Place: {{ sailor.place_of_birth || 'Unknown' }}
              </div>
            </div>
          </div>
          
          <!-- Selected Sailor 2 -->
          <div v-if="sailor2" class="mt-4 p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 rounded-md">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-bold text-lg dark:text-white">{{ sailor2.forename }} {{ sailor2.surname }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  ID: {{ sailor2.person_id }} | Born: {{ sailor2.year_of_birth || '?' }}
                </div>
              </div>
              <button @click="sailor2 = null" class="text-red-500 hover:text-red-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button
          @click="proceedToComparison"
          :disabled="!sailor1 || !sailor2 || sailor1.person_id === sailor2.person_id"
          class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Compare & Merge →
        </button>
      </div>
    </div>

    <!-- Step 2: Compare and Merge -->
    <div v-if="step === 2" class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold dark:text-white">Step 2: Review & Select Data to Keep</h2>
        <div class="flex space-x-2">
          <button
            @click="selectAllLeft"
            class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Keep All Left
          </button>
          <button
            @click="selectAllRight"
            class="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Keep All Right
          </button>
          <button
            @click="smartMerge"
            class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            Smart Merge
          </button>
        </div>
      </div>

      <!-- Comparison Table -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700">
              <th class="p-3 text-left border dark:border-gray-600 dark:text-white w-1/3">
                Primary ({{ sailor1.forename }} {{ sailor1.surname }})
              </th>
              <th class="p-3 text-center border dark:border-gray-600 dark:text-white w-1/6">Field</th>
              <th class="p-3 text-right border dark:border-gray-600 dark:text-white w-1/3">
                Secondary ({{ sailor2.forename }} {{ sailor2.surname }})
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="field in mergeableFields" :key="field.key" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="p-3 border dark:border-gray-600">
                <div class="flex items-center justify-between">
                  <input
                    type="radio"
                    :name="field.key"
                    :value="'left'"
                    v-model="fieldSelections[field.key]"
                    class="mr-2"
                  />
                  <span class="flex-1 dark:text-white" :class="{ 'text-gray-400 italic': !sailor1[field.key] }">
                    {{ sailor1[field.key] || '(empty)' }}
                  </span>
                </div>
              </td>
              <td class="p-3 border dark:border-gray-600 text-center">
                <span class="text-sm font-medium dark:text-white">{{ field.label }}</span>
              </td>
              <td class="p-3 border dark:border-gray-600">
                <div class="flex items-center justify-between">
                  <span class="flex-1 text-right dark:text-white" :class="{ 'text-gray-400 italic': !sailor2[field.key] }">
                    {{ sailor2[field.key] || '(empty)' }}
                  </span>
                  <input
                    type="radio"
                    :name="field.key"
                    :value="'right'"
                    v-model="fieldSelections[field.key]"
                    class="ml-2"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Ship Assignments Section -->
      <div class="mt-6 pt-6 border-t dark:border-gray-700">
        <h3 class="text-lg font-semibold mb-4 dark:text-white">Ship Assignments</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border rounded-md p-4 dark:border-gray-600">
            <h4 class="font-medium mb-2 dark:text-white">From Primary Sailor</h4>
            <div v-if="sailor1.shipAssignments && sailor1.shipAssignments.length > 0" class="space-y-2">
              <div v-for="assignment in sailor1.shipAssignments" :key="'s1-' + assignment.id" class="text-sm dark:text-gray-300">
                • {{ assignment.ship_name || 'Unknown Ship' }}
                <span v-if="assignment.start_date || assignment.end_date" class="text-gray-600 dark:text-gray-400">
                  ({{ formatDate(assignment.start_date) }} - {{ formatDate(assignment.end_date) }})
                </span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 italic dark:text-gray-400">No ship assignments</div>
          </div>
          <div class="border rounded-md p-4 dark:border-gray-600">
            <h4 class="font-medium mb-2 dark:text-white">From Secondary Sailor</h4>
            <div v-if="sailor2.shipAssignments && sailor2.shipAssignments.length > 0" class="space-y-2">
              <div v-for="assignment in sailor2.shipAssignments" :key="'s2-' + assignment.id" class="text-sm dark:text-gray-300">
                • {{ assignment.ship_name || 'Unknown Ship' }}
                <span v-if="assignment.start_date || assignment.end_date" class="text-gray-600 dark:text-gray-400">
                  ({{ formatDate(assignment.start_date) }} - {{ formatDate(assignment.end_date) }})
                </span>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500 italic dark:text-gray-400">No ship assignments</div>
          </div>
        </div>
        <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <p class="text-sm dark:text-white">
            ℹ️ All ship assignments from both sailors will be combined and assigned to the primary sailor.
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between mt-6">
        <button
          @click="step = 1"
          class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ← Back
        </button>
        <button
          @click="showPreview = true"
          class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Preview Merge
        </button>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreview" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 class="text-xl font-bold dark:text-white">Preview Merged Sailor</h2>
          <button @click="showPreview = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <div class="space-y-3 mb-6">
            <h3 class="font-semibold dark:text-white border-b pb-2 dark:border-gray-700">Personal Information</h3>
            <div v-for="field in mergeableFields" :key="'preview-' + field.key" class="flex">
              <span class="w-48 font-medium text-gray-600 dark:text-gray-300">{{ field.label }}:</span>
              <span class="text-gray-900 dark:text-white">{{ getMergedValue(field.key) || '(empty)' }}</span>
            </div>
          </div>

          <div class="space-y-3 mb-6">
            <h3 class="font-semibold dark:text-white border-b pb-2 dark:border-gray-700">Ship Assignments</h3>
            <div class="text-sm dark:text-gray-300">
              Total: {{ getTotalShipAssignments() }} assignments
            </div>
          </div>

          <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <p class="text-red-800 dark:text-red-300 font-medium">⚠️ Warning</p>
            <p class="text-red-700 dark:text-red-400 text-sm mt-1">
              Sailor "{{ sailor2.forename }} {{ sailor2.surname }}" (ID: {{ sailor2.person_id }}) will be permanently deleted.
              This action cannot be undone.
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="showPreview = false"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              @click="executeMerge"
              :disabled="merging"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {{ merging ? 'Merging...' : 'Confirm Merge' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="mergeSuccess" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg">
      ✅ Sailors merged successfully!
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import database from '../services/database';

export default {
  name: 'MergeView',
  setup() {
    const router = useRouter();
    const step = ref(1);
    
    // Sailor selection
    const sailor1Search = ref('');
    const sailor2Search = ref('');
    const sailor1Results = ref([]);
    const sailor2Results = ref([]);
    const sailor1 = ref(null);
    const sailor2 = ref(null);
    
    // Merge data
    const fieldSelections = reactive({});
    const showPreview = ref(false);
    const merging = ref(false);
    const mergeSuccess = ref(false);
    
    // Fields that can be merged
    const mergeableFields = [
      { key: 'forename', label: 'Forename' },
      { key: 'surname', label: 'Surname' },
      { key: 'alias1forename', label: 'Alias 1 Forename' },
      { key: 'alias1surname', label: 'Alias 1 Surname' },
      { key: 'alias2forename', label: 'Alias 2 Forename' },
      { key: 'alias2surname', label: 'Alias 2 Surname' },
      { key: 'year_of_birth', label: 'Birth Year' },
      { key: 'place_of_birth', label: 'Birthplace' },
      { key: 'year_of_death', label: 'Death Year' },
      { key: 'died_at_sea', label: 'Died at Sea' },
      { key: 'cod', label: 'Cause of Death' },
      { key: 'bayanne_id', label: 'Bayanne ID' },
      { key: 'sfhs_id', label: 'SFHS ID' },
      { key: 'remittence', label: 'Remittence' },
      { key: 'allotment', label: 'Allotment' },
      { key: 'effects', label: 'Effects' },
      { key: 'grenpen', label: 'Grenpen' },
      { key: 'freetext', label: 'Free Text' },
    ];
    
    // Search for sailor 1
    let sailor1SearchTimeout = null;
    async function searchSailor1() {
      if (sailor1SearchTimeout) clearTimeout(sailor1SearchTimeout);
      
      sailor1SearchTimeout = setTimeout(async () => {
        if (sailor1Search.value.trim().length < 2) {
          sailor1Results.value = [];
          return;
        }
        
        try {
          const result = await database.searchMariners(sailor1Search.value.trim(), 1, 20);
          sailor1Results.value = result.mariners || [];
        } catch (error) {
          console.error('Error searching sailor 1:', error);
        }
      }, 300);
    }
    
    // Search for sailor 2
    let sailor2SearchTimeout = null;
    async function searchSailor2() {
      if (sailor2SearchTimeout) clearTimeout(sailor2SearchTimeout);
      
      sailor2SearchTimeout = setTimeout(async () => {
        if (sailor2Search.value.trim().length < 2) {
          sailor2Results.value = [];
          return;
        }
        
        try {
          const result = await database.searchMariners(sailor2Search.value.trim(), 1, 20);
          sailor2Results.value = result.mariners || [];
        } catch (error) {
          console.error('Error searching sailor 2:', error);
        }
      }, 300);
    }
    
    async function selectSailor1(sailor) {
      // Fetch complete sailor data including ship assignments
      const fullSailor = await database.getMarinerById(sailor.person_id);
      sailor1.value = fullSailor;
      sailor1Results.value = [];
      sailor1Search.value = '';
    }
    
    async function selectSailor2(sailor) {
      // Fetch complete sailor data including ship assignments
      const fullSailor = await database.getMarinerById(sailor.person_id);
      sailor2.value = fullSailor;
      sailor2Results.value = [];
      sailor2Search.value = '';
    }
    
    function proceedToComparison() {
      if (!sailor1.value || !sailor2.value) return;
      
      // Initialize field selections - default to left (primary)
      mergeableFields.forEach(field => {
        fieldSelections[field.key] = 'left';
      });
      
      step.value = 2;
    }
    
    function selectAllLeft() {
      mergeableFields.forEach(field => {
        fieldSelections.value[field.key] = 'left';
      });
    }
    
    function selectAllRight() {
      mergeableFields.forEach(field => {
        fieldSelections.value[field.key] = 'right';
      });
    }
    
    function smartMerge() {
      mergeableFields.forEach(field => {
        const leftValue = sailor1.value[field.key];
        const rightValue = sailor2.value[field.key];
        
        // If left is empty and right has value, use right
        if ((!leftValue || leftValue === '') && rightValue && rightValue !== '') {
          fieldSelections.value[field.key] = 'right';
        } else {
          // Otherwise use left (including when both have values)
          fieldSelections.value[field.key] = 'left';
        }
      });
    }
    
    function getMergedValue(fieldKey) {
      const selection = fieldSelections[fieldKey];
      if (selection === 'left') {
        return sailor1.value[fieldKey];
      } else {
        return sailor2.value[fieldKey];
      }
    }
    
    function getTotalShipAssignments() {
      const s1Count = sailor1.value.shipAssignments ? sailor1.value.shipAssignments.length : 0;
      const s2Count = sailor2.value.shipAssignments ? sailor2.value.shipAssignments.length : 0;
      return s1Count + s2Count;
    }
    
    function formatDate(dateStr) {
      if (!dateStr) return '?';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString();
      } catch (e) {
        return dateStr;
      }
    }
    
    async function executeMerge() {
      try {
        merging.value = true;
        
        // Build merged sailor data
        const mergedData = {};
        mergeableFields.forEach(field => {
          mergedData[field.key] = getMergedValue(field.key);
        });
        
        console.log('Merging sailors:', {
          primaryId: sailor1.value.person_id,
          secondaryId: sailor2.value.person_id,
          mergedData
        });
        
        // Call merge API
        const result = await window.electronAPI.mergeSailors(
          sailor1.value.person_id,
          sailor2.value.person_id,
          mergedData
        );
        
        console.log('Merge result:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Merge failed');
        }
        
        merging.value = false;
        showPreview.value = false;
        mergeSuccess.value = true;
        
        // Redirect after success
        setTimeout(() => {
          router.push(`/mariners/${sailor1.value.person_id}`);
        }, 2000);
        
      } catch (error) {
        console.error('Error merging sailors:', error);
        alert('Failed to merge sailors: ' + error.message);
        merging.value = false;
      }
    }
    
    return {
      step,
      sailor1Search,
      sailor2Search,
      sailor1Results,
      sailor2Results,
      sailor1,
      sailor2,
      searchSailor1,
      searchSailor2,
      selectSailor1,
      selectSailor2,
      proceedToComparison,
      mergeableFields,
      fieldSelections,
      selectAllLeft,
      selectAllRight,
      smartMerge,
      showPreview,
      getMergedValue,
      getTotalShipAssignments,
      formatDate,
      executeMerge,
      merging,
      mergeSuccess
    };
  }
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
