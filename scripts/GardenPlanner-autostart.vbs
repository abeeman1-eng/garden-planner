' Launches the Garden Planner server supervisor completely hidden (no window).
' A copy of this file is placed in the Windows Startup folder so it runs at login.
Set sh = CreateObject("WScript.Shell")
sh.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""C:\Users\abeem\Documents\garden-planner\scripts\run-garden-server.ps1""", 0, False
