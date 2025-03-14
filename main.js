const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { dbPath } = require('./src/config/database'); // Ensure path is correct

async function getDatabaseConnection() {
    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false, // Security best practices
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    if (process.env.NODE_ENV !== 'production') {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile('dist/index.html');
    }
}

app.whenReady().then(async () => {
    createWindow();

    // ✅ Ensure IPC handlers are registered before Vue tries to use them
    ipcMain.handle('get-mariners-count', async () => {
        const db = await getDatabaseConnection();
        const result = await db.get('SELECT COUNT(*) AS count FROM person');
        return result.count;
    });

    ipcMain.handle('get-mariners-paginated', async (_, page, limit) => {
        const db = await getDatabaseConnection();
        const offset = (page - 1) * limit;
        return await db.all('SELECT * FROM person ORDER BY forename, surname LIMIT ? OFFSET ?', [limit, offset]);
    });

    console.log('Main process loaded successfully');

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
