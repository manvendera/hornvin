@echo off
echo Starting Hornvin Distributor Panel...

:: Kill any existing node processes on port 5000
echo Clearing Port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /PID %%a /F 2>nul
powershell -Command "Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }" 2>nul

:: Start Backend in a new window
echo Starting Backend Server...
start "Hornvin Backend" cmd /k "cd backend && npm run dev"

:: Start Distributor Panel in a new window
echo Starting Distributor Panel (Chrome)...
if exist distributor (
    start "Hornvin Distributor" cmd /k "cd distributor && flutter run -d chrome"
) else (
    echo Error: 'distributor' directory not found!
)

echo Processes are launching. 
echo Please ensure backend is running before logging in.
pause
