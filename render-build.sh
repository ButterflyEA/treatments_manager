#!/bin/bash
# Render.com build script

set -e  # Exit on any error

echo "🔨 Building Treatment Manager for Render deployment..."

# Install Node.js dependencies and build frontend
echo "📦 Building frontend..."
cd frontend
npm ci --only=production
npm run build
cd ..

# Build Rust backend
echo "🦀 Building Rust backend..."
cd backend
cargo build --release
cd ..

echo "✅ Build completed successfully!"
echo "📂 Frontend built to: backend/static/"
echo "🦀 Backend binary: backend/target/release/backend"
