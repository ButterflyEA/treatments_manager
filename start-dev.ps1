# PowerShell Development startup script - localhost only

Write-Host "🔧 Starting Treatment Manager in DEVELOPMENT mode..." -ForegroundColor Cyan
Write-Host "📍 Server will be accessible on localhost only (127.0.0.1:8080)" -ForegroundColor Yellow
Write-Host ""

Set-Location backend
$env:ENVIRONMENT = "development"
$env:RUST_LOG = "debug"
cargo run
