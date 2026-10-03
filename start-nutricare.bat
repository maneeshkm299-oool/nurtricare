@echo off
title NutriCare Launcher
echo ========================================================
echo           Starting NutriCare Full-Stack App
echo ========================================================
echo.

set PATH=C:\Program Files\nodejs;C:\Program Files (x86)\cloudflared;%PATH%

echo [1/3] Starting Backend Server on http://localhost:5000...
start "NutriCare Backend" cmd /k "cd /d C:\Users\MANEESH\.gemini\antigravity\scratch\nutricare\server && npx.cmd tsx src/index.ts"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend Server on http://localhost:5173...
start "NutriCare Frontend" cmd /k "cd /d C:\Users\MANEESH\.gemini\antigravity\scratch\nutricare\client && npx.cmd vite --host"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Cloudflare Mobile Tunnel...
start "NutriCare Public Tunnel" cmd /k "title NutriCare Public URL && \"C:\Program Files (x86)\cloudflared\cloudflared.exe\" tunnel --url http://localhost:5173"

echo.
echo ========================================================
echo  All services started!
echo.
echo  PC Browser:      http://localhost:5173
echo  Same Wi-Fi Phone: Check your PC IP (e.g. http://172.20.254.251:5173)
echo  Public URL:      Check the 'NutriCare Public URL' window!
echo.
echo  Demo Email:     demo@nutricare.com
echo  Demo Password:  Password123!
echo ========================================================
pause
