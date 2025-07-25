# Removal script for duplicate files in MNIST-CNN-Builder project

Write-Host "Starting cleanup of duplicate files..." -ForegroundColor Green

# The docs directory files will be regenerated during GitHub Pages deployment
# So we can safely remove these duplicates

# Location variables
$projectRoot = 'c:\Users\SOLID\OneDrive\Desktop\Summer Projects\MNIST-CNN-Builder'
$docsFeatureMapDir = Join-Path $projectRoot 'docs\feature-map-visualizer'

# Check if directories exist
if (-Not (Test-Path $docsFeatureMapDir)) {
    Write-Host "Directory not found: $docsFeatureMapDir" -ForegroundColor Red
    exit 1
}

# List files to remove
$filesToRemove = @(
    (Join-Path $docsFeatureMapDir 'app.js'),
    (Join-Path $docsFeatureMapDir 'dense-activation-labels.css'),
    (Join-Path $docsFeatureMapDir 'feature-map-quality.css'),
    (Join-Path $docsFeatureMapDir 'text-fix.css')
)

# Remove each file
foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Write-Host "Removing duplicate file: $file" -ForegroundColor Yellow
        Remove-Item -Path $file -Force
    } else {
        Write-Host "File not found, skipping: $file" -ForegroundColor Gray
    }
}

Write-Host "Cleanup completed!" -ForegroundColor Green
Write-Host "The GitHub Actions workflow will regenerate these files during deployment" -ForegroundColor Cyan
