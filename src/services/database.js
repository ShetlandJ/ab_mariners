const database = {
  // Mariner methods
  getMarinersCount(searchTerm) {
    return window.electronAPI.database.getMarinersCount(searchTerm);
  },

  async getMarinersPaginated(page, limit, searchTerm) {
    return window.electronAPI.database.getMarinersPaginated(page, limit, searchTerm);
  },

  async updateMariner(mariner) {
    return window.electronAPI.database.updateMariner(mariner);
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
  }
};

export default database;
