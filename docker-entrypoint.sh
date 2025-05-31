#!/bin/sh
set -e

echo "🚀 Starting Smart Timetable & Substitution Manager"

# Check if MongoDB is available
if [ -n "$MONGO_URI" ]; then
  echo "📊 Using provided MongoDB URI: $MONGO_URI"
  # Update the .env file with the provided MongoDB URI
  sed -i "s|MONGO_URI=.*|MONGO_URI=$MONGO_URI|g" /app/backend/.env
fi

# Check if JWT_SECRET is provided
if [ -n "$JWT_SECRET" ]; then
  echo "🔑 Using provided JWT Secret"
  # Update the .env file with the provided JWT_SECRET
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" /app/backend/.env
fi

# Start backend server
echo "🔧 Starting Backend Server (Node.js/Express)..."
cd /app/backend
node server.js &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null; then
  echo "✅ Backend server is running on http://localhost:$BACKEND_PORT"
else
  echo "❌ Backend server failed to start"
  exit 1
fi

# Start frontend server
echo "🎨 Starting Frontend Server..."
cd /app
serve -s frontend/dist -l $FRONTEND_PORT &
FRONTEND_PID=$!

echo ""
echo "🎉 Application started successfully!"
echo ""
echo "📱 Frontend: http://localhost:$FRONTEND_PORT"
echo "🔧 Backend:  http://localhost:$BACKEND_PORT"
echo "🏥 Health:   http://localhost:$BACKEND_PORT/api/health"
echo ""

# Keep the container running
wait $BACKEND_PID $FRONTEND_PID 