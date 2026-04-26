@echo off
echo 🚀 Starting Hornvin Automobile Admin Ecosystem...

:: Kill any existing node processes on port 5000
echo 🧹 Clearing Port 5000...
powershell -Command "Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }" 2>nul

:: Start Backend in a new window
echo 📦 Starting Backend Server...
start "Hornvin Backend" cmd /k "cd backend && npm run dev"

:: Start Frontend in a new window
echo 🎨 Starting Flutter Frontend (Chrome)...
start "Hornvin Frontend" cmd /k "cd frontend && flutter run -d chrome"

echo ✅ Both processes are launching. 
echo 💡 If you see an error in the windows, please let me know!
pause
