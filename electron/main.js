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
    },
    show: false // Don't show until ready to avoid flickering
  });
  
  // Maximize the window before showing it
  mainWindow.maximize();
  mainWindow.show();

  // Load your app - use loadFile for production and loadURL for development
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.log('Loading development URL: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in development
    // mainWindow.webContents.openDevTools();
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
        // Try to parse the search term as a year if it's a valid number
        const isYearSearch = !isNaN(searchTerm) && searchTerm.length <= 4;
        
        let query;
        let params;
        
        if (isYearSearch) {
          // If the search term is a potential year, use equality for year fields
          query = `
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
               OR year_of_birth = ?
               OR year_of_death = ?
          `;
          params = [...Array(12).fill(searchLower), searchTerm, searchTerm];
        } else {
          // Regular text search without year matching
          query = `
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
               OR CAST(year_of_birth AS TEXT) LIKE ?
               OR CAST(year_of_death AS TEXT) LIKE ?
          `;
          params = [...Array(14).fill(searchLower)];
        }
        
        const result = await db.get(query, params);
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
        // Try to parse the search term as a year if it's a valid number
        const isYearSearch = !isNaN(searchTerm) && searchTerm.length <= 4;
        
        if (isYearSearch) {
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
               OR year_of_birth = ?
               OR year_of_death = ?
            ORDER BY surname, forename LIMIT ? OFFSET ?
          `;
          params = [...Array(12).fill(searchLower), searchTerm, searchTerm, limit, offset];
        } else {
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
               OR CAST(year_of_birth AS TEXT) LIKE ?
               OR CAST(year_of_death AS TEXT) LIKE ?
            ORDER BY surname, forename LIMIT ? OFFSET ?
          `;
          params = [...Array(14).fill(searchLower), limit, offset];
        }
      } else {
        query = 'SELECT * FROM person ORDER BY surname, forename LIMIT ? OFFSET ?';
        params = [limit, offset];
      }
      
      const mariners = await db.all(query, params);
      
      // Get total count with same search conditions
      let countQuery, countParams;
      if (searchTerm) {
        const searchLower = `%${searchTerm.toLowerCase()}%`;
        const isYearSearch = !isNaN(searchTerm) && searchTerm.length <= 4;
        
        if (isYearSearch) {
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
               OR year_of_birth = ?
               OR year_of_death = ?
          `;
          countParams = [...Array(12).fill(searchLower), searchTerm, searchTerm];
        } else {
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
               OR CAST(year_of_birth AS TEXT) LIKE ?
               OR CAST(year_of_death AS TEXT) LIKE ?
          `;
          countParams = [...Array(14).fill(searchLower)];
        }
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

  ipcMain.handle('update-mariner', async (event, mariner) => {
    try {
      if (!mariner || !mariner.person_id) {
        throw new Error('Invalid mariner data: person_id is required');
      }

      // Create the SQL update statement dynamically from the mariner object
      const fields = Object.keys(mariner)
        .filter(field => field !== 'person_id') // Don't update the ID
        .map(field => `${field} = ?`).join(', ');
      
      const values = Object.keys(mariner)
        .filter(field => field !== 'person_id')
        .map(field => mariner[field]);
      
      // Add the ID to the values array for the WHERE clause
      values.push(mariner.person_id);
      
      const sql = `UPDATE person SET ${fields} WHERE person_id = ?`;
      
      // Execute the update
      await db.run(sql, values);
      
      // Return the updated mariner
      return mariner;
    } catch (error) {
      console.error('Error updating mariner:', error);
      throw error;
    }
  });

  // Add this handler for getting a mariner by ID
  ipcMain.handle('get-mariner-by-id', async (event, id) => {
    try {
      // Get the basic mariner information
      const query = 'SELECT * FROM person WHERE person_id = ?';
      const mariner = await db.get(query, [id]);
      
      if (!mariner) return null;
      
      // Cast died_at_sea to boolean
      if (mariner.died_at_sea !== null) {
        mariner.died_at_sea = Boolean(mariner.died_at_sea);
      }
      
      // Get ship assignments from the person_ship table
      const shipAssignmentsQuery = `
        SELECT ps.*, s.name as ship_name, s.designation
        FROM person_ship ps
        LEFT JOIN ship s ON ps.ship_id = s.shipID
        WHERE ps.person_id = ?
        ORDER BY ps.start_date
      `;
      const shipAssignments = await db.all(shipAssignmentsQuery, [id]);
      
      // Add the ship assignments to the mariner object
      mariner.shipAssignments = shipAssignments;
      
      return mariner;
    } catch (error) {
      console.error('Error fetching mariner by ID:', error);
      throw error;
    }
  });

  // Ship-related handlers
  ipcMain.handle('get-ships-count', async (event, searchTerm = '') => {
    try {
      if (searchTerm) {
        const searchLower = `%${searchTerm.toLowerCase()}%`;
        const query = `
          SELECT COUNT(*) as count 
          FROM ship
          WHERE LOWER(name) LIKE ?
             OR LOWER(designation) LIKE ?
        `;
        const params = [...Array(2).fill(searchLower)];
        const result = await db.get(query, params);
        return result.count;
      } else {
        const result = await db.get('SELECT COUNT(*) as count FROM ship');
        return result.count;
      }
    } catch (error) {
      console.error('Error counting ships:', error);
      return 0;
    }
  });

  ipcMain.handle('get-ships-paginated', async (event, page, limit, searchTerm = '') => {
    try {
      const offset = (page - 1) * limit;
      let query, params;
      
      if (searchTerm) {
        const searchLower = `%${searchTerm.toLowerCase()}%`;
        query = `
          SELECT * FROM ship
          WHERE LOWER(name) LIKE ?
             OR LOWER(designation) LIKE ?
          ORDER BY name LIMIT ? OFFSET ?
        `;
        params = [...Array(2).fill(searchLower), limit, offset];
      } else {
        query = 'SELECT * FROM ship ORDER BY name LIMIT ? OFFSET ?';
        params = [limit, offset];
      }
      
      const ships = await db.all(query, params);
      
      // Get total count with same search conditions
      let countQuery, countParams;
      if (searchTerm) {
        const searchLower = `%${searchTerm.toLowerCase()}%`;
        countQuery = `
          SELECT COUNT(*) as total FROM ship
          WHERE LOWER(name) LIKE ?
             OR LOWER(designation) LIKE ?
        `;
        countParams = [...Array(2).fill(searchLower)];
      } else {
        countQuery = 'SELECT COUNT(*) as total FROM ship';
        countParams = [];
      }
      
      const countResult = await db.get(countQuery, countParams);
      
      return {
        ships,
        total: countResult.total
      };
    } catch (error) {
      console.error('Error fetching ships:', error);
      return { ships: [], total: 0 };
    }
  });

  ipcMain.handle('update-ship', async (event, ship) => {
    try {
      if (!ship || !ship.ship_id) {
        throw new Error('Invalid ship data: ship_id is required');
      }

      // Create the SQL update statement dynamically from the ship object
      const fields = Object.keys(ship)
        .filter(field => field !== 'ship_id') // Don't update the ID
        .map(field => `${field} = ?`).join(', ');
      
      const values = Object.keys(ship)
        .filter(field => field !== 'ship_id')
        .map(field => ship[field]);
      
      // Add the ID to the values array for the WHERE clause
      values.push(ship.ship_id);
      
      const sql = `UPDATE ship SET ${fields} WHERE ship_id = ?`;
      
      // Execute the update
      await db.run(sql, values);
      
      // Return the updated ship
      return ship;
    } catch (error) {
      console.error('Error updating ship:', error);
      throw error;
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
