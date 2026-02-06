const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let pythonProcess;

// Python backend configuration
const PYTHON_PORT = 5678;
const isDev = !app.isPackaged;

function getPythonPath() {
  if (isDev) {
    return 'python3';
  }
  // In production, use bundled Python or system Python
  const resourcePath = process.resourcesPath;
  return path.join(resourcePath, 'python-backend', 'venv', 'bin', 'python3');
}

function getServerPath() {
  if (isDev) {
    return path.join(__dirname, 'python-backend', 'server.py');
  }
  return path.join(process.resourcesPath, 'python-backend', 'server.py');
}

function startPythonBackend() {
  const pythonPath = getPythonPath();
  const serverPath = getServerPath();

  console.log(`Starting Python backend: ${pythonPath} ${serverPath}`);

  pythonProcess = spawn(pythonPath, [serverPath, '--port', String(PYTHON_PORT)], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[Python] ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[Python Error] ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python backend exited with code ${code}`);
  });
}

function stopPythonBackend() {
  if (pythonProcess) {
    pythonProcess.kill();
    pythonProcess = null;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'SAi Math Figure Generator',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('render-figure', async (event, { mode, code }) => {
  try {
    const response = await fetch(`http://127.0.0.1:${PYTHON_PORT}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, code })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-figure', async (event, { imageData, defaultName }) => {
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || 'figure.png',
    filters: [
      { name: 'PNG Image', extensions: ['png'] },
      { name: 'SVG Image', extensions: ['svg'] },
      { name: 'PDF Document', extensions: ['pdf'] }
    ]
  });

  if (filePath) {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    return { success: true, path: filePath };
  }
  return { success: false, error: 'Save cancelled' };
});

ipcMain.handle('get-python-status', async () => {
  try {
    const response = await fetch(`http://127.0.0.1:${PYTHON_PORT}/health`);
    const data = await response.json();
    return { running: true, ...data };
  } catch {
    return { running: false };
  }
});

// App lifecycle
app.whenReady().then(() => {
  startPythonBackend();

  // Wait for Python backend to start
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopPythonBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopPythonBackend();
});
