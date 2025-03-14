const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('electron', {
  getExamples: () => ipcRenderer.invoke('get-examples'),
  addTestExample: () => ipcRenderer.invoke('add-test-example'),
  getDatabasePath: () => ipcRenderer.invoke('get-database-path')
});