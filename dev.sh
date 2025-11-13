#!/bin/bash

# Development Helper Script for My List Feature

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}My List Feature - Development Helper${NC}"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not installed. Installing..."
    npm install
fi

# Main menu
echo "What would you like to do?"
echo "1) Install dependencies"
echo "2) Seed database with sample data"
echo "3) Start development server"
echo "4) Run tests"
echo "5) Run integration tests"
echo "6) Build for production"
echo "7) Start with Docker"
echo "8) Stop Docker containers"
echo "9) Clean database and reseed"
echo "10) View logs (Docker)"
echo "0) Exit"
echo ""

read -p "Enter your choice [0-10]: " choice

case $choice in
    1)
        print_info "Installing dependencies..."
        npm install
        print_info "Done!"
        ;;
    2)
        print_info "Seeding database..."
        npm run seed
        print_info "Database seeded successfully!"
        ;;
    3)
        print_info "Starting development server..."
        npm run start:dev
        ;;
    4)
        print_info "Running tests..."
        npm run test
        ;;
    5)
        print_info "Running integration tests..."
        npm run test:e2e
        ;;
    6)
        print_info "Building for production..."
        npm run build
        print_info "Build complete! Output in dist/"
        ;;
    7)
        print_info "Starting with Docker..."
        docker-compose up -d
        print_info "Waiting for service to start..."
        sleep 5
        print_info "Service started! Access at http://localhost:3000"
        print_warning "Run: docker-compose exec mylist-api npm run seed (to seed data)"
        ;;
    8)
        print_info "Stopping Docker containers..."
        docker-compose down
        print_info "Containers stopped!"
        ;;
    9)
        print_info "Cleaning database..."
        rm -f mylist.db
        print_info "Reseeding database..."
        npm run seed
        print_info "Done!"
        ;;
    10)
        print_info "Viewing Docker logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;
    0)
        print_info "Goodbye!"
        exit 0
        ;;
    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac
