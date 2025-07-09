#!/bin/bash

# Stop and remove all containers
docker-compose down -v --rmi all

# Cleanup Docker artifacts
docker system prune -a -f
docker volume prune -f
docker network prune -f

# Remove existing build files
rm -rf backend/build/
rm -rf frontend/.next/
rm -rf frontend/node_modules/

# Rebuild and start fresh
docker-compose up --build -d


# Make it executable
# chmod +x clean-start.sh