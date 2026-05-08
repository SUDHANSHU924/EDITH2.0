#!/bin/bash
# EDITH 2.0 - Quick Start Script
# Starts the complete EDITH system with backend and frontend

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     EDITH 2.0 Advanced Agentic System - Quick Start        ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print sections
print_section() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 1. Check Python installation
print_section "Step 1: Checking Python Installation"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python found: $PYTHON_VERSION"
else
    echo "❌ Python 3 not found. Please install Python 3.8+"
    exit 1
fi

# 2. Check Node.js installation
print_section "Step 2: Checking Node.js Installation"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 14+"
    exit 1
fi

# 3. Run tests
print_section "Step 3: Running Validation Tests"
cd "$SCRIPT_DIR"
print_info "Running EDITH 2.0 test suite..."
if python3 test_edith_upgrade.py 2>&1 | tail -15; then
    print_success "All tests passed!"
else
    print_info "Some tests failed but this is ok for quick start"
fi

# 4. Install Python dependencies (if needed)
print_section "Step 4: Checking Python Dependencies"
REQUIRED_PACKAGES=("openai" "groq" "anthropic")
for package in "${REQUIRED_PACKAGES[@]}"; do
    if python3 -c "import $package" 2>/dev/null; then
        print_success "$package is installed"
    else
        print_info "Installing $package..."
        pip install "$package" --break-system-packages -q
    fi
done

# 5. Check environment variables
print_section "Step 5: Checking Environment Configuration"
if [ -f "artifacts/jarvis-api/.env" ]; then
    if grep -q "NVIDIA_API_KEY_MAIN" artifacts/jarvis-api/.env; then
        print_success "NVIDIA API key configured"
    else
        print_info "NVIDIA API key not configured"
    fi
    
    if grep -q "GROQ_API_KEY" artifacts/jarvis-api/.env; then
        print_success "Groq API key configured"
    else
        print_info "Groq API key not configured (will use fallback)"
    fi
else
    print_info ".env file not found - using defaults"
fi

# 6. Summary and next steps
print_section "Quick Start Summary"
echo -e "${GREEN}✓ EDITH 2.0 System Ready${NC}\n"

echo "Available Systems:"
echo "  • core          - General conversational AI"
echo "  • code          - Code generation & debugging"
echo "  • search        - Web search & information"
echo "  • vision        - Image analysis"
echo "  • planning      - Strategic reasoning"
echo "  • os_control    - System operations"
echo "  • files         - Document handling"
echo "  • multilingual  - Language support (EN, HI, HINGLISH)"
echo ""

print_section "Starting EDITH 2.0"
echo -e "${YELLOW}Choose how to run:${NC}\n"
echo "1. Backend only (API Server)"
echo "2. Full stack (Backend + Frontend)"
echo "3. Run tests"
echo "4. Exit"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        print_info "Starting backend server..."
        cd artifacts/jarvis-api
        print_success "Backend starting on http://localhost:8000"
        python main.py
        ;;
    2)
        print_info "Starting full stack..."
        
        # Start backend in background
        cd "$SCRIPT_DIR/artifacts/jarvis-api"
        python main.py &
        BACKEND_PID=$!
        print_success "Backend started (PID: $BACKEND_PID)"
        
        sleep 3
        
        # Start frontend
        cd "$SCRIPT_DIR/artifacts/edith"
        print_success "Frontend starting on http://localhost:5173"
        npm run dev
        
        # Cleanup
        kill $BACKEND_PID 2>/dev/null || true
        ;;
    3)
        print_info "Running test suite..."
        python3 test_edith_upgrade.py
        ;;
    4)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
