@echo off
REM Development startup script - localhost only

echo 🔧 Starting Treatment Manager in DEVELOPMENT mode...
echo 📍 Server will be accessible on localhost only (127.0.0.1:8080)
echo.

cd backend
set ENVIRONMENT=development
set RUST_LOG=debug
cargo run
