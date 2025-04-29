<template>
  <div class="backup-view">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold dark:text-white">Database Backup</h1>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">Create Backup</h2>
      
      <div class="mb-6">
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          Create a backup of your SQLite database. The backup will be saved to a location of your choice.
        </p>
        <p class="text-gray-700 dark:text-gray-300 mb-4">
          Current database location: <span class="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{{ databasePath }}</span>
        </p>
      </div>
      
      <div class="flex items-center">
        <button 
          @click="createBackup" 
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 dark:bg-blue-700 dark:hover:bg-blue-600"
          :disabled="isCreatingBackup"
        >
          <svg v-if="isCreatingBackup" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          {{ isCreatingBackup ? 'Creating Backup...' : 'Create Backup' }}
        </button>
      </div>
    </div>

    <!-- Backup History Section -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6" v-if="backupHistory.length > 0">
      <h2 class="text-xl font-semibold mb-4 dark:text-white">Backup History</h2>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="(backup, index) in backupHistory" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {{ formatDate(backup.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ backup.path }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatSize(backup.size) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Status message -->
    <div v-if="statusMessage" class="mt-4 p-4 rounded-md" :class="statusType === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'BackupView',
  setup() {
    const databasePath = ref('');
    const isCreatingBackup = ref(false);
    const statusMessage = ref('');
    const statusType = ref('success');
    const backupHistory = ref([]);

    // Get database info on component mount
    onMounted(async () => {
      try {
        const info = await window.electronAPI.database.getDatabaseInfo();
        databasePath.value = info.path;
        
        // Load backup history if available
        const history = await window.electronAPI.database.getBackupHistory();
        if (history) {
          backupHistory.value = history;
        }
      } catch (error) {
        console.error('Error loading database info:', error);
      }
    });

    // Function to create database backup
    async function createBackup() {
      try {
        isCreatingBackup.value = true;
        statusMessage.value = '';
        
        // Request backup operation
        const result = await window.electronAPI.database.createBackup();
        
        // Show success message and update history
        statusMessage.value = `Backup successfully created at: ${result.path}`;
        statusType.value = 'success';
        
        // Refresh backup history
        const history = await window.electronAPI.database.getBackupHistory();
        if (history) {
          backupHistory.value = history;
        }
      } catch (error) {
        console.error('Error creating backup:', error);
        statusMessage.value = `Failed to create backup: ${error.message || 'Unknown error'}`;
        statusType.value = 'error';
      } finally {
        isCreatingBackup.value = false;
      }
    }

    // Helper function to format date
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString();
    }

    // Helper function to format file size
    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
      else return (bytes / 1048576).toFixed(2) + ' MB';
    }

    return {
      databasePath,
      isCreatingBackup,
      statusMessage,
      statusType,
      backupHistory,
      createBackup,
      formatDate,
      formatSize
    };
  }
}
</script>