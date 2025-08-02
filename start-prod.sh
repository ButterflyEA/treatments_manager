#!/bin/bash
# Production startup script - external access

echo "🚀 Starting Treatment Manager in PRODUCTION mode..."
echo "🌐 Server will accept external connections (0.0.0.0:8080)"
echo ""

cd backend
ENVIRONMENT=production RUST_LOG=info cargo run --release
