@echo off
REM Shows the current public link and opens it in your browser.
set "URLFILE=C:\Users\abeem\Documents\garden-planner\scripts\tunnel-url.txt"
if not exist "%URLFILE%" (
  echo No link yet. Make sure the app + tunnel are running ^(log in, or run start-garden.bat^).
  pause
  goto :eof
)
set /p URL=<"%URLFILE%"
echo.
echo   Your public Garden Planner link:
echo.
echo       %URL%
echo.
echo   Share that link. NOTE: it changes whenever the tunnel restarts or the PC reboots,
echo   so grab the latest one here after a restart.
echo.
start "" "%URL%"
pause
