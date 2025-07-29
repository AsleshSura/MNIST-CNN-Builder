# MNIST CNN Builder - Windows Deployment Script
# Builds and deploys the project locally or to GitHub Pages

param(
    [switch]$Local,
    [switch]$Pages,
    [switch]$Help
)

function Show-Help {
    Write-Host ""
    Write-Host "🚀 MNIST CNN Builder - Deployment Script" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 -Local   # Build for local testing"
    Write-Host "  .\deploy.ps1 -Pages   # Deploy to GitHub Pages"
    Write-Host "  .\deploy.ps1 -Help    # Show this help"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\deploy.ps1 -Local   # Builds and serves locally on http://localhost:3000"
    Write-Host "  .\deploy.ps1 -Pages   # Builds and updates docs/ folder for GitHub Pages"
    Write-Host ""
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ npm not found. Please install npm." -ForegroundColor Red
        exit 1
    }
    
    # Check if we're in the right directory
    if (-not (Test-Path "cnn-builder\package.json")) {
        Write-Host "❌ cnn-builder directory not found. Please run this script from the project root." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ All prerequisites met!" -ForegroundColor Green
    Write-Host ""
}

function Install-Dependencies {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    Set-Location "cnn-builder"
    
    if (-not (Test-Path "node_modules")) {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ Dependencies already installed" -ForegroundColor Green
    }
    
    Set-Location ".."
}

function Build-Application {
    Write-Host "🏗️ Building application..." -ForegroundColor Yellow
    Set-Location "cnn-builder"
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        Set-Location ".."
        exit 1
    }
    
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Set-Location ".."
}

function Deploy-Local {
    Write-Host "🌐 Starting local development server..." -ForegroundColor Yellow
    Set-Location "cnn-builder"
    
    Write-Host ""
    Write-Host "🎉 Starting React development server..." -ForegroundColor Cyan
    Write-Host "📱 The app will open at: http://localhost:3000" -ForegroundColor Green
    Write-Host "🔄 Hot reload is enabled - changes will auto-refresh" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    npm start
    Set-Location ".."
}

function Deploy-Pages {
    Write-Host "📝 Deploying to GitHub Pages..." -ForegroundColor Yellow
    
    # Ensure docs/cnn-builder directory exists
    if (-not (Test-Path "docs")) {
        New-Item -ItemType Directory -Path "docs"
    }
    
    # Remove old build
    if (Test-Path "docs\cnn-builder") {
        Remove-Item -Recurse -Force "docs\cnn-builder"
    }
    
    # Copy new build
    Copy-Item -Recurse "cnn-builder\build" "docs\cnn-builder"
    
    Write-Host "✅ Updated docs/cnn-builder with latest build" -ForegroundColor Green
    
    # Check if git is available and if we're in a git repo
    try {
        git status > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "📤 Git detected. You can now commit and push:" -ForegroundColor Cyan
            Write-Host "  git add docs/cnn-builder" -ForegroundColor White
            Write-Host "  git commit -m `"🚀 Update React build`"" -ForegroundColor White
            Write-Host "  git push origin main" -ForegroundColor White
            Write-Host ""
            Write-Host "🌐 After pushing, your site will be available at:" -ForegroundColor Green
            Write-Host "  https://yourusername.github.io/MNIST-CNN-Builder/docs/" -ForegroundColor Blue
        }
    } catch {
        Write-Host "⚠️ Git not detected. Manually commit the docs/cnn-builder changes." -ForegroundColor Yellow
    }
}

function Show-PostBuild-Info {
    Write-Host ""
    Write-Host "🎉 Deployment Ready!" -ForegroundColor Green
    Write-Host "====================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your MNIST CNN Builder is now ready for deployment!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📁 Project structure:" -ForegroundColor Yellow
    Write-Host "  ├── docs/               # GitHub Pages deployment files"
    Write-Host "  │   ├── index.html     # Main landing page"
    Write-Host "  │   ├── cnn-builder/   # React app build"
    Write-Host "  │   └── feature-map-visualizer/ # Feature visualizer"
    Write-Host "  ├── cnn-builder/       # React source code"
    Write-Host "  └── feature-map-visualizer/ # Standalone visualizer"
    Write-Host ""
    Write-Host "🌐 Deployment options:" -ForegroundColor Yellow
    Write-Host "  • GitHub Pages: Push to main branch (auto-deploys)"
    Write-Host "  • Netlify: Drag docs/ folder to netlify.app/drop"
    Write-Host "  • Vercel: Import from GitHub"
    Write-Host "  • Firebase: firebase deploy"
    Write-Host ""
    Write-Host "🔗 Live Demo:" -ForegroundColor Yellow
    Write-Host "  https://asleshsura.github.io/MNIST-CNN-Builder/docs/"
    Write-Host ""
}

# Main execution
Clear-Host
Write-Host "🧠 MNIST CNN Builder - Deployment Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($Help -or (-not $Local -and -not $Pages)) {
    Show-Help
    exit 0
}

Test-Prerequisites
Install-Dependencies
Build-Application

if ($Local) {
    Deploy-Local
} elseif ($Pages) {
    Deploy-Pages
    Show-PostBuild-Info
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
