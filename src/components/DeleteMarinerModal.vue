<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 class="text-xl font-bold text-red-600 dark:text-red-400">
          Delete Mariner
        </h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="mb-4">
          <div class="flex items-center mb-4 text-red-600 dark:text-red-400">
            <svg class="w-10 h-10 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-xl font-bold">Warning!</span>
          </div>
          
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Are you sure you want to delete <strong>{{ marinerName }}</strong>?
          </p>
          
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            This will permanently remove the mariner and all their ship assignments from the database. This action cannot be undone.
          </p>
          
          <div v-if="shipAssignmentsCount > 0" class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded mb-4 border border-yellow-200 dark:border-yellow-800">
            <p class="text-yellow-800 dark:text-yellow-300">
              This mariner has <strong>{{ shipAssignmentsCount }}</strong> ship assignments that will also be deleted.
            </p>
          </div>
          
          <div v-if="error" class="bg-red-100 dark:bg-red-900/20 p-3 rounded mb-4 border border-red-200 dark:border-red-800">
            <p class="text-red-800 dark:text-red-300">{{ error }}</p>
          </div>
        </div>
        
        <!-- Confirm deletion text input -->
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2 dark:text-white">Type "delete" to confirm</label>
          <input 
            type="text" 
            v-model="confirmText" 
            class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="delete"
          />
        </div>
  
        <!-- Buttons -->
        <div class="flex justify-end gap-3">
          <button 
            @click="closeModal" 
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            @click="confirmDelete" 
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="confirmText !== 'delete' || isDeleting"
          >
            <span v-if="isDeleting">Deleting...</span>
            <span v-else>Delete Permanently</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import database from '../services/database';

export default {
  name: 'DeleteMarinerModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    mariner: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'deleted'],
  setup(props, { emit }) {
    const confirmText = ref('');
    const isDeleting = ref(false);
    const error = ref(null);
    
    const marinerName = computed(() => {
      if (!props.mariner) return '';
      return `${props.mariner.forename} ${props.mariner.surname}`;
    });
    
    const shipAssignmentsCount = computed(() => {
      if (!props.mariner || !props.mariner.shipAssignments) return 0;
      return props.mariner.shipAssignments.length;
    });
    
    function closeModal() {
      confirmText.value = '';
      error.value = null;
      emit('close');
    }
    
    async function confirmDelete() {
      if (confirmText.value !== 'delete') return;
      
      try {
        isDeleting.value = true;
        error.value = null;
        
        await database.deleteMariner(props.mariner.person_id);
        
        emit('deleted');
        closeModal();
      } catch (err) {
        console.error('Error deleting mariner:', err);
        error.value = `Failed to delete mariner: ${err.message || 'Unknown error'}`;
      } finally {
        isDeleting.value = false;
      }
    }
    
    return {
      confirmText,
      isDeleting,
      error,
      marinerName,
      shipAssignmentsCount,
      closeModal,
      confirmDelete
    };
  }
}
</script>