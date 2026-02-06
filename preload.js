const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  renderFigure: (mode, code) => ipcRenderer.invoke('render-figure', { mode, code }),
  saveFigure: (imageData, defaultName) => ipcRenderer.invoke('save-figure', { imageData, defaultName }),
  getPythonStatus: () => ipcRenderer.invoke('get-python-status')
});
