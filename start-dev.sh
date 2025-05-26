#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Smart Timetable & Substitution Manager - Development Mode${NC}"
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    # Kill any existing processes
    pkill -f "node server.js" 2>/dev/null
    pkill -f "npm run dev" 2>/dev/null
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: backend and frontend directories not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Kill any existing processes
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
pkill -f "node server.js" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null
sleep 2

# Start backend server
echo -e "${GREEN}🔧 Starting Backend Server (Node.js/Express)...${NC}"
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend server is running on http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    exit 1
fi

# Start frontend server
echo -e "${GREEN}🎨 Starting Frontend Server (React/Vite)...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 5

echo ""
echo -e "${GREEN}🎉 Development servers started successfully!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}🔧 Backend:${NC}  http://localhost:3001"
echo -e "${BLUE}🏥 Health:${NC}   http://localhost:3001/api/health"
echo ""
echo -e "${YELLOW}📋 Demo Credentials:${NC}"
echo -e "   ${GREEN}Admin:${NC}   admin@university.edu / admin123"
echo -e "   ${GREEN}Faculty:${NC} jane.smith@university.edu / password123"
echo -e "   ${GREEN}Student:${NC} alice.johnson@student.edu / student123"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "   • Timetable deletion has been debugged and should work correctly"
echo "   • Check browser console for detailed logs during operations"
echo "   • Data persists to MongoDB - deletions are permanent"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop both servers${NC}"

# Wait for processes
wait 