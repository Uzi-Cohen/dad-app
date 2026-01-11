#!/bin/bash

echo "🔧 Setting up Fashion Content Studio Database"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed"
    echo "Please install PostgreSQL first:"
    echo "  brew install postgresql@15"
    exit 1
fi

echo "✅ PostgreSQL is installed"

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL is not running"
    echo "Starting PostgreSQL..."
    brew services start postgresql@15
    sleep 2
fi

echo "✅ PostgreSQL is running"
echo ""

# Create database and user
echo "📦 Creating database..."
psql postgres << EOF
-- Drop if exists (for clean setup)
DROP DATABASE IF EXISTS fashion_studio;
DROP USER IF EXISTS fashion_user;

-- Create user
CREATE USER fashion_user WITH PASSWORD 'fashionpass123';

-- Create database
CREATE DATABASE fashion_studio OWNER fashion_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fashion_studio TO fashion_user;

\c fashion_studio
GRANT ALL ON SCHEMA public TO fashion_user;

\q
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
else
    echo "❌ Failed to create database"
    exit 1
fi

echo ""
echo "🔧 Updating .env file..."

# Update DATABASE_URL in .env
if [ -f .env ]; then
    sed -i.bak 's|DATABASE_URL=.*|DATABASE_URL="postgresql://fashion_user:fashionpass123@localhost:5432/fashion_studio?schema=public"|' .env
    echo "✅ .env updated"
else
    echo "❌ .env file not found"
    exit 1
fi

echo ""
echo "📊 Pushing database schema..."
npm run db:push

echo ""
echo "👤 Creating default users..."
npm run db:init

echo ""
echo "🎉 Setup complete!"
echo ""
echo "You can now:"
echo "  1. Start the dev server: npm run dev"
echo "  2. Start the worker: npm run worker"
echo "  3. Open http://localhost:3000"
echo "  4. Login with: owner@fashion-studio.local / fashion123"
echo ""
