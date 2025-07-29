#!/bin/bash

# MNIST CNN Builder - Cross-Platform Deployment Script
# Builds and deploys the project locally or to GitHub Pages

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

show_help() {
    echo ""
    echo -e "${CYAN}🚀 MNIST CNN Builder - Deployment Script${NC}"
    echo -e "${CYAN}==========================================${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC}"
    echo "  ./deploy.sh local   # Build for local testing"
    echo "  ./deploy.sh pages   # Deploy to GitHub Pages"
    echo "  ./deploy.sh help    # Show this help"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo "  ./deploy.sh local   # Builds and serves locally on http://localhost:3000"
    echo "  ./deploy.sh pages   # Builds and updates docs/ folder for GitHub Pages"
    echo ""
}

check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
    else
        echo -e "${RED}❌ Node.js not found. Please install Node.js from https://nodejs.org/${NC}"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo -e "${GREEN}✅ npm: v$NPM_VERSION${NC}"
    else
        echo -e "${RED}❌ npm not found. Please install npm.${NC}"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "cnn-builder/package.json" ]; then
        echo -e "${RED}❌ cnn-builder directory not found. Please run this script from the project root.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met!${NC}"
    echo ""
}

install_dependencies() {
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    cd cnn-builder
    
    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo -e "${GREEN}✅ Dependencies already installed${NC}"
    fi
    
    cd ..
}

build_application() {
    echo -e "${YELLOW}🏗️ Building application...${NC}"
    cd cnn-builder
    
    npm run build
    
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    cd ..
}

deploy_local() {
    echo -e "${YELLOW}🌐 Starting local development server...${NC}"
    cd cnn-builder
    
    echo ""
    echo -e "${CYAN}🎉 Starting React development server...${NC}"
    echo -e "${GREEN}📱 The app will open at: http://localhost:3000${NC}"
    echo -e "${GREEN}🔄 Hot reload is enabled - changes will auto-refresh${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
    echo ""
    
    npm start
    cd ..
}

deploy_pages() {
    echo -e "${YELLOW}📝 Deploying to GitHub Pages...${NC}"
    
    # Ensure docs/cnn-builder directory exists
    mkdir -p docs
    
    # Remove old build
    rm -rf docs/cnn-builder
    
    # Copy new build
    cp -r cnn-builder/build docs/cnn-builder
    
    echo -e "${GREEN}✅ Updated docs/cnn-builder with latest build${NC}"
    
    # Check if git is available and if we're in a git repo
    if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
        echo ""
        echo -e "${CYAN}📤 Git detected. You can now commit and push:${NC}"
        echo "  git add docs/cnn-builder"
        echo "  git commit -m \"🚀 Update React build\""
        echo "  git push origin main"
        echo ""
        echo -e "${GREEN}🌐 After pushing, your site will be available at:${NC}"
        echo -e "${BLUE}  https://yourusername.github.io/MNIST-CNN-Builder/docs/${NC}"
    else
        echo -e "${YELLOW}⚠️ Git not detected. Manually commit the docs/cnn-builder changes.${NC}"
    fi
}

show_post_build_info() {
    echo ""
    echo -e "${GREEN}🎉 Deployment Ready!${NC}"
    echo -e "${GREEN}====================${NC}"
    echo ""
    echo -e "${CYAN}Your MNIST CNN Builder is now ready for deployment!${NC}"
    echo ""
    echo -e "${YELLOW}📁 Project structure:${NC}"
    echo "  ├── docs/               # GitHub Pages deployment files"
    echo "  │   ├── index.html     # Main landing page"
    echo "  │   ├── cnn-builder/   # React app build"
    echo "  │   └── feature-map-visualizer/ # Feature visualizer"
    echo "  ├── cnn-builder/       # React source code"
    echo "  └── feature-map-visualizer/ # Standalone visualizer"
    echo ""
    echo -e "${YELLOW}🌐 Deployment options:${NC}"
    echo "  • GitHub Pages: Push to main branch (auto-deploys)"
    echo "  • Netlify: Drag docs/ folder to netlify.app/drop"
    echo "  • Vercel: Import from GitHub"
    echo "  • Firebase: firebase deploy"
    echo ""
    echo -e "${YELLOW}🔗 Live Demo:${NC}"
    echo "  https://asleshsura.github.io/MNIST-CNN-Builder/docs/"
    echo ""
}

# Main execution
clear
echo -e "${CYAN}🧠 MNIST CNN Builder - Deployment Script${NC}"
echo -e "${CYAN}=========================================${NC}"
echo ""

case "${1:-help}" in
    "local")
        check_prerequisites
        install_dependencies
        build_application
        deploy_local
        ;;
    "pages")
        check_prerequisites
        install_dependencies
        build_application
        deploy_pages
        show_post_build_info
        ;;
    "help"|*)
        show_help
        ;;
esac

echo ""
echo -e "${GREEN}✨ Done!${NC}"
