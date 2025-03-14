const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    getMarinersCount: (searchTerm) => {
      return ipcRenderer.invoke('get-mariners-count', searchTerm);
    },
    getMarinersPaginated: (page, limit, searchTerm) => {
      return ipcRenderer.invoke('get-mariners-paginated', page, limit, searchTerm);
    },
    updateMariner: (mariner) => {
      return ipcRenderer.invoke('update-mariner', mariner);
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
    }
  }
});
