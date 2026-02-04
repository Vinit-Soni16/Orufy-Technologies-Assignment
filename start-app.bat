@echo off
echo Starting Orufy Assignment App...

cd Backend
start "Backend Server" cmd /k "npm run dev"
cd ..

cd Frontend
start "Frontend Client" cmd /k "npm run dev"
cd ..

echo App started! Backend: http://localhost:5000, Frontend: http://localhost:5173
pause
