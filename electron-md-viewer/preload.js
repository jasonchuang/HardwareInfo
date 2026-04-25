const { contextBridge, ipcRenderer } = require('electron')

// Expose a safe, limited API to the renderer (no direct Node access)
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.send('open-file'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  onFileOpened: (callback) => ipcRenderer.on('file-opened', (_event, data) => callback(data))
})
