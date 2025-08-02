@echo off
REM Build script for Treatment Manager (Windows)

echo 🔨 Building Treatment Manager Application...

REM Navigate to frontend and build
echo 📦 Building frontend...
cd frontend
call npm run build

REM Navigate to backend 
echo 🦀 Building backend...
cd ..\backend
cargo build --release

echo ✅ Build complete!
echo.
echo 🚀 Deployment Options:
echo.
echo 📍 Development (localhost only):
echo    cd backend
echo    set ENVIRONMENT=development
echo    cargo run --release
echo    ^(Access: http://127.0.0.1:8080^)
echo.
echo 🌐 Production (external access):
echo    cd backend
echo    set ENVIRONMENT=production
echo    cargo run --release
echo    ^(Access: http://your-server-ip:8080^)
echo.
echo 🔧 Custom configuration:
echo    set SERVER_HOST=192.168.1.100
echo    set SERVER_PORT=3000
echo    cargo run --release
