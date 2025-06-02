#!/bin/bash

# Smart Timetable & Substitution Manager Deployment Helper
# This script helps prepare the project for deployment to Vercel and Render

echo "🚀 Smart Timetable & Substitution Manager Deployment Helper"
echo "=========================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI globally..."
    npm install -g vercel
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ frontend directory not found!"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ backend directory not found!"
    exit 1
fi

# Create necessary deployment files if they don't exist
echo "📝 Checking deployment configuration files..."

# Vercel configuration file
if [ ! -f "frontend/vercel.json" ]; then
    echo "  ✍️ Creating frontend/vercel.json..."
    cat > frontend/vercel.json << EOF
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://smart-timetable-backend.onrender.com/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=1, stale-while-revalidate=59"
        }
      ]
    }
  ]
}
EOF
    echo "  ✅ Created frontend/vercel.json"
fi

# Render configuration file
if [ ! -f "backend/render.yaml" ]; then
    echo "  ✍️ Creating backend/render.yaml..."
    cat > backend/render.yaml << EOF
services:
  - type: web
    name: smart-timetable-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        sync: false
    autoDeploy: true
EOF
    echo "  ✅ Created backend/render.yaml"
fi

# Ask for deployment
echo ""
echo "📊 Deployment Options:"
echo "1. Deploy frontend to Vercel"
echo "2. Deploy backend to Render"
echo "3. Exit"
read -p "Please select an option (1-3): " option

case $option in
    1)
        echo "🌐 Deploying frontend to Vercel..."
        cd frontend
        vercel
        ;;
    2)
        echo "🖥️ For backend deployment to Render:"
        echo "1. Sign in to your Render account at https://dashboard.render.com"
        echo "2. Click 'New' > 'Web Service'"
        echo "3. Connect your GitHub repository"
        echo "4. Specify 'backend' as the root directory"
        echo "5. Set build command: npm install"
        echo "6. Set start command: npm start"
        echo "7. Add environment variables:"
        echo "   - MONGO_URI (your MongoDB connection string)"
        echo "   - JWT_SECRET (a secure random string)"
        echo "   - NODE_ENV=production"
        echo ""
        echo "🔗 Open Render dashboard now? (y/n)"
        read -p "" open_render
        if [[ $open_render == "y" || $open_render == "Y" ]]; then
            if command -v open &> /dev/null; then
                open "https://dashboard.render.com"
            elif command -v xdg-open &> /dev/null; then
                xdg-open "https://dashboard.render.com"
            else
                echo "Please visit https://dashboard.render.com in your browser"
            fi
        fi
        ;;
    3)
        echo "👋 Exiting deployment helper"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac

echo ""
echo "✅ Deployment preparation complete!"
echo "📚 For detailed instructions, refer to DEPLOYMENT.md" 