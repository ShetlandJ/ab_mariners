const { app } = require('electron');
const path = require('path');

function enableHMR() {
  if (process.env.NODE_ENV !== 'development') return;

  const { default: installExtension, VUEJS_DEVTOOLS } = require('electron-devtools-installer');
  const { watchFile } = require('fs');

  // Install Vue Devtools
  app.whenReady().then(() => {
    installExtension(VUEJS_DEVTOOLS)
      .then((name) => console.log(`Added Extension: ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  });

  // Watch main process files and restart on changes
  watchFile(path.join(__dirname, 'main.js'), () => {
    app.relaunch();
    app.exit();
  });
}

module.exports = { enableHMR };
