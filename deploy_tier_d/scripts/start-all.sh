#!/bin/bash

# Tier'd Comprehensive Startup Script
# This script starts the application and all monitoring/testing tools

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       Tier'd Comprehensive Startup     ${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if necessary tools are installed
command -v osascript >/dev/null 2>&1 || {
  echo -e "${YELLOW}This script uses osascript to open terminal windows and is designed for macOS.${NC}"
  echo -e "${YELLOW}For other operating systems, please run the commands manually.${NC}"
  echo
  echo -e "Commands to run:"
  echo -e "1. ${CYAN}npm run dev${NC} - Start the development server"
  echo -e "2. ${CYAN}npm run monitor${NC} - Start the system monitor"
  echo -e "3. ${CYAN}npm run bot:light${NC} - Start the activity bot"
  exit 1
}

# Function to open a new terminal window with a command
open_terminal() {
  local title=$1
  local command=$2
  
  osascript <<EOF
    tell application "Terminal"
      do script "cd '$(pwd)' && echo -e '\\033[0;34m$title\\033[0m' && $command"
      set custom title of front window to "$title"
    end tell
EOF
}

# Run pre-build check first
echo -e "${BLUE}Running pre-build check...${NC}"
npm run pre-build-check

if [ $? -ne 0 ]; then
  echo -e "${RED}Pre-build check failed. Please fix the issues before starting the system.${NC}"
  exit 1
fi

# Start development server
echo -e "${BLUE}Starting development server...${NC}"
open_terminal "Tier'd Server" "npm run dev"
sleep 5 # Wait for server to start

# Start system monitor
echo -e "${BLUE}Starting system monitor...${NC}"
open_terminal "Tier'd Monitor" "npm run monitor"
sleep 2

# Start activity bot
echo -e "${BLUE}Starting activity bot...${NC}"
open_terminal "Tier'd Bot" "npm run bot:light"
sleep 2

# Check if server is up
echo -e "${BLUE}Checking if server is up...${NC}"
curl -s http://localhost:3000/api/health-check > /dev/null
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Server is up and running!${NC}"
else
  echo -e "${YELLOW}Waiting for server to start...${NC}"
  sleep 5
  curl -s http://localhost:3000/api/health-check > /dev/null
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Server is now up and running!${NC}"
  else
    echo -e "${RED}Server failed to start within the expected time.${NC}"
    echo -e "${YELLOW}Please check the server terminal for errors.${NC}"
  fi
fi

# Open browser if server is up
if curl -s http://localhost:3000/api/health-check > /dev/null; then
  echo -e "${BLUE}Opening browser...${NC}"
  open http://localhost:3000
fi

echo
echo -e "${GREEN}Tier'd system is now starting up!${NC}"
echo -e "${YELLOW}The following components have been started:${NC}"
echo -e "• Development Server (http://localhost:3000)"
echo -e "• System Monitor"
echo -e "• Activity Bot (light mode)"
echo
echo -e "${YELLOW}Additional tools you can run:${NC}"
echo -e "• ${CYAN}npm run stress-test:light${NC} - Run a light stress test"
echo -e "• ${CYAN}npm run health-check${NC} - Run a health check"
echo -e "• ${CYAN}npm run bot:heavy${NC} - Start a more aggressive activity bot"
echo
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}       Tier'd System Started           ${NC}"
echo -e "${BLUE}========================================${NC}" 