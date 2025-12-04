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
    deleteShipAssignment: (assignmentId) => {
      return ipcRenderer.invoke('delete-ship-assignment', assignmentId);
    },
    updateShipAssignment: (assignmentId, assignment) => {
      return ipcRenderer.invoke('update-ship-assignment', assignmentId, assignment);
    },
    // Debug method
    debugGetShipAssignments: (personId) => {
      return ipcRenderer.invoke('debug-get-ship-assignments', personId);
    },
    debugTestDb: () => {
      return ipcRenderer.invoke('debug-test-db');
    },
    // Crew overlap report method
    getCrewOverlaps: (page, limit, shipFilter, dateFilter) => {
      return ipcRenderer.invoke('get-crew-overlaps', page, limit, shipFilter, dateFilter);
    },
    // Ship crew report method
    getShipCrew: (shipId, page, limit) => {
      return ipcRenderer.invoke('get-ship-crew', shipId, page, limit);
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
  },
  // External link handler
  openExternal: (url) => {
    return ipcRenderer.invoke('open-external', url);
  },
  // Merge sailors
  mergeSailors: (primaryId, secondaryId, mergedData) => {
    return ipcRenderer.invoke('merge-sailors', primaryId, secondaryId, mergedData);
  }
});
