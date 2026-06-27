import { ref, computed, isRef } from 'vue';

export function usePagination(totalItems, itemsPerPage = 20) {
    const currentPage = ref(1);
    // Accept either a ref (kept reactive) or a plain number (wrapped once).
    const total = isRef(totalItems) ? totalItems : ref(totalItems);

    const totalPages = computed(() => Math.ceil(total.value / itemsPerPage));
    const hasNextPage = computed(() => currentPage.value < totalPages.value);
    const hasPrevPage = computed(() => currentPage.value > 1);

    function nextPage() {
        if (hasNextPage.value) {
            currentPage.value++;
        }
    }

    function prevPage() {
        if (hasPrevPage.value) {
            currentPage.value--;
        }
    }

    return {
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage
    };
}
