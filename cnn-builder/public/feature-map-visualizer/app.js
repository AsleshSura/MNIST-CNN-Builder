// Global variables
let model = null;
let inputImage = null;
let selectedLayer = null;
let layers = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('CNN Feature Map Visualizer loaded');
    initializeApp();
});

// Wait for everything to load
window.addEventListener('load', async function() {
    console.log('Page loaded, waiting for TensorFlow.js...');
    
    // Wait for TensorFlow.js with multiple attempts
    let attempts = 0;
    while (typeof tf === 'undefined' && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 250));
        attempts++;
    }
    
    if (typeof tf === 'undefined') {
        console.error('❌ TensorFlow.js failed to load');
        showStatus('❌ TensorFlow.js failed to load. Please refresh the page.');
        return;
    }
    
    console.log('✅ TensorFlow.js loaded successfully:', tf.version);
    console.log('🚀 Backend:', tf.getBackend());
    
    // Update status to show ready
    showStatus('✅ TensorFlow.js loaded. Click "Load Demo CNN" to start.');
});

function initializeApp() {
    // Set up file input event listeners
    const modelFileInput = document.getElementById('model-file');
    const imageFileInput = document.getElementById('image-file');
    
    if (modelFileInput) {
        modelFileInput.addEventListener('change', loadCustomModel);
    }
    
    if (imageFileInput) {
        imageFileInput.addEventListener('change', loadCustomImage);
    }
    
    console.log('App event listeners initialized');
}

// Clean up resources before page unload
window.addEventListener('beforeunload', function() {
    cleanupResources();
});

function cleanupResources() {
    try {
        if (model && !model.isDisposedInternal) {
            model.dispose();
            console.log('Model disposed');
        }
        if (inputImage && !inputImage.isDisposed) {
            inputImage.dispose();
            console.log('Input image disposed');
        }
        // Clean up TensorFlow.js memory
        tf.engine().endScope();
    } catch (e) {
        console.warn('Error during cleanup:', e.message);
    }
}

// Create a demo CNN model
async function createDemoModel() {
    const demoModel = tf.sequential({
        layers: [
            tf.layers.conv2d({
                inputShape: [28, 28, 1],
                filters: 8,
                kernelSize: 3,
                activation: 'relu',
                name: 'conv2d_1'
            }),
            tf.layers.maxPooling2d({
                poolSize: 2,
                name: 'max_pooling2d_1'
            }),
            tf.layers.conv2d({
                filters: 16,
                kernelSize: 3,
                activation: 'relu',
                name: 'conv2d_2'
            }),
            tf.layers.maxPooling2d({
                poolSize: 2,
                name: 'max_pooling2d_2'
            }),
            tf.layers.flatten({
                name: 'flatten'
            }),
            tf.layers.dense({
                units: 64,
                activation: 'relu',
                name: 'dense_1'
            }),
            tf.layers.dense({
                units: 10,
                activation: 'softmax',
                name: 'output'
            })
        ]
    });

    demoModel.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    return demoModel;
}

// Generate a demo image (28x28 with some patterns)
function generateDemoImage() {
    const imageData = new Float32Array(28 * 28);
    
    // Create a simple pattern - diagonal lines and some noise
    for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 28; j++) {
            const idx = i * 28 + j;
            
            // Diagonal lines
            if (Math.abs(i - j) < 3 || Math.abs(i - (27 - j)) < 3) {
                imageData[idx] = 1.0;
            }
            // Add some random noise
            else if (Math.random() > 0.85) {
                imageData[idx] = Math.random() * 0.6;
            }
            // Background
            else {
                imageData[idx] = 0.1 * Math.random();
            }
        }
    }
    
    return tf.tensor4d(imageData, [1, 28, 28, 1]);
}

