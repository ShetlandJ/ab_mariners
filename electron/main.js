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

  ipcMain.handle('create-mariner', async (event, mariner) => {
    try {
      // Create SQL INSERT statement dynamically from the mariner object
      const fields = Object.keys(mariner)
        .filter(key => mariner[key] !== undefined && mariner[key] !== null && mariner[key] !== '')
        .join(', ');

      const placeholders = Object.keys(mariner)
        .filter(key => mariner[key] !== undefined && mariner[key] !== null && mariner[key] !== '')
        .map(() => '?')
        .join(', ');

      const values = Object.keys(mariner)
        .filter(key => mariner[key] !== undefined && mariner[key] !== null && mariner[key] !== '')
        .map(key => mariner[key]);

      // If there are no valid fields, handle the error
      if (!fields) {
        throw new Error('No valid fields provided for creating a mariner');
      }

      const sql = `INSERT INTO person (${fields}) VALUES (${placeholders})`;
      
      // Execute the insert
      const result = await db.run(sql, values);
      
      // Get the newly created mariner with the inserted ID
      const newMariner = await db.get('SELECT * FROM person WHERE person_id = ?', [result.lastID]);
      
      return newMariner;
    } catch (error) {
      console.error('Error creating mariner:', error);
      throw error;
    }
  });

  // Add delete mariner handler
  ipcMain.handle('delete-mariner', async (event, id) => {
    try {
      if (!id) {
        throw new Error('Invalid mariner ID: ID is required');
      }

      // Start a transaction to ensure data consistency
      await db.run('BEGIN TRANSACTION');
      
      try {
        // First delete all ship assignments for this mariner
        await db.run('DELETE FROM person_ship WHERE person_id = ?', [id]);
        
        // Then delete the mariner
        const result = await db.run('DELETE FROM person WHERE person_id = ?', [id]);
        
        // Commit the transaction
        await db.run('COMMIT');
        
        return { 
          success: true, 
          deletedCount: result.changes,
          id 
        };
      } catch (error) {
        // Rollback in case of error
        await db.run('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error deleting mariner:', error);
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

  // Add new ship assignment handler
  ipcMain.handle('add-ship-assignment', async (event, personId, assignment) => {
    try {
      console.log('Adding ship assignment:', { personId, assignment });
      
      if (!personId) {
        throw new Error('Person ID is required');
      }
      
      let shipId = assignment.ship_id;
      
      // If no ship_id but we have a ship_name, try to find or create the ship
      if (!shipId && assignment.ship_name) {
        // Try to find an existing ship with this name
        const existingShip = await db.get(
          'SELECT shipID FROM ship WHERE LOWER(name) = ?', 
          [assignment.ship_name.toLowerCase()]
        );
        
        if (existingShip) {
          shipId = existingShip.shipID;
        } else {
          // Create a new ship
          const result = await db.run(
            'INSERT INTO ship (name, designation) VALUES (?, ?)',
            [assignment.ship_name, assignment.designation || null]
          );
          shipId = result.lastID;
        }
      }
      
      if (!shipId) {
        throw new Error('Ship ID or name is required');
      }
      
      // Now create the person_ship relationship
      const result = await db.run(
        'INSERT INTO person_ship (person_id, ship_id, rank, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
        [
          personId,
          shipId,
          assignment.rank || null,
          assignment.start_date || null,
          assignment.end_date || null
        ]
      );
      
      // Return the newly created relationship with ship details
      const newAssignment = await db.get(`
        SELECT ps.*, s.name as ship_name, s.designation
        FROM person_ship ps
        LEFT JOIN ship s ON ps.ship_id = s.shipID
        WHERE ps.id = ?
      `, [result.lastID]);
      
      return newAssignment;
    } catch (error) {
      console.error('Error adding ship assignment:', error);
      throw error;
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

  ipcMain.handle('create-ship', async (event, ship) => {
    try {
      // Create SQL INSERT statement dynamically from the ship object
      const fields = Object.keys(ship)
        .filter(key => ship[key] !== undefined && ship[key] !== null && ship[key] !== '')
        .join(', ');

      const placeholders = Object.keys(ship)
        .filter(key => ship[key] !== undefined && ship[key] !== null && ship[key] !== '')
        .map(() => '?')
        .join(', ');

      const values = Object.keys(ship)
        .filter(key => ship[key] !== undefined && ship[key] !== null && ship[key] !== '')
        .map(key => ship[key]);

      // If there are no valid fields, handle the error
      if (!fields) {
        throw new Error('No valid fields provided for creating a ship');
      }

      const sql = `INSERT INTO ship (${fields}) VALUES (${placeholders})`;
      
      // Execute the insert
      const result = await db.run(sql, values);
      
      // Get the newly created ship with the inserted ID
      const newShip = await db.get('SELECT * FROM ship WHERE shipID = ?', [result.lastID]);
      
      return newShip;
    } catch (error) {
      console.error('Error creating ship:', error);
      throw error;
    }
  });

  // Database backup handlers
  ipcMain.handle('get-database-info', async () => {
    try {
      // Get the database file path
      const dbPath = path.join(__dirname, '../db/database.sqlite');
      
      // Get the file stats
      const fs = require('fs');
      const stats = fs.statSync(dbPath);
      
      return {
        path: dbPath,
        size: stats.size,
        lastModified: stats.mtime
      };
    } catch (error) {
      console.error('Error getting database info:', error);
      throw error;
    }
  });

  ipcMain.handle('create-backup', async () => {
    try {
      const fs = require('fs');
      const { dialog } = require('electron');
      
      // Get the source database path
      const dbPath = path.join(__dirname, '../db/database.sqlite');
      
      // Show save dialog to let user choose where to save the backup
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Save Database Backup',
        defaultPath: `database-backup-${new Date().toISOString().replace(/:/g, '-')}.sqlite`,
        buttonLabel: 'Save Backup',
        filters: [
          { name: 'SQLite Database', extensions: ['sqlite', 'db'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      if (result.canceled) {
        throw new Error('Backup operation canceled');
      }
      
      const destPath = result.filePath;
      
      // Create the backup
      await fs.promises.copyFile(dbPath, destPath);
      
      // Get file stats for the backup
      const stats = fs.statSync(destPath);
      
      // Create backup history entry
      const historyEntry = {
        date: new Date().toISOString(),
        path: destPath,
        size: stats.size
      };
      
      // Save to backup history
      const historyPath = path.join(app.getPath('userData'), 'backup-history.json');
      let history = [];
      
      try {
        if (fs.existsSync(historyPath)) {
          const historyData = await fs.promises.readFile(historyPath, 'utf8');
          history = JSON.parse(historyData);
        }
      } catch (err) {
        console.error('Error reading backup history:', err);
        // Continue with empty history if there's an error
      }
      
      // Add new entry to history
      history.push(historyEntry);
      
      // Save updated history
      await fs.promises.writeFile(historyPath, JSON.stringify(history, null, 2));
      
      return historyEntry;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  });

  ipcMain.handle('get-backup-history', async () => {
    try {
      const fs = require('fs');
      const historyPath = path.join(app.getPath('userData'), 'backup-history.json');
      
      if (!fs.existsSync(historyPath)) {
        return [];
      }
      
      const historyData = await fs.promises.readFile(historyPath, 'utf8');
      return JSON.parse(historyData);
    } catch (error) {
      console.error('Error getting backup history:', error);
      return [];
    }
  });

  // Get crew overlaps handler (for sailors who served together)
  ipcMain.handle('get-crew-overlaps', async (event, page, limit, shipFilter, dateFilter) => {
    try {
      const offset = (page - 1) * limit;
      let params = [];
      
      // Base query finds pairs of sailors who served on the same ship with overlapping dates
      let query = `
        WITH sailor_pairs AS (
          SELECT 
            ps1.id as assignment1_id,
            ps1.person_id as person1_id,
            ps1.ship_id,
            ps1.rank as rank1,
            ps1.start_date as start_date1,
            ps1.end_date as end_date1,
            ps2.id as assignment2_id,
            ps2.person_id as person2_id,
            ps2.rank as rank2,
            ps2.start_date as start_date2,
            ps2.end_date as end_date2,
            s.name as ship_name,
            s.designation as ship_designation,
            p1.forename as forename1,
            p1.surname as surname1,
            p2.forename as forename2,
            p2.surname as surname2
          FROM person_ship ps1
          JOIN person_ship ps2 ON ps1.ship_id = ps2.ship_id
          JOIN ship s ON ps1.ship_id = s.shipID
          JOIN person p1 ON ps1.person_id = p1.person_id
          JOIN person p2 ON ps2.person_id = p2.person_id
          WHERE 
            ps1.person_id < ps2.person_id AND  -- Ensure no duplicate pairs
            (
              -- Check for date overlap scenarios
              (ps1.start_date IS NOT NULL AND ps2.start_date IS NOT NULL AND 
               ps1.end_date IS NOT NULL AND ps2.end_date IS NOT NULL AND
               ps1.start_date <= ps2.end_date AND ps2.start_date <= ps1.end_date)
              OR
              -- Cases with missing end dates
              (ps1.start_date IS NOT NULL AND ps2.start_date IS NOT NULL AND
               (ps1.end_date IS NULL OR ps2.end_date IS NULL) AND
               (ps1.start_date <= ps2.start_date OR ps2.start_date <= ps1.start_date))
            )
      `;
      
      // Add ship filter if provided
      if (shipFilter) {
        query += ` AND LOWER(s.name) LIKE ? `;
        params.push(`%${shipFilter.toLowerCase()}%`);
      }
      
      // Add date filter if provided
      if (dateFilter) {
        query += ` AND (
          (ps1.start_date <= ? AND (ps1.end_date IS NULL OR ps1.end_date >= ?)) OR
          (ps2.start_date <= ? AND (ps2.end_date IS NULL OR ps2.end_date >= ?))
        ) `;
        params.push(dateFilter, dateFilter, dateFilter, dateFilter);
      }
      
      // Finish the main query
      query += `)
        SELECT * FROM sailor_pairs
        ORDER BY ship_name, start_date1, start_date2
        LIMIT ? OFFSET ?
      `;
      
      params.push(limit, offset);
      
      // Get the results
      const overlaps = await db.all(query, params);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as count FROM (
          SELECT 1
          FROM person_ship ps1
          JOIN person_ship ps2 ON ps1.ship_id = ps2.ship_id
          JOIN ship s ON ps1.ship_id = s.shipID
          WHERE 
            ps1.person_id < ps2.person_id AND
            (
              (ps1.start_date IS NOT NULL AND ps2.start_date IS NOT NULL AND 
               ps1.end_date IS NOT NULL AND ps2.end_date IS NOT NULL AND
               ps1.start_date <= ps2.end_date AND ps2.start_date <= ps1.end_date)
              OR
              (ps1.start_date IS NOT NULL AND ps2.start_date IS NOT NULL AND
               (ps1.end_date IS NULL OR ps2.end_date IS NULL) AND
               (ps1.start_date <= ps2.start_date OR ps2.start_date <= ps1.start_date))
            )
      `;
      
      // Add filters to count query too
      let countParams = [];
      if (shipFilter) {
        countQuery += ` AND LOWER(s.name) LIKE ? `;
        countParams.push(`%${shipFilter.toLowerCase()}%`);
      }
      
      if (dateFilter) {
        countQuery += ` AND (
          (ps1.start_date <= ? AND (ps1.end_date IS NULL OR ps1.end_date >= ?)) OR
          (ps2.start_date <= ? AND (ps2.end_date IS NULL OR ps2.end_date >= ?))
        ) `;
        countParams.push(dateFilter, dateFilter, dateFilter, dateFilter);
      }
      
      countQuery += `)`;
      
      const countResult = await db.get(countQuery, countParams);
      
      return {
        overlaps,
        total: countResult ? countResult.count : 0
      };
    } catch (error) {
      console.error('Error getting crew overlaps:', error);
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
