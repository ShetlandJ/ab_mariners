const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  database: {
    getMarinersCount: () => ipcRenderer.invoke('db:getMarinersCount'),
    getMarinersPaginated: (page, limit) => ipcRenderer.invoke('db:getMarinersPaginated', page, limit)
  }
});