#!/bin/bash

# Chat System Deployment Script
# This script deploys the Firestore security rules for the chat system

echo "🚀 Deploying Chat System..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null