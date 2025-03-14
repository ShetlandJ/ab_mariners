const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    getMarinersCount: (searchTerm) => {
      return ipcRenderer.invoke('get-mariners-count', searchTerm);
    },
    getMarinersPaginated: (page, limit, searchTerm) => {
      return ipcRenderer.invoke('get-mariners-paginated', page, limit, searchTerm);
    }
  }
});
