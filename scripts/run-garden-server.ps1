# Supervisor loop: keeps the Garden Planner server running.
# Starts the Node server and, if it ever exits/crashes, restarts it after a short
# pause. Launched hidden at login by GardenPlanner-autostart.vbs.
#
# Note: uses -WindowStyle Hidden (NOT -NoNewWindow) so it works when launched
# with no console attached (i.e. hidden at login).
$ErrorActionPreference = 'SilentlyContinue'
$dir  = 'C:\Users\abeem\Documents\garden-planner'
$node = 'C:\Program Files\nodejs\node.exe'
$log  = Join-Path $dir 'scripts\server.log'
Set-Location $dir

while ($true) {
  Add-Content $log ("[{0}] starting server" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
  # -Wait blocks until the server exits; -WindowStyle Hidden keeps it invisible.
  Start-Process -FilePath $node -ArgumentList 'server\src\index.js' `
    -WorkingDirectory $dir -WindowStyle Hidden -Wait
  Add-Content $log ("[{0}] server exited; restarting in 3s" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
  Start-Sleep -Seconds 3
}
