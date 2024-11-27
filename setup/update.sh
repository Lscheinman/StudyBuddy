#!/bin/bash

# Exit on error
set -e

# Define directories
REPO_DIR="/root/StudyBuddy/frontend"
REACT_BUILD_DIR="$REPO_DIR/build"
NGINX_REACT_DIR="/var/www/html"
PYTHON_SERVICE="fastapi.service"

echo "Pulling latest changes from Git..."
cd $REPO_DIR
git pull

echo "Building React app..."
cd $REPO_DIR/react-app
npm install
npm run build

echo "Deploying React app to NGINX directory..."
rm -rf $NGINX_REACT_DIR/*
cp -r $REACT_BUILD_DIR/* $NGINX_REACT_DIR/

echo "Restarting Python app..."
sudo systemctl restart $PYTHON_SERVICE

echo "Reloading NGINX..."
sudo systemctl reload nginx

echo "Update completed successfully."
