import { ref, computed } from 'vue';

export function usePagination(totalItems, itemsPerPage = 20) {
    const currentPage = ref(1);
    const total = ref(totalItems);

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
