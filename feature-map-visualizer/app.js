// Global variables
let model = null;
let inputImage = null;
let selectedLayer = null;
let layers = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('CNN Feature Map Visualizer loaded');
    
    // Set up file input event listeners
    const modelFileInput = document.getElementById('model-file');
    const imageFileInput = document.getElementById('image-file');
    
    if (modelFileInput) {
        modelFileInput.addEventListener('change', loadCustomModel);
    }
    
    if (imageFileInput) {
        imageFileInput.addEventListener('change', loadCustomImage);
    }
});

// Clean up resources before page unload
window.addEventListener('beforeunload', function() {
    if (model && !model.isDisposedInternal) {
        try {
            model.dispose();
        } catch (e) {
            console.warn('Error disposing model:', e.message);
        }
    }
    if (inputImage && !inputImage.isDisposed) {
        try {
            inputImage.dispose();
        } catch (e) {
            console.warn('Error disposing input image:', e.message);
        }
    }
});

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
        
        // Only dispose if model exists and hasn't been disposed already
        if (model && !model.isDisposedInternal) {
            try {
                model.dispose();
            } catch (e) {
                console.warn('Model already disposed:', e.message);
            }
        }
        
        model = await createDemoModel();
        
        // Extract layer information
        layers = model.layers.map((layer, index) => ({
            name: layer.name,
            index,
            shape: layer.outputShape,
            type: layer.getClassName()
        }));
        
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
        
        // Only dispose if inputImage exists and hasn't been disposed already
        if (inputImage && !inputImage.isDisposed) {
            try {
                inputImage.dispose();
            } catch (e) {
                console.warn('Input image already disposed:', e.message);
            }
        }
        
        inputImage = generateDemoImage();
        
        // Display the image
        displayInputImage();
        
        // Update layer list to enable selection
        displayLayers();
        
        showStatus('Demo image loaded! Now select a layer to visualize.');
        
    } catch (error) {
        console.error('Error loading demo image:', error);
        showStatus('Error loading demo image: ' + error.message);
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
    
    const visualizableLayers = layers.filter(layer => 
        layer.type === 'Conv2D' || layer.type === 'Dense'
    );
    
    layerList.innerHTML = visualizableLayers.map(layer => `
        <div class="layer-item ${!inputImage ? 'disabled' : ''}" 
             onclick="${inputImage ? `selectLayer(${layer.index})` : ''}"
             id="layer-${layer.index}">
            <div style="font-weight: 600; color: #2196F3;">${layer.name}</div>
            <div style="font-size: 0.9rem; opacity: 0.8;">
                Type: ${layer.type} | Shape: ${Array.isArray(layer.shape) ? layer.shape.slice(1).join(' × ') : 'N/A'}
            </div>
        </div>
    `).join('');
}

// Select a layer for visualization - GLOBAL function for onclick
async function selectLayer(layerIndex) {
    if (!model || !inputImage) return;
    
    try {
        showStatus('Generating feature maps...', true);
        
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
            
            // Pass through layers up to the selected layer
            for (let i = 0; i <= layerIndex; i++) {
                const layer = model.layers[i];
                currentOutput = layer.apply(currentOutput);
            }
            
            return currentOutput;
        });
        
        // Display feature maps
        const layer = model.layers[layerIndex];
        await displayFeatureMaps(featureMaps, layer);
        
        // Clean up
        if (!featureMaps.isDisposed) {
            featureMaps.dispose();
        }
        
    } catch (error) {
        console.error('Error generating feature maps:', error);
        showStatus('Error generating feature maps: ' + error.message);
    }
}

// Display the input image
function displayInputImage() {
    const preview = document.getElementById('image-preview');
    if (!preview) return;
    
    // Create canvas to display the image
    const canvas = document.createElement('canvas');
    canvas.width = 112; // 28 * 4 for better visibility
    canvas.height = 112;
    canvas.style.border = '2px solid #2196F3';
    canvas.style.borderRadius = '8px';
    canvas.style.imageRendering = 'pixelated';
    
    const ctx = canvas.getContext('2d');
    
    // Get image data from tensor
    inputImage.data().then(data => {
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
        tempCtx.putImageData(imageData, 0, 0);
        
        // Scale up for display
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, 112, 112);
    });
    
    // Clear previous content and add canvas
    preview.innerHTML = '<h4>Input Image:</h4>';
    preview.appendChild(canvas);
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
        background: linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(76, 175, 80, 0.15) 100%);
        padding: 30px;
        border-radius: 15px;
        margin-bottom: 30px;
        border: 1px solid rgba(33, 150, 243, 0.3);
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 25px rgba(33, 150, 243, 0.15);
    `;
    layerInfo.innerHTML = `
        <h3 style="color: #64B5F6; font-size: 2rem; margin-bottom: 15px; text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);">${layer.name} (${layer.getClassName()})</h3>
        <p style="font-size: 1.2rem; margin: 10px 0; color: rgba(255, 255, 255, 0.9);"><strong>Output Shape:</strong> ${shape.slice(1).join(' × ')}</p>
        <p style="font-size: 1.2rem; margin: 10px 0; color: rgba(255, 255, 255, 0.9);"><strong>Activation Range:</strong> ${Math.min(...data).toFixed(3)} to ${Math.max(...data).toFixed(3)}</p>
    `;
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
            const displaySize = Math.max(height * 8, 150); // Large display size
            canvas.width = displaySize;
            canvas.height = displaySize;
            canvas.className = 'feature-map-canvas';
            
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
            const tempCtx = tempCanvas.getContext('2d');
            
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
            
            // Scale up for display
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(tempCanvas, 0, 0, displaySize, displaySize);
            
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
        container.className = 'feature-maps-container';
        
        const title = document.createElement('h3');
        title.textContent = `Dense Layer Activations (${units} units)`;
        container.appendChild(title);
        
        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(20px, 1fr)); gap: 2px; margin-top: 20px; max-height: 200px;';
        
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min;
        
        for (let i = 0; i < Math.min(units, 500); i++) { // Limit for performance
            const normalized = range > 0 ? (data[i] - min) / range : 0;
            const height = Math.max(normalized * 180, 2);
            const color = `hsl(${normalized * 120}, 70%, 50%)`; // Green to red gradient
            
            const bar = document.createElement('div');
            bar.style.cssText = `
                width: 100%; 
                height: ${height}px; 
                background: ${color}; 
                align-self: end;
                border-radius: 2px;
            `;
            bar.title = `Unit ${i + 1}: ${data[i].toFixed(3)}`;
            grid.appendChild(bar);
        }
        
        container.appendChild(grid);
        
        const note = document.createElement('p');
        note.textContent = 'Each bar represents one neuron\'s activation level';
        note.style.cssText = 'text-align: center; margin-top: 10px; font-size: 0.9rem;';
        container.appendChild(note);
        
        if (units > 500) {
            const limitNote = document.createElement('p');
            limitNote.textContent = `Showing first 500 of ${units} units`;
            limitNote.style.cssText = 'text-align: center; margin-top: 15px; color: #FF9800;';
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
    
    if (loading) {
        visualizationContent.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    } else {
        // If we're not in the middle of visualization, show the message briefly
        if (!visualizationContent.innerHTML.includes('feature-maps-container')) {
            visualizationContent.innerHTML = `
                <div class="status">
                    <h3>${message}</h3>
                </div>
            `;
        }
    }
}