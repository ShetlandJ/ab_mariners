class DatabaseService {
    async getMarinersCount(searchTerm = '') {
        return window.electronAPI.database.getMarinersCount(searchTerm);
    }

    async getMarinersPaginated(page = 1, limit = 20, searchTerm = '') {
        return window.electronAPI.database.getMarinersPaginated(page, limit, searchTerm);
    }

    /**
     * Updates a mariner in the database
     * @param {Object} mariner - The mariner object with updated values
     * @returns {Promise<Object>} - The updated mariner
     */
    async updateMariner(mariner) {
        return window.electronAPI.database.updateMariner(mariner);
    }
}

export default new DatabaseService();
