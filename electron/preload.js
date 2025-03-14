const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  getExamples: () => ipcRenderer.invoke('get-examples'),
  addTestExample: () => ipcRenderer.invoke('add-test-example')
});