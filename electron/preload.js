const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  mariners: {
    // GET /mariners
    list: (page, limit) => ipcRenderer.invoke('mariners:list', { page, limit }),
    // GET /mariners/:id
    get: (id) => ipcRenderer.invoke('mariners:get', { id }),
    // POST /mariners
    create: (data) => ipcRenderer.invoke('mariners:create', { data }),
    // PUT /mariners/:id
    update: (id, data) => ipcRenderer.invoke('mariners:update', { id, data }),
    // DELETE /mariners/:id
    delete: (id) => ipcRenderer.invoke('mariners:delete', { id })
  }
});