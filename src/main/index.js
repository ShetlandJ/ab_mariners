const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')
const waitOn = require('wait-on')

// Add this section at the top level of the file
async function installDevTools() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer');
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
}

async function createWindow() {
  installDevTools();

  // Wait for dev server in development mode
  if (process.env.NODE_ENV === 'development') {
    await waitOn({ resources: ['http://localhost:5174'] });
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Load your app
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5174/')
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  // Register keyboard shortcuts
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    win.webContents.toggleDevTools()
  })

  return win
}

// Change this section
app.whenReady().then(async () => {
  await createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
