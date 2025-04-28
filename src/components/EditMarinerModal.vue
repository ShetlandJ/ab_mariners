<template>
  <div v-if="show" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 class="text-xl font-bold dark:text-white">Edit Mariner: {{ mariner.surname }}, {{ mariner.forename }}</h2>
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

            <!-- Ship Information 1 -->
            <div class="col-span-2">
              <h3 class="font-semibold text-lg mb-2 mt-4 border-b pb-1 dark:border-gray-700 dark:text-white">Ship Assignment 1</h3>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Application Date</label>
              <input type="date" v-model="form.appdate1" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Entry Date</label>
              <input type="date" v-model="form.entdate1" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Ship Name</label>
              <input type="text" v-model="form.ship1" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Where</label>
              <input type="text" v-model="form.where1" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Prest 1</label>
              <input type="text" v-model="form.prest1" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <!-- Ship Information 2 -->
            <div class="col-span-2">
              <h3 class="font-semibold text-lg mb-2 mt-4 border-b pb-1 dark:border-gray-700 dark:text-white">Ship Assignment 2</h3>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Application Date</label>
              <input type="date" v-model="form.appdate2" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Entry Date</label>
              <input type="date" v-model="form.entdate2" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Ship Name</label>
              <input type="text" v-model="form.ship2" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Where</label>
              <input type="text" v-model="form.where2" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Prest 2</label>
              <input type="text" v-model="form.prest2" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <!-- Ship Information 3 -->
            <div class="col-span-2">
              <h3 class="font-semibold text-lg mb-2 mt-4 border-b pb-1 dark:border-gray-700 dark:text-white">Ship Assignment 3</h3>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Application Date</label>
              <input type="date" v-model="form.appdate3" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Entry Date</label>
              <input type="date" v-model="form.entdate3" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Ship Name</label>
              <input type="text" v-model="form.ship3" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Where</label>
              <input type="text" v-model="form.where3" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1 dark:text-white">Prest 3</label>
              <input type="text" v-model="form.prest3" class="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
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
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watchEffect } from 'vue';
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
      appdate1: '',
      entdate1: '',
      ship1: '',
      where1: '',
      prest1: '',
      appdate2: '',
      entdate2: '',
      ship2: '',
      where2: '',
      prest2: '',
      appdate3: '',
      entdate3: '',
      ship3: '',
      where3: '',
      prest3: '',
      shiplist: ''
    });
    
    // Initialize form data when mariner changes
    watchEffect(() => {
      if (props.mariner) {
        Object.keys(form).forEach(key => {
          form[key] = props.mariner[key] !== undefined ? props.mariner[key] : '';
        });
      }
    });

    // Close the modal
    function closeModal() {
      emit('close');
    }

    // Save the mariner changes
    async function saveChanges() {
      try {
        // Copy form values to a new object
        const updatedMariner = { ...form };
        
        // Add the person_id (which doesn't change)
        updatedMariner.person_id = props.mariner.person_id;
        
        // Update the mariner in the database
        await database.updateMariner(updatedMariner);
        
        // Emit saved event
        emit('saved', updatedMariner);
        
        // Close the modal
        closeModal();
      } catch (error) {
        console.error('Failed to update mariner:', error);
        // You could add error handling here, like displaying an error message
      }
    }

    return {
      form,
      closeModal,
      saveChanges
    };
  }
}
</script>
