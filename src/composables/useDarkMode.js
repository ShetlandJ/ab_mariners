import { ref, watch, onMounted } from 'vue';

export function useDarkMode() {
  const isDarkMode = ref(false);

  // Load preference from localStorage on mount
  onMounted(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      isDarkMode.value = savedMode === 'true';
      applyDarkMode(isDarkMode.value);
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      isDarkMode.value = prefersDark;
      applyDarkMode(prefersDark);
    }
  });

  // Watch for changes to apply them and save to localStorage
  watch(isDarkMode, (newValue) => {
    applyDarkMode(newValue);
    localStorage.setItem('darkMode', newValue);
  });

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return {
    isDarkMode,
    toggleDarkMode
  };
}
