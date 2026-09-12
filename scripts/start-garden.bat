@echo off
REM Manual launcher — double-click to start the server in a visible window.
REM (Normally the server auto-starts at login; use this only for testing.)
cd /d "C:\Users\abeem\Documents\garden-planner"
echo Starting Garden Planner...
echo Open http://localhost:3001  (or your Tailscale link) in a browser.
echo Close this window or press Ctrl+C to stop the server.
echo.
"C:\Program Files\nodejs\node.exe" server\src\index.js
pause