// Load demo model - GLOBAL function for onclick
async function loadDemoModel() {
    try {
        showStatus('Creating demo CNN model...', true);
        
        // Clean up existing model
        if (model && !model.isDisposedInternal) {
            try {
                model.dispose();
            } catch (e) {
                console.warn('Model already disposed:', e.message);
            }
        }
        
        // Wait for TensorFlow.js to be ready
        await tf.ready();
        console.log('TensorFlow.js backend:', tf.getBackend());
        
        model = await createDemoModel();
        
        // Extract layer information with error handling
        layers = model.layers.map((layer, index) => {
            try {
                return {
                    name: layer.name,
                    index,
                    shape: layer.outputShape,
                    type: layer.getClassName()
                };
            } catch (e) {
                console.warn(`Error processing layer ${index}:`, e);
                return {
                    name: `layer_${index}`,
                    index,
                    shape: null,
                    type: 'Unknown'
                };
            }
        });
        
        displayModelInfo();
        displayLayers();
        
        // Enable image loading
        const demoImageBtn = document.getElementById('demo-image-btn');
        const imageFileInput = document.getElementById('image-file');
        
        if (demoImageBtn) {
            demoImageBtn.disabled = false;
        }
        if (imageFileInput) {
            imageFileInput.disabled = false;
        }
        
        showStatus('Demo model loaded successfully! Now load an image.');
        
    } catch (error) {
        console.error('Error loading demo model:', error);
        showStatus('Error loading demo model: ' + error.message);
        
        // Clean up on error
        if (model && !model.isDisposedInternal) {
            try {
                model.dispose();
            } catch (e) {
                console.warn('Error disposing model after failure:', e.message);
            }
        }
        model = null;
    }
}

// Load custom model from file
async function loadCustomModel(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        showStatus('Loading custom model...', true);
        
        // Only dispose if model exists and hasn't been disposed already
        if (model && !model.isDisposedInternal) {
            try {
                model.dispose();
            } catch (e) {
                console.warn('Model already disposed:', e.message);
            }
        }
        
        // For custom models, we'd need both the model.json and weights files
        // This is a simplified version - in practice you'd need proper file handling
        const text = await file.text();
        const modelConfig = JSON.parse(text);
        
        // This would require the weights file too
        showStatus('Custom model loading requires both model.json and weights files. Please use the demo model for now.');
        
    } catch (error) {
        console.error('Error loading custom model:', error);
        showStatus('Error loading custom model: ' + error.message);
    }
}

// Load demo image - GLOBAL function for onclick
async function loadDemoImage() {
    try {
        showStatus('Generating demo image...', true);
        
        // Clean up existing image
        if (inputImage && !inputImage.isDisposed) {
            try {
                inputImage.dispose();
            } catch (e) {
                console.warn('Input image already disposed:', e.message);
            }
        }
        
        inputImage = generateDemoImage();
        
        // Display the image
        await displayInputImage();
        
        // Update layer list to enable selection
        displayLayers();
        
        showStatus('Demo image loaded! Now select a layer to visualize.');
        
    } catch (error) {
        console.error('Error loading demo image:', error);
        showStatus('Error loading demo image: ' + error.message);
        
        // Clean up on error
        if (inputImage && !inputImage.isDisposed) {
            try {
                inputImage.dispose();
            } catch (e) {
                console.warn('Error disposing input image after failure:', e.message);
            }
        }
        inputImage = null;
    }
}

// Load custom image from file
async function loadCustomImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        showStatus('Processing image...', true);
        
        const img = new Image();
        img.onload = function() {
            // Create canvas to process the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Resize to 28x28 and convert to grayscale
            canvas.width = 28;
            canvas.height = 28;
            ctx.drawImage(img, 0, 0, 28, 28);
            
            const imageData = ctx.getImageData(0, 0, 28, 28);
            const data = imageData.data;
            
            // Convert to grayscale and normalize
            const tensor = tf.browser.fromPixels(canvas, 1);
            const resized = tensor.div(255.0);
            const batched = resized.expandDims(0);
            
            // Only dispose if inputImage exists and hasn't been disposed already
            if (inputImage && !inputImage.isDisposed) {
                try {
                    inputImage.dispose();
                } catch (e) {
                    console.warn('Input image already disposed:', e.message);
                }
            }
            
            inputImage = batched;
            tensor.dispose();
            resized.dispose();
            
            // Display the processed image
            displayInputImage();
            
            // Update layer list to enable selection
            displayLayers();
            
            showStatus('Image loaded! Now select a layer to visualize.');
        };
        
        img.src = URL.createObjectURL(file);
        
    } catch (error) {
        console.error('Error loading custom image:', error);
        showStatus('Error loading custom image: ' + error.message);
    }
}

