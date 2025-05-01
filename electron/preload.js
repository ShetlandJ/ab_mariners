const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    getMarinersCount: (searchTerm) => {
      return ipcRenderer.invoke('get-mariners-count', searchTerm);
    },
    getMarinersPaginated: (page, limit, searchTerm) => {
      return ipcRenderer.invoke('get-mariners-paginated', page, limit, searchTerm);
    },
    getMarinerById: (id) => {
      return ipcRenderer.invoke('get-mariner-by-id', id);
    },
    updateMariner: (mariner) => {
      return ipcRenderer.invoke('update-mariner', mariner);
    },
    createMariner: (mariner) => {
      return ipcRenderer.invoke('create-mariner', mariner);
    },
    deleteMariner: (id) => {
      return ipcRenderer.invoke('delete-mariner', id);
    },
    // New ship-related methods
    getShipsCount: (searchTerm) => {
      return ipcRenderer.invoke('get-ships-count', searchTerm);
    },
    getShipsPaginated: (page, limit, searchTerm) => {
      return ipcRenderer.invoke('get-ships-paginated', page, limit, searchTerm);
    },
    updateShip: (ship) => {
      return ipcRenderer.invoke('update-ship', ship);
    },
    // Ship assignment method
    addShipAssignment: (personId, assignment) => {
      return ipcRenderer.invoke('add-ship-assignment', personId, assignment);
    },
    // Crew overlap report method
    getCrewOverlaps: (page, limit, shipFilter, dateFilter) => {
      return ipcRenderer.invoke('get-crew-overlaps', page, limit, shipFilter, dateFilter);
    },
    // New backup-related methods
    getDatabaseInfo: () => {
      return ipcRenderer.invoke('get-database-info');
    },
    createBackup: () => {
      return ipcRenderer.invoke('create-backup');
    },
    getBackupHistory: () => {
      return ipcRenderer.invoke('get-backup-history');
    }
  }
});
