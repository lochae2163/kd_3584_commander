#!/bin/bash

echo "================================================"
echo "  ROK Commander Calculator - Quick Start"
echo "================================================"
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "WARNING: MongoDB doesn't seem to be running!"
    echo "Please start MongoDB first with: brew services start mongodb-community"
    echo ""
fi

# Start backend
echo "Starting backend server..."
cd "$(dirname "$0")/backend"
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd "$(dirname "$0")/frontend"
npm start &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo "  Application Started!"
echo "================================================"
echo ""
echo "Backend API: http://localhost:5000"
echo "Frontend:    http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
