class MarinersService {
    async list(page = 1, limit = 20) {
        return window.api.mariners.list(page, limit);
    }

    async get(id) {
        return window.api.mariners.get(id);
    }

    async create(data) {
        return window.api.mariners.create(data);
    }

    async update(id, data) {
        return window.api.mariners.update(id, data);
    }

    async delete(id) {
        return window.api.mariners.delete(id);
    }
}

export default new MarinersService();