// Display model information
function displayModelInfo() {
    const modelInfo = document.getElementById('model-info');
    if (modelInfo) {
        modelInfo.style.display = 'block';
        modelInfo.innerHTML = `
            <div class="model-info">
                <h3>✅ Model Loaded Successfully!</h3>
                <p><strong>Layers:</strong> ${layers.length}</p>
                <p><strong>Input Shape:</strong> ${model.inputs[0].shape.slice(1).join(' × ')}</p>
                <p><strong>Type:</strong> Sequential CNN</p>
            </div>
        `;
    }
}

// Display layer list
function displayLayers() {
    const layerList = document.getElementById('layer-list');
    if (!layerList) return;
    
    if (!layers || layers.length === 0) {
        layerList.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">Load a model first</p>';
        return;
    }
    
    const visualizableLayers = layers.filter(layer => 
        layer.type === 'Conv2D' || layer.type === 'Dense'
    );
    
    if (visualizableLayers.length === 0) {
        layerList.innerHTML = '<p style="text-align: center; padding: 20px; color: #ff6b6b;">No visualizable layers found</p>';
        return;
    }
    
    layerList.innerHTML = visualizableLayers.map(layer => {
        const isDisabled = !inputImage;
        const shapeText = Array.isArray(layer.shape) ? layer.shape.slice(1).join(' × ') : 'N/A';
        
        return `
            <div class="layer-item ${isDisabled ? 'disabled' : ''}" 
                 onclick="${!isDisabled ? `selectLayer(${layer.index})` : ''}"
                 id="layer-${layer.index}"
                 style="
                     padding: 15px;
                     margin: 5px 0;
                     background: ${isDisabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'};
                     border-radius: 8px;
                     border: 1px solid rgba(255,255,255,0.2);
                     cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
                     transition: all 0.2s ease;
                     opacity: ${isDisabled ? '0.5' : '1'};
                 ">
                <div style="font-weight: 600; color: #2196F3; font-size: 1.1rem; margin-bottom: 5px;">
                    ${layer.name}
                </div>
                <div style="font-size: 0.9rem; opacity: 0.8; color: rgba(255,255,255,0.8);">
                    Type: ${layer.type} | Shape: ${shapeText}
                </div>
                ${isDisabled ? '<div style="font-size: 0.8rem; color: #ff6b6b; margin-top: 5px;">Load an image first</div>' : ''}
            </div>
        `;
    }).join('');
    
    console.log(`Displayed ${visualizableLayers.length} visualizable layers`);
}

