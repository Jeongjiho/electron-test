const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    makeApiRequest: (options) => ipcRenderer.invoke('make-api-request', options)
});