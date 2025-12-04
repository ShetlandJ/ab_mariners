const database = {
  // Mariner methods
  getMarinersCount(searchTerm) {
    return window.electronAPI.database.getMarinersCount(searchTerm);
  },

  async getMarinersPaginated(page, limit, searchTerm) {
    return window.electronAPI.database.getMarinersPaginated(page, limit, searchTerm);
  },

  async searchMariners(searchTerm, page = 1, limit = 20) {
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
  
  async createShip(ship) {
    return window.electronAPI.database.createShip(ship);
  },
  
  // Ship assignment methods
  async addShipAssignment(personId, assignment) {
    return window.electronAPI.database.addShipAssignment(personId, assignment);
  },
  
  async deleteShipAssignment(assignmentId) {
    return window.electronAPI.database.deleteShipAssignment(assignmentId);
  },
  
  async updateShipAssignment(assignmentId, assignment) {
    return window.electronAPI.database.updateShipAssignment(assignmentId, assignment);
  },
  
  // Debug method
  async debugGetShipAssignments(personId) {
    return window.electronAPI.database.debugGetShipAssignments(personId);
  },
  
  async debugTestDb() {
    return window.electronAPI.database.debugTestDb();
  },
  
  async searchShips(searchTerm) {
    return window.electronAPI.database.getShipsPaginated(1, 10, searchTerm);
  },

  // Ship crew methods
  async getShipCrew(shipId, page, limit) {
    return window.electronAPI.database.getShipCrew(shipId, page, limit);
  },

  // Crew overlap methods
  async getCrewOverlaps(page, limit, shipFilter = null, dateFilter = null) {
    return window.electronAPI.database.getCrewOverlaps(page, limit, shipFilter, dateFilter);
  }
};

export default database;
