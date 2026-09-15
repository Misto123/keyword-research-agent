#!/bin/bash

# Quick start script for keyword research agent

if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "✏️  Please edit .env with your API keys, then run this script again."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "🔬 Keyword Research Agent"
    echo ""
    echo "Usage: ./run.sh <niche> [country] [language] [depth] [publish]"
    echo ""
    echo "Examples:"
    echo "  ./run.sh \"organic dog food\""
    echo "  ./run.sh \"keto diet\" US en exhaustive"
    echo "  ./run.sh \"natural soap\" GB en standard publish"
    echo ""
    echo "Depth options: quick, standard, exhaustive"
    echo "Add 'publish' to auto-publish to production"
    exit 0
fi

# Run the tool
echo "🚀 Starting research for: $1"
node src/index.js "$@"
