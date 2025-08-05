#!/bin/bash
# Build script for Treatment Manager

echo "🔨 Building Treatment Manager Application..."

# Navigate to frontend and build (now uses relative paths)
echo "📦 Building frontend..."
cd frontend
npm run build

# Navigate to backend 
echo "🦀 Building backend..."
cd ../backend
cargo build --release

echo "✅ Build complete!"
echo ""
echo "🚀 Deployment Options:"
echo ""
echo "📍 Development (localhost only):"
echo "   cd backend"
echo "   ENVIRONMENT=development cargo run --release"
echo "   (Access: http://127.0.0.1:8080)"
echo ""
echo "🌐 Production (external access):"
echo "   cd backend"
echo "   ENVIRONMENT=production cargo run --release"
echo "   (Access: http://your-server-ip:8080)"
echo ""
echo "🔧 Custom configuration:"
echo "   SERVER_HOST=192.168.1.100 SERVER_PORT=3000 cargo run --release"
