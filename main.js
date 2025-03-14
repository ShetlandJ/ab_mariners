const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const database = require('./src/services/database');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // In development, load from Vite dev server
    if (process.env.NODE_ENV !== 'production') {
        win.loadURL('http://localhost:5173');
    } else {
        win.loadFile('dist/index.html');
    }
}

app.whenReady().then(() => {
    createWindow();

    // Example IPC handler
    ipcMain.handle('get-examples', async () => {
        return database.getAllExamples();
    });

    ipcMain.handle('add-test-example', async () => {
        return database.addTestExample();
    });

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
