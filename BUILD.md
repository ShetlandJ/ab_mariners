# Building the Alan Mariner Desktop App

This guide explains how to build installers for different platforms.

## Prerequisites

1. **Install dependencies** (if not already done):
   ```bash
   yarn install
   ```

2. **Install electron-builder** (now included in package.json):
   ```bash
   yarn add electron-builder --dev
   ```

## Building for Windows

### Option 1: Build on Windows (Recommended)

The most reliable way to build for Windows is to build on an actual Windows machine:

```bash
# On your Windows PC
yarn install
yarn build:win
```

Or use the convenience script:
```cmd
build-windows.bat
```

This ensures native SQLite modules are correctly compiled for Windows.

### Option 2: Build on Mac (Advanced - May Have Issues)

You can try building from Mac, but native modules may not work correctly:

```bash
# On Mac
yarn build:win
```

⚠️ **Important:** Cross-compiling native modules (like SQLite) from Mac to Windows is unreliable. If the app doesn't show data on Windows, you need to build on an actual Windows machine.

**Note:** The first build may take longer as it downloads Windows-specific build tools.

## Building for Mac

```bash
yarn build:mac
```

Creates a .dmg installer in the `dist-installer` folder.

## Building for Linux

```bash
yarn build:linux
```

Creates AppImage and .deb files in the `dist-installer` folder.

## Building for All Platforms

⚠️ **Not Recommended:** Building for all platforms from one machine doesn't work reliably with native modules.

Instead, use GitHub Actions for automated multi-platform builds:

1. Push your code to GitHub
2. The `.github/workflows/build.yml` workflow will automatically:
   - Build Windows installer on Windows runner
   - Build Mac installer on Mac runner
3. Download the installers from the Actions tab

Or build manually on each platform:
```bash
# On Mac
yarn build:mac

# On Windows
yarn build:win

# On Linux
yarn build:linux
```

## Output Location

All installers will be created in the `dist-installer` directory:
- Windows: `Alan Mariner Database Setup 1.0.0.exe`
- Mac: `Alan Mariner Database-1.0.0.dmg`
- Linux: `Alan-Mariner-Database-1.0.0.AppImage` and `.deb`

## Installing on Windows PC

1. Build the Windows installer on your Mac: `yarn build:win`
2. Copy the .exe file from `dist-installer/` to your Windows PC
3. Run the installer on Windows
4. The database will be included with the installation

## Customizing the Build

Edit the `build` section in `package.json` to customize:
- App name and ID
- Icons (place in `build/` folder)
- Installer options
- File inclusions/exclusions

## Icons

To add custom icons:
- Windows: Place `icon.ico` (256x256) in the `build/` folder
- Mac: Place `icon.icns` in the `build/` folder  
- Linux: Place `icon.png` (512x512) in the `build/` folder

For now, the app will use default Electron icons.

## Troubleshooting

### Database/Data Issues on Windows

**Data not showing in the Windows app:**
1. Make sure the template database exists: `db/database.sqlite`
2. Rebuild native modules: `yarn postinstall`
3. Check the build includes native module unpacking (already configured)
4. Native SQLite modules are now properly rebuilt for Windows during the build process

**App shows empty tables or no data:**
- Open DevTools (temporarily enabled in production) and check the Console tab for "DATABASE DIAGNOSTICS"
- Verify that "Mariner count" is greater than 0
- Check that "Database exists" and "Database connected" are both true

### Installation Issues on Windows

**Installer won't run if app is already installed:**
- The new installer automatically closes running instances before installing
- If it still fails, manually close the app from Task Manager
- The installer now handles updates better with graceful app closure

**Manual uninstall needed:**
- This issue is now fixed with improved NSIS installer scripts
- The installer uses a GUID to properly track installations
- User data is preserved in AppData even after uninstall

### Build Issues

**"Cannot find module 'better-sqlite3'"**
- Run `yarn postinstall` to rebuild native modules for your current platform

**Build fails on Mac when building for Windows**
- Cross-compiling native modules (SQLite) from Mac to Windows is complex and often unreliable
- **Best solution:** Build on an actual Windows machine using `yarn build:win`
- **Alternative:** Use GitHub Actions or CI/CD to build on multiple platforms
- If you must build from Mac:
  - Ensure build tools are installed: `xcode-select --install`
  - Accept that native modules might not work correctly on Windows
  - You'll need to test and potentially rebuild on Windows

**Build is slow or hangs**
- Building for Windows from Mac takes time due to native module compilation
- First build downloads Windows build tools (can be several GB)
- Subsequent builds are faster

**Database not included**
- Check that `db/database.sqlite` exists before building
- The database is included via `extraResources` in package.json

### Testing the Windows Build

After building:
1. Copy the `.exe` installer from `dist-installer/` to your Windows PC
2. Run the installer
3. The app should open automatically after installation
4. Check DevTools console for database diagnostics
5. Verify that mariners data loads in the table

### Common Issues Fixed

✅ **Native modules not working on Windows** - Now properly rebuilt during build
✅ **Installer conflicts** - Improved NSIS scripts with graceful app closure
✅ **Database diagnostics errors** - Fixed async/sync method conflicts
✅ **Data not showing** - Native SQLite modules now properly unpacked and rebuilt
