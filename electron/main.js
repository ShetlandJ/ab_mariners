const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { enableHMR } = require('./dev-config');
const Database = require('better-sqlite3');
require('@electron/remote/main').initialize();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  require('@electron/remote/main').enable(win.webContents);

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

// Database setup
let db;

function setupDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'database.sqlite');
  db = new Database(dbPath, { verbose: console.log });
}

app.whenReady().then(() => {
  setupDatabase();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('db:getMarinersCount', () => {
  return db.prepare('SELECT COUNT(*) as count FROM person').get().count;
});

ipcMain.handle('db:getMarinersPaginated', (event, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return db.prepare(`
    SELECT person_id, surname, forename, year_of_birth, year_of_death, place_of_birth 
    FROM person 
    ORDER BY surname, forename 
    LIMIT ? OFFSET ?
  `).all(limit, offset);
});

ipcMain.handle('get-database-path', () => {
  return path.join(app.getPath('userData'), 'database.sqlite');
});

ipcMain.on('get-database-path', (event) => {
  event.returnValue = path.join(app.getPath('userData'), 'database.sqlite');
});

enableHMR();
