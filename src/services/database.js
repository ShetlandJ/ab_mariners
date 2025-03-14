class DatabaseService {
    async getMarinersCount(searchTerm = '') {
        return window.electronAPI.database.getMarinersCount(searchTerm);
    }

    async getMarinersPaginated(page = 1, limit = 20, searchTerm = '') {
        return window.electronAPI.database.getMarinersPaginated(page, limit, searchTerm);
    }
}

export default new DatabaseService();
