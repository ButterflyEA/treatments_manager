# PowerShell Production startup script - external access

Write-Host "🚀 Starting Treatment Manager in PRODUCTION mode..." -ForegroundColor Green
Write-Host "🌐 Server will accept external connections (0.0.0.0:8080)" -ForegroundColor Yellow
Write-Host ""

Set-Location backend
$env:ENVIRONMENT = "production"
$env:RUST_LOG = "info"
cargo run --release
