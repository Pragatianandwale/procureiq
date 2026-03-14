#!/bin/bash

echo "=========================================="
echo "ProcureIQ Replit Deployment Script"
echo "=========================================="
echo ""

# Step 1: Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found"
    echo "Please run this script from the procureiq/ directory"
    exit 1
fi

echo "✓ Found requirements.txt"
echo ""

# Step 2: Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
OPENWEATHER_API_KEY=your_openweather_key_here
EXCHANGERATE_API_KEY=your_exchangerate_key_here
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
EOF
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi
echo ""

# Step 3: Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt --quiet
echo "✓ Python dependencies installed"
echo ""

# Step 4: Install Node dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install --silent
cd ..
echo "✓ Node.js dependencies installed"
echo ""

echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo "1. Terminal 1: cd backend && python main.py"
echo "2. Terminal 2: cd frontend && npm run dev"
echo ""
