class DatabaseService {
    async getMarinersCount() {
        return window.electronAPI.database.getMarinersCount();
    }

    async getMarinersPaginated(page = 1, limit = 20) {
        return window.electronAPI.database.getMarinersPaginated(page, limit);
    }
}

export default new DatabaseService();
