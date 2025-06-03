#!/bin/sh
set -e

echo "🚀 Starting Smart Timetable & Substitution Manager"

# Check if MongoDB is available
if [ -n "$MONGO_URI" ]; then
  echo "📊 Using provided MongoDB URI: $MONGO_URI"
  # Update the .env file with the provided MongoDB URI
  sed -i "s|MONGO_URI=.*|MONGO_URI=$MONGO_URI|g" /app/backend/.env
else
  echo "⚠️ No MongoDB URI provided, using default configuration"
fi

# Check if JWT_SECRET is provided
if [ -n "$JWT_SECRET" ]; then
  echo "🔑 Using provided JWT Secret"
  # Update the .env file with the provided JWT_SECRET
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" /app/backend/.env
else
  echo "⚠️ No JWT_SECRET provided, using default value (not recommended for production)"
fi

# Check server.js location
SERVER_JS_PATH="/app/backend/server.js"
if [ ! -f "$SERVER_JS_PATH" ]; then
  # Check if it's in the src directory
  if [ -f "/app/backend/src/server.js" ]; then
    SERVER_JS_PATH="/app/backend/src/server.js"
    echo "🔍 Found server.js in src directory"
  else
    echo "❌ Could not find server.js in expected locations"
    echo "Locations checked:"
    echo "- /app/backend/server.js"
    echo "- /app/backend/src/server.js"
    ls -la /app/backend
    exit 1
  fi
fi

# Start backend server
echo "🔧 Starting Backend Server (Node.js/Express)..."
cd /app/backend
node $SERVER_JS_PATH &
BACKEND_PID=$!

# Wait for backend to start - more robust checking
echo "⏳ Waiting for backend to start..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:$BACKEND_PORT"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT+1))
  echo "⏳ Waiting for backend to start... (Attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 1
  
  # Check if process is still running
  if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend server process terminated unexpectedly"
    exit 1
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Backend server failed to start after $MAX_RETRIES attempts"
  echo "🔍 Backend server logs:"
  cat /app/backend/logs/server.log 2>/dev/null || echo "No logs available"
  exit 1
fi

# Start frontend server
echo "🎨 Starting Frontend Server..."
cd /app
serve -s frontend/dist -l $FRONTEND_PORT &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 2
echo ""
echo "🎉 Application started successfully!"
echo ""
echo "📱 Frontend: http://localhost:$FRONTEND_PORT"
echo "🔧 Backend:  http://localhost:$BACKEND_PORT"
echo "🏥 Health:   http://localhost:$BACKEND_PORT/api/health"
echo ""

# Set trap to handle shutdown gracefully
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' SIGTERM SIGINT

# Keep the container running
wait $BACKEND_PID $FRONTEND_PID 