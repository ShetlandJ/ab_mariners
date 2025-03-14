const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { enableHMR } = require('./dev-config');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const server = {
    host: 'localhost',
    port: 5173,
  };

  win.loadURL(
    process.env.NODE_ENV === 'development' 
      ? `http://${server.host}:${server.port}`
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );

  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-database-path', () => {
  return path.join(app.getPath('userData'), 'database.sqlite');
});

enableHMR();
