const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { enableHMR } = require('./dev-config');
const { runMigrations } = require('../src/migrations/migrationRunner');
require('@electron/remote/main').initialize();

let mainWindow;
let db;

async function initDatabase() {
  try {
    // Close existing connection if any
    if (db) {
      await db.close();
    }
    
    // Open the database with better configuration
    db = await open({
      filename: path.join(__dirname, '../db/database.sqlite'),
      driver: sqlite3.Database
    });
    
    // Enable WAL mode for better concurrent access
    await db.exec('PRAGMA journal_mode = WAL;');
    
    // Set busy timeout
    await db.exec('PRAGMA busy_timeout = 10000;');
    
    console.log('Database connected successfully');
    
    // Run migrations automatically
    console.log('Checking for pending migrations...');
    try {
      await runMigrations(db);
    } catch (error) {
      console.error('Migration error:', error);
      // Don't throw - allow app to continue even if migrations fail
    }
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
  // Handler to open external URLs in the system's default browser
  ipcMain.handle('open-external', async (event, url) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error) {
      console.error('Error opening external URL:', error);
      return { success: false, error: error.message };
    }
  });

  // Handler to merge two sailors into one
  ipcMain.handle('merge-sailors', async (event, primaryId, secondaryId, mergedData, deleteSecondary = true) => {
    try {
      console.log('Starting merge:', { primaryId, secondaryId, mergedData, deleteSecondary });
      
      // Get secondary sailor name BEFORE transaction for change tracking
      const secondarySailor = await db.get('SELECT forename, surname FROM person WHERE person_id = ?', [secondaryId]);
      const secondaryName = secondarySailor 
        ? `${secondarySailor.forename || ''} ${secondarySailor.surname || ''}`.trim() 
        : 'Unknown';
      
      // Begin transaction
      await db.run('BEGIN TRANSACTION');

      // Build the UPDATE query for the primary sailor with merged data
      // Filter out person_id since we don't want to update the ID itself
      const fields = Object.keys(mergedData).filter(key => key !== 'person_id' && key !== 'id');
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => mergedData[field]);

      console.log('Update fields:', fields);
      console.log('Update values:', values);

      if (fields.length > 0) {
        // Update the primary sailor with merged field values
        const updateQuery = `UPDATE person SET ${setClause} WHERE person_id = ?`;
        console.log('Update query:', updateQuery);
        await db.run(updateQuery, [...values, primaryId]);
      }

      // Reassign all ship assignments from secondary sailor to primary sailor
      console.log('Reassigning ship assignments...');
      await db.run(
        `UPDATE person_ship SET person_id = ? WHERE person_id = ?`,
        [primaryId, secondaryId]
      );

      // Delete the secondary sailor only if deleteSecondary is true
      if (deleteSecondary) {
        console.log('Deleting secondary sailor...');
        await db.run(
          `DELETE FROM person WHERE person_id = ?`,
          [secondaryId]
        );
      } else {
        console.log('Keeping secondary sailor (merge and keep mode)');
      }

      // Commit transaction
      await db.run('COMMIT');
      console.log('Merge completed successfully');

      // Track the merge
      const primaryName = mergedData.forename && mergedData.surname 
        ? `${mergedData.forename} ${mergedData.surname}` 
        : 'Unknown';
      
      await logChange('merge', 'Mariner', primaryId, primaryName, {
        primary: primaryName,
        secondary: secondaryName,
        keptSecondary: !deleteSecondary
      });

      return { success: true, keptSecondary: !deleteSecondary };
    } catch (error) {
      console.error('Error merging sailors:', error);
      try {
        await db.run('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error rolling back:', rollbackError);
      }
      return { success: false, error: error.message };
    }
  });

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
            WHERE deleted_at IS NULL
              AND (LOWER(forename || ' ' || surname) LIKE ?
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
               OR year_of_death = ?)
          `;
          params = [...Array(12).fill(searchLower), searchTerm, searchTerm];
        } else {
          // Regular text search without year matching
          query = `
            SELECT COUNT(*) as count 
            FROM person
            WHERE deleted_at IS NULL
              AND (LOWER(forename || ' ' || surname) LIKE ?
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
               OR CAST(year_of_death AS TEXT) LIKE ?)
          `;
          params = [...Array(14).fill(searchLower)];
        }
        
        const result = await db.get(query, params);
        return result.count;
      } else {
        const result = await db.get('SELECT COUNT(*) as count FROM person WHERE deleted_at IS NULL');
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
            WHERE deleted_at IS NULL
              AND (LOWER(forename || ' ' || surname) LIKE ?
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
               OR year_of_death = ?)
            ORDER BY surname, forename LIMIT ? OFFSET ?
          `;
          params = [...Array(12).fill(searchLower), searchTerm, searchTerm, limit, offset];
        } else {
          query = `
            SELECT * FROM person
            WHERE deleted_at IS NULL
              AND (LOWER(forename || ' ' || surname) LIKE ?
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
               OR CAST(year_of_death AS TEXT) LIKE ?)
            ORDER BY surname, forename LIMIT ? OFFSET ?
          `;
          params = [...Array(14).fill(searchLower), limit, offset];
        }
      } else {
        query = 'SELECT * FROM person WHERE deleted_at IS NULL ORDER BY surname, forename LIMIT ? OFFSET ?';
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
            WHERE deleted_at IS NULL
              AND (LOWER(forename || ' ' || surname) LIKE ?
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
               OR year_of_death = ?)
          `;
          countParams = [...Array(12).fill(searchLower), searchTerm, searchTerm];
        } else {
          countQuery = `
            SELECT COUNT(*) as total FROM person
            WHERE deleted_at IS NULL
              AND (LOWER(forename || ' ' || surname) LIKE ?
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
               OR CAST(year_of_death AS TEXT) LIKE ?)
          `;
          countParams = [...Array(14).fill(searchLower)];
        }
      } else {
        countQuery = 'SELECT COUNT(*) as total FROM person WHERE deleted_at IS NULL';
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

      // Get the old mariner data for change tracking
      const oldMariner = await db.get('SELECT * FROM person WHERE person_id = ?', [mariner.person_id]);

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
      
      // Track changes
      if (oldMariner) {
        const changes = {};
        Object.keys(mariner).forEach(field => {
          if (field !== 'person_id' && oldMariner[field] !== mariner[field]) {
            changes[field] = {
              old: oldMariner[field],
              new: mariner[field]
            };
          }
        });
        
        if (Object.keys(changes).length > 0) {
          const entityName = `${mariner.forename || oldMariner.forename || ''} ${mariner.surname || oldMariner.surname || ''}`;
          await logChange('edit', 'Mariner', mariner.person_id, entityName.trim(), changes);
        }
      }
      
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
      // Get the basic mariner information (include soft-deleted for direct access)
      const query = 'SELECT * FROM person WHERE person_id = ?';
      const mariner = await db.get(query, [id]);
      
      if (!mariner) {
        return null;
      }
      
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

  // Debug handler for testing ship assignments
  ipcMain.handle('debug-get-ship-assignments', async (event, personId) => {
    try {
      const query = `
        SELECT ps.*, s.name as ship_name, s.designation
        FROM person_ship ps
        LEFT JOIN ship s ON ps.ship_id = s.shipID
        WHERE ps.person_id = ?
        ORDER BY ps.start_date
      `;
      const result = await db.all(query, [personId]);
      return result;
    } catch (error) {
      console.error('Error getting ship assignments:', error);
      throw error;
    }
  });

  // Simple debug handler to test database connectivity
  ipcMain.handle('debug-test-db', async (event) => {
    try {
      const result = await db.get('SELECT COUNT(*) as count FROM person WHERE deleted_at IS NULL');
      return result;
    } catch (error) {
      console.error('Database connectivity test failed:', error);
      throw error;
    }
  });  ipcMain.handle('create-mariner', async (event, mariner) => {
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
      
      // Get the newly created mariner with the inserted ID (won't be deleted)
      const newMariner = await db.get('SELECT * FROM person WHERE person_id = ?', [result.lastID]);
      
      // Track the creation
      const entityName = `${newMariner.forename || ''} ${newMariner.surname || ''}`;
      await logChange('create', 'Mariner', newMariner.person_id, entityName.trim());
      
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

      // Get mariner info before deleting for change tracking
      const mariner = await db.get('SELECT forename, surname FROM person WHERE person_id = ?', [id]);

      // Soft delete: set deleted_at timestamp instead of actually deleting
      const result = await db.run(
        'UPDATE person SET deleted_at = CURRENT_TIMESTAMP WHERE person_id = ?',
        [id]
      );
      
      // Track the deletion
      if (mariner) {
        const entityName = `${mariner.forename || ''} ${mariner.surname || ''}`;
        await logChange('delete', 'Mariner', id, entityName.trim());
      }
      
      return { 
        success: true, 
        deletedCount: result.changes,
        id 
      };
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

  // Handler to get all crew members for a specific ship
  ipcMain.handle('get-ship-crew', async (event, shipId, page, limit) => {
    try {
      const offset = (page - 1) * limit;
      
      // Query to get all mariners who served on a specific ship
      const query = `
        SELECT 
          ps.id as assignment_id,
          ps.rank,
          ps.start_date,
          ps.end_date,
          p.person_id,
          p.forename,
          p.surname,
          p.year_of_birth,
          p.place_of_birth,
          p.died_at_sea
        FROM person_ship ps
        JOIN person p ON ps.person_id = p.person_id
        WHERE ps.ship_id = ?
        ORDER BY ps.start_date, p.surname, p.forename
        LIMIT ? OFFSET ?
      `;
      
      const crew = await db.all(query, [shipId, limit, offset]);
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as count
        FROM person_ship
        WHERE ship_id = ?
      `;
      
      const countResult = await db.get(countQuery, [shipId]);
      
      // Get ship details
      const shipQuery = `
        SELECT * FROM ship WHERE shipID = ?
      `;
      
      const ship = await db.get(shipQuery, [shipId]);
      
      return {
        crew,
        total: countResult ? countResult.count : 0,
        ship
      };
    } catch (error) {
      console.error('Error getting ship crew:', error);
      throw error;
    }
  });

  // Delete ship assignment handler
  ipcMain.handle('delete-ship-assignment', async (event, assignmentId) => {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }

      const result = await db.run('DELETE FROM person_ship WHERE id = ?', [assignmentId]);
      
      return { 
        success: true, 
        deletedCount: result.changes,
        id: assignmentId 
      };
    } catch (error) {
      console.error('Error deleting ship assignment:', error);
      throw error;
    }
  });

  // Update ship assignment handler
  ipcMain.handle('update-ship-assignment', async (event, assignmentId, assignment) => {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }

      if (!assignment) {
        throw new Error('Assignment data is required');
      }

      const { ship_id, rank, start_date, end_date } = assignment;

      const result = await db.run(
        `UPDATE person_ship 
         SET ship_id = ?, rank = ?, start_date = ?, end_date = ? 
         WHERE id = ?`,
        [ship_id, rank, start_date, end_date, assignmentId]
      );
      
      return { 
        success: true, 
        updatedCount: result.changes,
        id: assignmentId 
      };
    } catch (error) {
      console.error('Error updating ship assignment:', error);
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

  // Helper function to log changes
  async function logChange(changeType, entityType, entityId, entityName, changes = null) {
    try {
      const changesJson = changes ? JSON.stringify(changes) : null;
      await db.run(
        `INSERT INTO change_history (change_type, entity_type, entity_id, entity_name, changes_json)
         VALUES (?, ?, ?, ?, ?)`,
        [changeType, entityType, entityId, entityName, changesJson]
      );
    } catch (error) {
      console.error('Error logging change:', error);
    }
  }

  // Get recent changes
  ipcMain.handle('get-recent-changes', async (event, limit = 100) => {
    try {
      const changes = await db.all(
        `SELECT * FROM change_history 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [limit]
      );
      return changes;
    } catch (error) {
      console.error('Error getting recent changes:', error);
      return [];
    }
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
