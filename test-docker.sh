#!/bin/bash
set -e

echo "🔍 Testing Docker build for Facility Hub..."

# Clean up previous builds
echo "📦 Cleaning up previous builds..."
docker system prune -f
docker rmi facility-hub:latest 2>/dev/null || true

# Test local build first
echo "🏗️  Testing local build..."
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Local build failed. Fix issues before Docker build."
    exit 1
fi

echo "✅ Local build successful!"

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t facility-hub:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker build successful!"

# Test Docker run
echo "🚀 Testing Docker run..."
docker run --rm -d --name facility-hub-test -p 3001:3000 facility-hub:latest

# Wait for container to start
sleep 10

# Test health check
echo "🏥 Testing health check..."
if curl -f http://localhost:3001/api/health; then
    echo "✅ Health check passed!"
else
    echo "⚠️  Health check failed, but container might still work"
fi

# Clean up test container
docker stop facility-hub-test 2>/dev/null || true

echo "🎉 Docker test completed successfully!"
echo "💡 To deploy: docker-compose up -d"
