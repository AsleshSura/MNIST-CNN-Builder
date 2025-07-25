@echo off
echo =====================================================
echo    CNN Feature Map Visualizer - Quick Start Test
echo =====================================================
echo.
echo Starting local testing...
echo.

REM Check if Python is available for local server
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting Python HTTP server on port 8080...
    echo Open your browser to: http://localhost:8080/feature-map-visualizer/
    echo.
    echo Press Ctrl+C to stop the server
    echo =====================================================
    cd /d "c:\Users\SOLID\OneDrive\Desktop\Summer Projects\MNIST-CNN-Builder"
    python -m http.server 8080
) else (
    echo Python not found. Opening file directly in browser...
    echo File location: file:///c:/Users/SOLID/OneDrive/Desktop/Summer Projects/MNIST-CNN-Builder/feature-map-visualizer/index.html
    echo.
    echo If TensorFlow.js doesn't load properly, try:
    echo 1. Install Python and run this script again for local server
    echo 2. Or use Live Server extension in VS Code
    echo =====================================================
    start "" "file:///c:/Users/SOLID/OneDrive/Desktop/Summer Projects/MNIST-CNN-Builder/feature-map-visualizer/index.html"
)

pause
