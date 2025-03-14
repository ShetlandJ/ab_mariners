const { contextBridge, ipcRenderer } = require('electron');

console.log("✅ Preload script is running!");

contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    getMarinersCount: () => ipcRenderer.invoke('get-mariners-count'),
    getMarinersPaginated: (page, limit) => ipcRenderer.invoke('get-mariners-paginated', page, limit),
  }
});

console.log("Preload script loaded successfully");
