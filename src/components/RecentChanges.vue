<template>
  <div class="recent-changes-sidebar">
    <!-- Overlay -->
    <div 
      v-if="isOpen" 
      @click="close"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
    ></div>

    <!-- Sidebar -->
    <div 
      :class="['fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300', isOpen ? 'translate-x-0' : 'translate-x-full']"
    >
      <div class="h-full flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 class="text-xl font-bold dark:text-white">Recent Changes</h2>
          <button 
            @click="close"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Filter buttons -->
        <div class="p-4 border-b dark:border-gray-700">
          <div class="flex flex-wrap gap-2">
            <button
              @click="filterType = 'all'"
              :class="[
                'px-3 py-1 text-xs rounded-full transition-colors',
                filterType === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              All
            </button>
            <button
              @click="filterType = 'create'"
              :class="[
                'px-3 py-1 text-xs rounded-full transition-colors',
                filterType === 'create' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              Created
            </button>
            <button
              @click="filterType = 'edit'"
              :class="[
                'px-3 py-1 text-xs rounded-full transition-colors',
                filterType === 'edit' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              Edited
            </button>
            <button
              @click="filterType = 'delete'"
              :class="[
                'px-3 py-1 text-xs rounded-full transition-colors',
                filterType === 'delete' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              Deleted
            </button>
            <button
              @click="filterType = 'merge'"
              :class="[
                'px-3 py-1 text-xs rounded-full transition-colors',
                filterType === 'merge' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              ]"
            >
              Merged
            </button>
          </div>
        </div>

        <!-- Changes List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="flex justify-center items-center h-32">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>

          <div v-else-if="filteredChanges.length === 0" class="p-4 text-center text-gray-500 dark:text-gray-400">
            No recent changes found
          </div>

          <div v-else class="divide-y dark:divide-gray-700">
            <div
              v-for="change in filteredChanges"
              :key="change.id"
              @click="selectChange(change)"
              :class="[
                'p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700',
                selectedChange?.id === change.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              ]"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span 
                    :class="[
                      'px-2 py-1 text-xs font-semibold rounded',
                      getChangeTypeClass(change.change_type)
                    ]"
                  >
                    {{ formatChangeType(change.change_type) }}
                  </span>
                  <span class="text-xs text-gray-500 dark:text-gray-400">
                    {{ change.entity_type }}
                  </span>
                </div>
                <span class="text-xs text-gray-400 dark:text-gray-500">
                  {{ formatTime(change.created_at) }}
                </span>
              </div>
              <div class="font-medium text-sm dark:text-white">
                {{ change.entity_name || 'Unknown' }}
              </div>
              <div v-if="change.change_type === 'edit'" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ getChangeCount(change) }} field(s) changed
              </div>
            </div>
          </div>
        </div>

        <!-- Detail Panel -->
        <div 
          v-if="selectedChange" 
          class="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 max-h-64 overflow-y-auto"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold dark:text-white">Change Details</h3>
            <button 
              @click="selectedChange = null"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="selectedChange.change_type === 'create'" class="space-y-2">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Created new {{ selectedChange.entity_type.toLowerCase() }}
            </p>
            <div class="text-xs text-gray-500 dark:text-gray-500">
              {{ formatDateTime(selectedChange.created_at) }}
            </div>
          </div>

          <div v-else-if="selectedChange.change_type === 'delete'" class="space-y-2">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Deleted {{ selectedChange.entity_type.toLowerCase() }}
            </p>
            <div class="text-xs text-gray-500 dark:text-gray-500">
              {{ formatDateTime(selectedChange.created_at) }}
            </div>
          </div>

          <div v-else-if="selectedChange.change_type === 'merge'" class="space-y-2">
            <div v-if="getChanges(selectedChange)" class="space-y-2">
              <div class="text-sm">
                <span class="text-gray-600 dark:text-gray-400">Merged into:</span>
                <span class="font-medium dark:text-white ml-1">{{ getChanges(selectedChange).primary }}</span>
              </div>
              <div class="text-sm">
                <span class="text-gray-600 dark:text-gray-400">From:</span>
                <span class="font-medium dark:text-white ml-1">{{ getChanges(selectedChange).secondary }}</span>
              </div>
              <div v-if="getChanges(selectedChange).keptSecondary" class="text-xs text-blue-600 dark:text-blue-400">
                Secondary record kept
              </div>
            </div>
          </div>

          <div v-else-if="selectedChange.change_type === 'edit'" class="space-y-3">
            <div v-for="(fieldChange, field) in getChanges(selectedChange)" :key="field" class="space-y-1">
              <div class="text-xs font-medium text-gray-700 dark:text-gray-300">
                {{ formatFieldName(field) }}
              </div>
              <div class="flex items-center space-x-2 text-sm">
                <span class="text-red-600 dark:text-red-400 line-through">
                  {{ formatFieldValue(fieldChange.old) }}
                </span>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span class="text-green-600 dark:text-green-400 font-medium">
                  {{ formatFieldValue(fieldChange.new) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';

export default {
  name: 'RecentChanges',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const changes = ref([]);
    const loading = ref(false);
    const filterType = ref('all');
    const selectedChange = ref(null);

    const filteredChanges = computed(() => {
      if (filterType.value === 'all') {
        return changes.value;
      }
      return changes.value.filter(c => c.change_type === filterType.value);
    });

    const loadChanges = async () => {
      loading.value = true;
      try {
        const result = await window.electronAPI.getRecentChanges(100);
        changes.value = result;
      } catch (error) {
        console.error('Error loading recent changes:', error);
      } finally {
        loading.value = false;
      }
    };

    const close = () => {
      emit('close');
    };

    const selectChange = (change) => {
      selectedChange.value = change;
    };

    const getChangeTypeClass = (type) => {
      const classes = {
        create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        edit: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        merge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      };
      return classes[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    const formatChangeType = (type) => {
      const types = {
        create: 'Created',
        edit: 'Edited',
        delete: 'Deleted',
        merge: 'Merged'
      };
      return types[type] || type;
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    };

    const formatDateTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleString();
    };

    const getChanges = (change) => {
      try {
        return change.changes_json ? JSON.parse(change.changes_json) : null;
      } catch (error) {
        console.error('Error parsing changes JSON:', error);
        return null;
      }
    };

    const getChangeCount = (change) => {
      const changes = getChanges(change);
      return changes ? Object.keys(changes).length : 0;
    };

    const formatFieldName = (field) => {
      return field
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatFieldValue = (value) => {
      if (value === null || value === undefined || value === '') {
        return '(empty)';
      }
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      return String(value);
    };

    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        loadChanges();
      }
    });

    onMounted(() => {
      if (props.isOpen) {
        loadChanges();
      }
    });

    return {
      changes,
      loading,
      filterType,
      filteredChanges,
      selectedChange,
      close,
      selectChange,
      getChangeTypeClass,
      formatChangeType,
      formatTime,
      formatDateTime,
      getChanges,
      getChangeCount,
      formatFieldName,
      formatFieldValue
    };
  }
};
</script>

<style scoped>
/* Custom scrollbar for dark mode */
.dark ::-webkit-scrollbar {
  width: 8px;
}

.dark ::-webkit-scrollbar-track {
  background: #374151;
}

.dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
