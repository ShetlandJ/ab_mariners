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
  
  // Initialize tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS person (
      person_id INTEGER PRIMARY KEY,
      surname TEXT,
      forename TEXT,
      alias1surname TEXT,
      alias1forename TEXT,
      alias2surname TEXT,
      alias2forename TEXT,
      year_of_birth INTEGER,
      year_of_death INTEGER,
      place_of_birth TEXT,
      remittence TEXT,
      allotment TEXT,
      effects TEXT,
      grenpen TEXT,
      freetext TEXT,
      cod TEXT,
      appdate1 DATE,
      entdate1 DATE,
      ship1 TEXT,
      where1 TEXT,
      prest1 TEXT,
      appdate2 DATE,
      entdate2 DATE,
      ship2 TEXT,
      where2 TEXT,
      prest2 TEXT,
      appdate3 DATE,
      entdate3 DATE,
      ship3 TEXT,
      where3 TEXT,
      prest3 TEXT,
      shiplist TEXT
    );

    CREATE TABLE IF NOT EXISTS ship (
      shipID INTEGER PRIMARY KEY,
      name TEXT,
      designation TEXT,
      freetext TEXT
    );

    CREATE TABLE IF NOT EXISTS person_ship (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER,
      ship_id INTEGER,
      rank TEXT,
      start_date DATE,
      end_date DATE
    );
  `);

  // Only add test data if table is completely empty
  const count = db.prepare('SELECT COUNT(*) as count FROM person').get().count;
  if (count === 0) {
    console.log('Database is empty, adding test data...');
    db.prepare(`
      INSERT INTO person (surname, forename, year_of_birth, place_of_birth)
      VALUES (?, ?, ?, ?)
    `).run('Smith', 'John', 1820, 'London');
  } else {
    console.log(`Database already contains ${count} records, skipping initialization`);
  }
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
