<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold dark:text-white">Edit Ship</h2>
        <button @click="onClose" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="saveChanges">
        <!-- Ship Name -->
        <div class="form-group mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ship Name</label>
          <input
            id="name"
            v-model="editedShip.name"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <!-- Ship Designation -->
        <div class="form-group mb-4">
          <label for="designation" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Designation</label>
          <input
            id="designation"
            v-model="editedShip.designation"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            @click="onClose"
            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md dark:bg-blue-700 dark:hover:bg-blue-600"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import database from '../services/database';

export default {
  name: 'EditShipModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    ship: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const editedShip = ref({});
    const isSaving = ref(false);

    // Update local copy when ship prop changes
    watch(() => props.ship, (newShip) => {
      editedShip.value = { ...newShip };
    }, { immediate: true, deep: true });

    function onClose() {
      emit('close');
    }

    async function saveChanges() {
      try {
        isSaving.value = true;
        const updatedShip = await database.updateShip(editedShip.value);
        emit('saved', updatedShip);
        emit('close');
      } catch (error) {
        console.error('Error updating ship:', error);
        alert('Failed to update ship. Please try again.');
      } finally {
        isSaving.value = false;
      }
    }

    return {
      editedShip,
      isSaving,
      onClose,
      saveChanges
    };
  }
}
</script>
