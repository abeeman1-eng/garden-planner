@echo off
REM Stops the server, the public tunnel, and both supervisor loops.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$me=$PID; Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne $me -and ($_.CommandLine -match 'run-garden-server.ps1' -or $_.CommandLine -match 'run-garden-tunnel.ps1') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }; Get-Process node,cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force"
echo Garden Planner server + public link stopped. They start again next time you log in.
echo (To stop permanently, delete GardenPlanner.vbs and GardenPlannerTunnel.vbs from your Startup folder.)
pause
