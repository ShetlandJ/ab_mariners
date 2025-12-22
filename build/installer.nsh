; Custom NSIS script to handle app updates
; This will automatically close the running app before installing

!macro customInit
  ; Close any running instances before installation
  DetailPrint "Checking for running instances..."

  ; Try to close gracefully first
  nsExec::Exec 'taskkill /IM "Alan Mariner Database.exe" /T'
  Pop $0
  ${If} $0 == 0
    DetailPrint "Application closed gracefully"
    Sleep 1000
  ${Else}
    DetailPrint "No running instance found or already closed"
  ${EndIf}

  ; Force close if still running (only if graceful close didn't work)
  nsExec::Exec 'tasklist /FI "IMAGENAME eq Alan Mariner Database.exe" 2>NUL | find /I /N "Alan Mariner Database.exe">NUL'
  Pop $0
  ${If} $0 == 0
    DetailPrint "Force closing application..."
    nsExec::Exec 'taskkill /F /IM "Alan Mariner Database.exe" /T'
    Sleep 2000
  ${EndIf}

  ; Clean up any stale lock files
  Delete "$APPDATA\Alan Mariner Database\*.lock"
  Delete "$LOCALAPPDATA\Alan Mariner Database\*.lock"
!macroend

!macro customInstall
  ; Installation steps
  DetailPrint "Installing Alan Mariner Database..."
  DetailPrint "Version: ${VERSION}"
!macroend

!macro customUnInstall
  ; Close running instances before uninstall
  nsExec::Exec 'taskkill /F /IM "Alan Mariner Database.exe" /T'
  Sleep 1000

  ; Clean up lock files
  Delete "$APPDATA\Alan Mariner Database\*.lock"
  Delete "$LOCALAPPDATA\Alan Mariner Database\*.lock"

  DetailPrint "Uninstalling Alan Mariner Database..."
  DetailPrint "User data and database will be preserved in AppData"
!macroend