// Select a layer for visualization - GLOBAL function for onclick
async function selectLayer(layerIndex) {
    if (!model || !inputImage) {
        showStatus('Please load both model and image first');
        return;
    }
    
    try {
        showStatus('Generating feature maps...', true);
        console.log(`Generating feature maps for layer ${layerIndex}`);
        
        selectedLayer = layerIndex;
        
        // Update UI to show selected layer
        document.querySelectorAll('.layer-item').forEach(item => {
            item.classList.remove('selected');
        });
        const selectedElement = document.getElementById(`layer-${layerIndex}`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        
        // Use tf.tidy to manage memory automatically
        const featureMaps = tf.tidy(() => {
            let currentOutput = inputImage;
            console.log('Starting forward pass...');
            
            // Pass through layers up to the selected layer
            for (let i = 0; i <= layerIndex; i++) {
                const layer = model.layers[i];
                console.log(`Processing layer ${i}: ${layer.name} (${layer.getClassName()})`);
                try {
                    currentOutput = layer.apply(currentOutput);
                    console.log(`Layer ${i} output shape:`, currentOutput.shape);
                } catch (e) {
                    console.error(`Error in layer ${i}:`, e);
                    throw e;
                }
            }
            
            return currentOutput;
        });
        
        console.log('Feature maps generated, shape:', featureMaps.shape);
        
        // Display feature maps
        const layer = model.layers[layerIndex];
        await displayFeatureMaps(featureMaps, layer);
        
        // Clean up
        if (!featureMaps.isDisposed) {
            featureMaps.dispose();
        }
        
        console.log('Layer visualization completed successfully');
        
    } catch (error) {
        console.error('Error generating feature maps:', error);
        showStatus('Error generating feature maps: ' + error.message);
        
        // Clean up any tensors that might have been created
        tf.engine().endScope();
        tf.engine().startScope();
    }
}

// Display the input image
async function displayInputImage() {
    const preview = document.getElementById('image-preview');
    if (!preview || !inputImage) return;
    
    try {
        // Create canvas to display the image
        const canvas = document.createElement('canvas');
        canvas.width = 196; // 28 * 7 for better visibility
        canvas.height = 196;
        canvas.style.cssText = `
            border: 2px solid #2196F3;
            border-radius: 8px;
            image-rendering: pixelated;
            background: #000;
            display: block;
            margin: 10px auto;
        `;
        canvas.classList.add('pixel-crisp');
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        
        // Get image data from tensor
        const data = await inputImage.data();
        const imageData = ctx.createImageData(28, 28);
        const imgData = imageData.data;
        
        for (let i = 0; i < 28 * 28; i++) {
            const value = Math.floor(data[i] * 255);
            const pixelIndex = i * 4;
            imgData[pixelIndex] = value;     // R
            imgData[pixelIndex + 1] = value; // G
            imgData[pixelIndex + 2] = value; // B
            imgData[pixelIndex + 3] = 255;   // A
        }
        
        // Draw to a temporary canvas first
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 28;
        tempCanvas.height = 28;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.mozImageSmoothingEnabled = false;
        tempCtx.webkitImageSmoothingEnabled = false;
        tempCtx.msImageSmoothingEnabled = false;
        tempCtx.putImageData(imageData, 0, 0);
        
        // Scale up for display with pixel-perfect rendering
        ctx.drawImage(tempCanvas, 0, 0, 196, 196);
        
        // Clear previous content and add canvas
        preview.innerHTML = '<h4 style="color: #64B5F6; margin-bottom: 10px;">Input Image (28×28):</h4>';
        preview.appendChild(canvas);
        
        console.log('Input image displayed successfully');
        
    } catch (error) {
        console.error('Error displaying input image:', error);
        preview.innerHTML = '<p style="color: #ff6b6b;">Error displaying image</p>';
    }
}

// Display feature maps
async function displayFeatureMaps(featureMaps, layer) {
    const visualizationContent = document.getElementById('visualization-content');
    if (!visualizationContent) return;
    
    // Get feature map data
    const data = await featureMaps.data();
    const shape = featureMaps.shape;
    
    console.log('Feature map shape:', shape);
    console.log('Data range:', Math.min(...data), 'to', Math.max(...data));
    
    // Clear previous content
    visualizationContent.innerHTML = '';
    
    // Create layer info
    const layerInfo = document.createElement('div');
    layerInfo.className = 'layer-info';
    layerInfo.style.cssText = `
        background: linear-gradient(135deg, rgba(33, 150, 243, 0.2) 0%, rgba(76, 175, 80, 0.2) 100%);
        padding: 30px;
        border-radius: 15px;
        margin-bottom: 30px;
        border: 1px solid rgba(33, 150, 243, 0.3);
        box-shadow: 0 8px 25px rgba(33, 150, 243, 0.15);
    `;
    
    // Create elements manually for better text rendering control
    const title = document.createElement('h3');
    title.textContent = `${layer.name} (${layer.getClassName()})`;
    title.style.cssText = `
        color: #64B5F6; 
        font-size: 2rem; 
        margin-bottom: 15px; 
        font-family: monospace, 'Courier New', Courier;
        font-weight: bold;
        letter-spacing: 0.5px;
    `;
    
    const outputShape = document.createElement('p');
    outputShape.innerHTML = `<strong>Output Shape:</strong> ${shape.slice(1).join(' × ')}`;
    outputShape.style.cssText = `
        font-size: 1.2rem; 
        margin: 10px 0; 
        color: rgba(255, 255, 255, 0.9);
        font-family: monospace, 'Courier New', Courier;
        letter-spacing: 0.5px;
    `;
    
    const activationRange = document.createElement('p');
    activationRange.innerHTML = `<strong>Activation Range:</strong> ${Math.min(...data).toFixed(3)} to ${Math.max(...data).toFixed(3)}`;
    activationRange.style.cssText = `
        font-size: 1.2rem; 
        margin: 10px 0; 
        color: rgba(255, 255, 255, 0.9);
        font-family: monospace, 'Courier New', Courier;
        letter-spacing: 0.5px;
    `;
    
    layerInfo.appendChild(title);
    layerInfo.appendChild(outputShape);
    layerInfo.appendChild(activationRange);
    visualizationContent.appendChild(layerInfo);
    
    if (shape.length === 4) {
        // Conv2D layer: [batch, height, width, channels]
        const [batch, height, width, channels] = shape;
        
        const container = document.createElement('div');
        container.className = 'feature-maps-container';
        
        const title = document.createElement('h3');
        title.textContent = `Feature Maps (${channels} filters)`;
        container.appendChild(title);
        
        const grid = document.createElement('div');
        grid.className = 'feature-maps-grid';
        
        // Create canvas for each feature map
        for (let c = 0; c < Math.min(channels, 12); c++) { // Limit to 12 for better layout
            const item = document.createElement('div');
            item.className = 'feature-map-item';
            
            const canvas = document.createElement('canvas');
            const displaySize = Math.max(height * 10, 180); // Even larger display size for clarity
            canvas.width = displaySize;
            canvas.height = displaySize;
            canvas.className = 'feature-map-canvas crisp-render';
            canvas.style.imageRendering = 'pixelated';
            
            const ctx = canvas.getContext('2d');
            
            // Extract feature map data for this channel
            const mapData = new Float32Array(height * width);
            for (let h = 0; h < height; h++) {
                for (let w = 0; w < width; w++) {
                    const idx = h * width * channels + w * channels + c;
                    mapData[h * width + w] = data[idx];
                }
            }
            
            // Normalize and create image data
            const min = Math.min(...mapData);
            const max = Math.max(...mapData);
            const range = max - min;
            
            console.log(`Filter ${c + 1}: range ${min.toFixed(3)} to ${max.toFixed(3)}`);
            
            // Create temporary canvas at original size
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCanvas.style.imageRendering = 'pixelated';
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.imageSmoothingEnabled = false;
            tempCtx.mozImageSmoothingEnabled = false;
            tempCtx.webkitImageSmoothingEnabled = false;
            tempCtx.msImageSmoothingEnabled = false;
            
            const imageData = tempCtx.createImageData(width, height);
            const imgData = imageData.data;
            
            for (let i = 0; i < mapData.length; i++) {
                const normalized = range > 0 ? (mapData[i] - min) / range : 0.5;
                const value = Math.floor(normalized * 255);
                const pixelIndex = i * 4;
                imgData[pixelIndex] = value;     // R
                imgData[pixelIndex + 1] = value; // G
                imgData[pixelIndex + 2] = value; // B
                imgData[pixelIndex + 3] = 255;   // A
            }
            
            tempCtx.putImageData(imageData, 0, 0);
            
            // Scale up for display with ULTRA pixel-perfect rendering
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            
            // Apply special rendering technique for ultra-crisp feature maps
            // First clear canvas with solid black
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, displaySize, displaySize);
            
            // Draw at integer scale factors for perfect pixel alignment
            const scale = Math.floor(displaySize / width);
            const scaledWidth = width * scale;
            const scaledHeight = height * scale;
            
            // Center the scaled image
            const offsetX = Math.floor((displaySize - scaledWidth) / 2);
            const offsetY = Math.floor((displaySize - scaledHeight) / 2);
            
            // Draw the image with perfect pixel alignment
            ctx.drawImage(tempCanvas, offsetX, offsetY, scaledWidth, scaledHeight);
            
            // Add a subtle border to each pixel for enhanced visibility
            canvas.classList.add('crisp-render');
            
            // Create filter label with crisp text rendering
            const label = document.createElement('div');
            label.textContent = `Filter ${c + 1}`;
            label.className = 'feature-map-label';
            
            item.appendChild(canvas);
            item.appendChild(label);
            grid.appendChild(item);
        }
        
        container.appendChild(grid);
        
        if (channels > 12) {
            const note = document.createElement('p');
            note.textContent = `Showing first 12 of ${channels} feature maps`;
            note.style.cssText = 'text-align: center; margin-top: 15px; color: #FF9800;';
            container.appendChild(note);
        }
        
        visualizationContent.appendChild(container);
        
    } else if (shape.length === 2) {
        // Dense layer: [batch, units]
        const [batch, units] = shape;
        
        const container = document.createElement('div');
        container.className = 'dense-layer-container';
        container.style.cssText = `
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%);
            border: 1px solid rgba(33, 150, 243, 0.3);
            border-radius: 15px;
            padding: 25px;
            margin-top: 20px;
        `;
        
        const title = document.createElement('h3');
        title.textContent = `Dense Layer Activations (${units} units)`;
        title.style.cssText = `
            color: #64B5F6;
            font-size: 1.6rem;
            margin-bottom: 20px;
            text-align: center;
            text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        `;
        container.appendChild(title);
        
        // Range indicator
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        
        const rangeIndicator = document.createElement('div');
        rangeIndicator.style.cssText = `
            background: rgba(0, 0, 0, 0.4);
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
        `;
        rangeIndicator.textContent = `Activation Range: ${min.toFixed(3)} to ${max.toFixed(3)}`;
        container.appendChild(rangeIndicator);
        
        // Create bars container
        const barsWrapper = document.createElement('div');
        barsWrapper.style.cssText = `
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            padding: 20px;
            position: relative;
            overflow-x: auto;
            margin-bottom: 15px;
        `;
        
        const barsContainer = document.createElement('div');
        barsContainer.style.cssText = `
            display: flex;
            align-items: flex-end;
            justify-content: flex-start;
            height: 200px;
            min-width: ${Math.min(units * 12, 1200)}px;
            position: relative;
            gap: 1px;
        `;
        
        // Add guide lines
        for (let i = 1; i <= 4; i++) {
            const guideLine = document.createElement('div');
            const percent = (i * 25);
            guideLine.style.cssText = `
                position: absolute;
                bottom: ${percent}%;
                left: 0;
                right: 0;
                height: 1px;
                background: rgba(255, 255, 255, 0.2);
                pointer-events: none;
            `;
            
            const label = document.createElement('span');
            label.style.cssText = `
                position: absolute;
                right: 5px;
                top: -8px;
                font-size: 10px;
                color: rgba(255, 255, 255, 0.7);
                background: rgba(0, 0, 0, 0.5);
                padding: 2px 4px;
                border-radius: 2px;
            `;
            label.textContent = (percent / 100).toFixed(2);
            guideLine.appendChild(label);
            barsContainer.appendChild(guideLine);
        }
        
        // Determine how many units to show
        const maxUnitsToShow = Math.min(units, 100);
        
        // Create bars
        for (let i = 0; i < maxUnitsToShow; i++) {
            const value = data[i];
            const normalized = range > 0 ? Math.max(0, Math.min(1, (value - min) / range)) : 0;
            const barHeight = Math.max(normalized * 180, 2);
            
            const barWrapper = document.createElement('div');
            barWrapper.style.cssText = `
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;
                width: 10px;
                height: 100%;
                margin-right: 1px;
            `;
            
            const bar = document.createElement('div');
            const hue = Math.floor((1 - normalized) * 240); // Blue to red scale
            bar.style.cssText = `
                width: 8px;
                height: ${barHeight}px;
                background: linear-gradient(to top, hsl(${hue}, 70%, 45%), hsl(${hue}, 70%, 65%));
                border-radius: 2px 2px 0 0;
                border: 1px solid rgba(255, 255, 255, 0.3);
                transition: all 0.2s ease;
                cursor: pointer;
                box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
            `;
            
            // Tooltip
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 5px 8px;
                border-radius: 4px;
                font-size: 11px;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
                z-index: 1000;
                margin-bottom: 5px;
            `;
            tooltip.textContent = `Unit ${i + 1}: ${value.toFixed(4)}`;
            
            // Label
            const label = document.createElement('div');
            label.style.cssText = `
                position: absolute;
                bottom: -20px;
                font-size: 8px;
                color: rgba(255, 255, 255, 0.8);
                font-weight: bold;
                text-align: center;
                width: 20px;
                left: 50%;
                transform: translateX(-50%) rotate(-45deg);
                transform-origin: center;
            `;
            label.textContent = i + 1;
            
            // Hover effects
            barWrapper.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
                bar.style.transform = 'scaleX(1.5)';
                bar.style.filter = 'brightness(1.2)';
            });
            
            barWrapper.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                bar.style.transform = 'scaleX(1)';
                bar.style.filter = 'brightness(1)';
            });
            
            barWrapper.appendChild(bar);
            barWrapper.appendChild(tooltip);
            barWrapper.appendChild(label);
            barsContainer.appendChild(barWrapper);
        }
        
        barsWrapper.appendChild(barsContainer);
        container.appendChild(barsWrapper);
        
        // Information note
        const note = document.createElement('p');
        note.style.cssText = `
            text-align: center;
            margin-top: 15px;
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.8);
            font-style: italic;
        `;
        note.textContent = `Showing ${maxUnitsToShow} of ${units} neurons. Hover over bars for details.`;
        container.appendChild(note);
        
        if (units > maxUnitsToShow) {
            const limitNote = document.createElement('p');
            limitNote.style.cssText = `
                text-align: center;
                margin-top: 10px;
                color: #FF9800;
                font-size: 0.85rem;
                font-weight: 600;
            `;
            limitNote.textContent = `Limited to first ${maxUnitsToShow} units for performance`;
            container.appendChild(limitNote);
        }
        
        visualizationContent.appendChild(container);
    }
    
    showStatus('Feature maps generated successfully!');
}

// Show status message
function showStatus(message, loading = false) {
    const visualizationContent = document.getElementById('visualization-content');
    if (!visualizationContent) return;
    
    console.log('Status:', message);
    
    if (loading) {
        visualizationContent.innerHTML = `
            <div class="loading" style="
                text-align: center;
                padding: 40px;
                color: #64B5F6;
            ">
                <div class="spinner" style="
                    border: 3px solid rgba(100, 181, 246, 0.3);
                    border-top: 3px solid #64B5F6;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 15px;
                "></div>
                <p style="font-size: 1.1rem; font-weight: 500;">${message}</p>
            </div>
        `;
    } else {
        // Only show non-loading messages if we're not in the middle of visualization
        const hasVisualization = visualizationContent.innerHTML.includes('feature-maps-container') || 
                                 visualizationContent.innerHTML.includes('dense-layer-container');
        
        if (!hasVisualization) {
            visualizationContent.innerHTML = `
                <div class="status" style="
                    text-align: center;
                    padding: 40px;
                    background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(76, 175, 80, 0.1) 100%);
                    border-radius: 15px;
                    border: 1px solid rgba(33, 150, 243, 0.3);
                ">
                    <h3 style="color: #64B5F6; margin-bottom: 10px; font-size: 1.4rem;">${message}</h3>
                    <p style="color: rgba(255,255,255,0.8); font-size: 1rem;">
                        ${message.includes('successfully') ? '✅ Operation completed!' : 
                          message.includes('Error') ? '❌ Something went wrong.' : 
                          '🔄 Ready for next step.'}
                    </p>
                </div>
            `;
        }
    }
}