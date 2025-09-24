#!/bin/bash

# Linux/Mac script to stop all Grocery Tracker services

echo ""
echo "========================================"
echo "   Grocery Tracker - Service Shutdown"
echo "========================================"
echo ""

echo "Stopping Node.js processes..."
if pkill -f "node.*app.js" 2>/dev/null; then
    echo "✅ Node.js processes stopped successfully"
else
    echo "ℹ️  No Node.js processes were running"
fi

echo ""
echo "Stopping nodemon processes..."
if pkill -f nodemon 2>/dev/null; then
    echo "✅ Nodemon processes stopped"
else
    echo "ℹ️  No nodemon processes were running"
fi

echo ""
echo "Checking for processes using port 3000..."
PORT_PID=$(lsof -t -i:3000 2>/dev/null)
if [ ! -z "$PORT_PID" ]; then
    echo "Killing process $PORT_PID on port 3000..."
    kill -9 $PORT_PID 2>/dev/null
    echo "✅ Port 3000 freed"
else
    echo "ℹ️  Port 3000 is not in use"
fi

echo ""
echo "Cleaning up any remaining grocery-tracker processes..."
pkill -f "grocery-tracker" 2>/dev/null

# Wait a moment for processes to fully terminate
sleep 1

echo ""
echo "========================================"
echo "   🛑 All Grocery Tracker services stopped"
echo "========================================"
echo ""
echo "You can now safely:"
echo "- Close your terminal"
echo "- Restart the application"
echo "- Shutdown your computer"
echo ""