const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { enableHMR } = require('./dev-config');
require('@electron/remote/main').initialize();

let mainWindow;
let db;

async function initDatabase() {
  try {
    // Open the database
    db = await open({
      filename: path.join(__dirname, '../db/database.sqlite'),
      driver: sqlite3.Database
    });
    
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

function createWindow() {
  // Make sure we're using the correct path for preload.js
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload path:', preloadPath);
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load your app - use loadFile for production and loadURL for development
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.log('Loading development URL: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading production file:', indexPath);
    mainWindow.loadFile(indexPath);
  }
  
  // Log when the page has finished loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window loaded successfully');
  });

  // Log any load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
}

// Set up IPC handlers for database operations
function setupIpcHandlers() {
  ipcMain.handle('get-mariners-count', async (event, searchTerm = '') => {
    try {
      if (searchTerm) {
        const searchLower = `%${searchTerm.toLowerCase()}%`;
        const query = `
          SELECT COUNT(*) as count 
          FROM person
          WHERE LOWER(forename || ' ' || surname) LIKE ?
             OR LOWER(surname) LIKE ? 
             OR LOWER(forename) LIKE ?
             OR LOWER(alias1surname) LIKE ?
             OR LOWER(alias1forename) LIKE ?
             OR LOWER(alias1forename || ' ' || alias1surname) LIKE ?
             OR LOWER(place_of_birth) LIKE ?
             OR LOWER(freetext) LIKE ?
             OR LOWER(cod) LIKE ?
             OR LOWER(ship1) LIKE ?
             OR LOWER(where1) LIKE ?
             OR LOWER(shiplist) LIKE ?
        `;
        const result = await db.get(query, Array(12).fill(searchLower));
        return result.count;
      } else {
        const result = await db.get('SELECT COUNT(*) as count FROM person');
        return result.count;
      }
    } catch (error) {
      console.error('Error counting mariners:', error);
      return 0;
    }
  });

  ipcMain.handle('get-mariners-paginated', async (event, page, limit, searchTerm = '') => {
    try {
      const offset = (page - 1) * limit;
      let query, params;
      
      if (searchTerm) {
        const searchLower = `%${searchTerm.toLowerCase()}%`;
        query = `
          SELECT * FROM person
          WHERE LOWER(forename || ' ' || surname) LIKE ?
             OR LOWER(surname) LIKE ? 
             OR LOWER(forename) LIKE ?
             OR LOWER(alias1surname) LIKE ?
             OR LOWER(alias1forename) LIKE ?
             OR LOWER(alias1forename || ' ' || alias1surname) LIKE ?
             OR LOWER(place_of_birth) LIKE ?
             OR LOWER(freetext) LIKE ?
             OR LOWER(cod) LIKE ?
             OR LOWER(ship1) LIKE ?
             OR LOWER(where1) LIKE ?
             OR LOWER(shiplist) LIKE ?
          ORDER BY surname, forename LIMIT ? OFFSET ?
        `;
        params = [...Array(12).fill(searchLower), limit, offset];
      } else {
        query = 'SELECT * FROM person ORDER BY surname, forename LIMIT ? OFFSET ?';
        params = [limit, offset];
      }
      
      const mariners = await db.all(query, params);
      
      // Get total count with same search conditions
      let countQuery, countParams;
      if (searchTerm) {
        const searchLower = `%${searchTerm.toLowerCase()}%`;
        countQuery = `
          SELECT COUNT(*) as total FROM person
          WHERE LOWER(forename || ' ' || surname) LIKE ?
             OR LOWER(surname) LIKE ? 
             OR LOWER(forename) LIKE ?
             OR LOWER(alias1surname) LIKE ?
             OR LOWER(alias1forename) LIKE ?
             OR LOWER(alias1forename || ' ' || alias1surname) LIKE ?
             OR LOWER(place_of_birth) LIKE ?
             OR LOWER(freetext) LIKE ?
             OR LOWER(cod) LIKE ?
             OR LOWER(ship1) LIKE ?
             OR LOWER(where1) LIKE ?
             OR LOWER(shiplist) LIKE ?
        `;
        countParams = Array(12).fill(searchLower);
      } else {
        countQuery = 'SELECT COUNT(*) as total FROM person';
        countParams = [];
      }
      
      const countResult = await db.get(countQuery, countParams);
      
      return {
        mariners,
        total: countResult.total
      };
    } catch (error) {
      console.error('Error fetching mariners:', error);
      return { mariners: [], total: 0 };
    }
  });
}

app.whenReady().then(async () => {
  await initDatabase();
  setupIpcHandlers();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Close the database connection when the app is quitting
app.on('before-quit', async () => {
  if (db) {
    await db.close();
    console.log('Database connection closed');
  }
});

enableHMR();
