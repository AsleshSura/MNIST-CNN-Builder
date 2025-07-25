// Canvas Rendering Quality Fix
document.addEventListener('DOMContentLoaded', function() {
    console.log('Canvas rendering quality fix applied');
    
    // Apply ultra-crisp rendering to all canvases (run multiple times)
    function applyCanvasCrispRendering() {
        const allCanvases = document.querySelectorAll('canvas');
        
        allCanvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Disable all smoothing
                ctx.imageSmoothingEnabled = false;
                ctx.mozImageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.msImageSmoothingEnabled = false;
                
                // Apply additional crisp styles
                canvas.style.imageRendering = 'pixelated';
                canvas.style.imageRendering = '-moz-crisp-edges';
                canvas.style.imageRendering = 'crisp-edges';
                canvas.style.msInterpolationMode = 'nearest-neighbor';
                
                // Add special class for CSS targeting
                canvas.classList.add('crisp-render');
            }
        });
    }
    
    // Run immediately
    applyCanvasCrispRendering();
    
    // Run again after a delay to catch dynamically created canvases
    setTimeout(applyCanvasCrispRendering, 1000);
    
    // Create MutationObserver to watch for new canvases being added
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                applyCanvasCrispRendering();
            }
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
