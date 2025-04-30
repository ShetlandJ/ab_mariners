const database = {
  // Mariner methods
  getMarinersCount(searchTerm) {
    return window.electronAPI.database.getMarinersCount(searchTerm);
  },

  async getMarinersPaginated(page, limit, searchTerm) {
    return window.electronAPI.database.getMarinersPaginated(page, limit, searchTerm);
  },

  async getMarinerById(id) {
    return window.electronAPI.database.getMarinerById(id);
  },

  async updateMariner(mariner) {
    return window.electronAPI.database.updateMariner(mariner);
  },

  async createMariner(mariner) {
    return window.electronAPI.database.createMariner(mariner);
  },
  
  async deleteMariner(id) {
    return window.electronAPI.database.deleteMariner(id);
  },

  // Ship methods
  getShipsCount(searchTerm) {
    return window.electronAPI.database.getShipsCount(searchTerm);
  },

  async getShipsPaginated(page, limit, searchTerm) {
    return window.electronAPI.database.getShipsPaginated(page, limit, searchTerm);
  },

  async updateShip(ship) {
    return window.electronAPI.database.updateShip(ship);
  },
  
  // Ship assignment methods
  async addShipAssignment(personId, assignment) {
    return window.electronAPI.database.addShipAssignment(personId, assignment);
  },
  
  async searchShips(searchTerm) {
    return window.electronAPI.database.getShipsPaginated(1, 10, searchTerm);
  }
};

export default database;
