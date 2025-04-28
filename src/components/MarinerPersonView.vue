<template>
  <div class="mariner-person-view p-4">
    <div class="flex items-center mb-6">
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
          <div class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Birthplace:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.place_of_birth || 'Unknown' }}</span>
          </div>
          <div v-if="mariner.cod" class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Cause of Death:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.cod }}</span>
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
      </div>

      <!-- Financial Information -->
      <div v-if="hasFinancialInfo" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">Financial Information</h2>
        <div class="space-y-3">
          <div v-if="mariner.remittence" class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Remittance:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.remittence }}</span>
          </div>
          <div v-if="mariner.allotment" class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Allotment:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.allotment }}</span>
          </div>
          <div v-if="mariner.effects" class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Effects:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.effects }}</span>
          </div>
          <div v-if="mariner.grenpen" class="flex">
            <span class="w-32 font-medium text-gray-600 dark:text-gray-300">Grenpen:</span>
            <span class="text-gray-900 dark:text-white">{{ mariner.grenpen }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="mariner.freetext" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 dark:text-white">Notes</h2>
        <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ mariner.freetext }}</p>
      </div>
    </div>

    <div class="mt-6 flex justify-end">
      <button 
        @click="editMariner" 
        class="btn btn-primary dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white"
      >
        Edit Mariner
      </button>
    </div>

    <!-- Edit Mariner Modal -->
    <EditMarinerModal 
      :show="showEditModal" 
      :mariner="mariner" 
      @close="closeEditModal" 
      @saved="handleMarinerSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import database from '../services/database';
import EditMarinerModal from './EditMarinerModal.vue';

export default {
  name: 'MarinerPersonView',
  components: {
    EditMarinerModal
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const mariner = ref({});
    const loading = ref(true);
    const error = ref(null);
    const showEditModal = ref(false);

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

    function formatDate(dateStr) {
      if (!dateStr) return '';
      try {
        // Try to parse the date and format it nicely
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr; // If invalid, return as is
        return date.toLocaleDateString();
      } catch (e) {
        return dateStr; // If error, return as is
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
      // Navigate back to mariners list with the preserved query parameters
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
      // Reload the mariner data after an update
      await loadMariner();
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
      handleMarinerSaved
    };
  }
}
</script>