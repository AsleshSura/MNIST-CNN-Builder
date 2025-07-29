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
    const modelFileInput = document.getElementById('modelFileInput');
    const imageFileInput = document.getElementById('imageFileInput');
    
    if (modelFileInput) {
        modelFileInput.addEventListener('change', handleCustomModelFiles);
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
        if (typeof tf !== 'undefined') {
            tf.disposeVariables();
            console.log('TensorFlow.js variables disposed');
        }
    } catch (e) {
        console.warn('Error during cleanup:', e.message);
    }
}

// Create a demo CNN model
async function createDemoModel() {
    await tf.ready();
    
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
        // Check if TensorFlow.js is available
        if (typeof tf === 'undefined') {
            showStatus('❌ TensorFlow.js not loaded. Please wait and try again.');
            return;
        }
        
        showStatus('Creating demo CNN model...', true);
        console.log('Starting model creation...');
        
        // Clean up existing model
        if (model && !model.isDisposedInternal) {
            try {
                model.dispose();
            } catch (e) {
                console.warn('Model already disposed:', e.message);
            }
        }
        
        model = await createDemoModel();
        console.log('Model created successfully');
        
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
        
        console.log('Extracted layer information:', layers);
        
        displayModelInfo();
        displayLayers();
        
        // Show image loading options
        showImageLoadingOptions();
        
        showStatus('Demo model loaded successfully! Now load an image.');
        console.log('Model loading completed successfully');
        
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
function loadCustomModel() {
    console.log('loadCustomModel called');
    
    // Check if TensorFlow.js is available
    if (typeof tf === 'undefined') {
        showStatus('❌ TensorFlow.js not loaded. Please wait and try again.');
        console.error('TensorFlow.js not available');
        return;
    }
    
    const fileInput = document.getElementById('modelFileInput');
    if (!fileInput) {
        console.error('File input not found');
        showStatus('❌ File input not found');
        return;
    }
    
    console.log('Opening file picker...');
    fileInput.onchange = handleCustomModelFiles;
    fileInput.click();
}

// Create and download a test model for testing custom model loading
async function createTestModel() {
    try {
        showStatus('Creating test model...', true);
        
        // Check if TensorFlow.js is available
        if (typeof tf === 'undefined') {
            showStatus('❌ TensorFlow.js not loaded. Please wait and try again.');
            return;
        }
        
        // Create a simple test model
        const testModel = tf.sequential({
            layers: [
                tf.layers.conv2d({
                    inputShape: [32, 32, 3],
                    filters: 16,
                    kernelSize: 3,
                    activation: 'relu',
                    name: 'conv2d_test'
                }),
                tf.layers.maxPooling2d({
                    poolSize: 2,
                    name: 'maxpool_test'
                }),
                tf.layers.flatten({
                    name: 'flatten_test'
                }),
                tf.layers.dense({
                    units: 10,
                    activation: 'softmax',
                    name: 'output_test'
                })
            ]
        });
        
        testModel.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        
        // Save the model to downloads
        const saveResult = await testModel.save('downloads://test-model');
        
        showStatus('✅ Test model created and downloaded! Check your Downloads folder for model.json and .bin files.');
        
        console.log('Test model created successfully:', saveResult);
        
    } catch (error) {
        console.error('Error creating test model:', error);
        showStatus('❌ Error creating test model: ' + error.message);
    }
}

// Convert CNN-Builder format to TensorFlow.js model
async function convertCNNBuilderToTensorFlow(cnnBuilderData) {
    try {
        console.log('Converting CNN-Builder data:', cnnBuilderData);
        
        if (!cnnBuilderData.layers || !Array.isArray(cnnBuilderData.layers)) {
            throw new Error('Invalid CNN-Builder format: missing layers array');
        }
        
        const model = tf.sequential();
        let isFirstLayer = true;
        
        // Convert each layer from CNN-Builder format to TensorFlow.js
        cnnBuilderData.layers.forEach((layer, index) => {
            console.log(`Converting layer ${index}:`, layer);
            
            switch (layer.type) {
                case "Conv2D":
                    if (isFirstLayer) {
                        // First layer needs input shape
                        const inputShape = layer.inputShape || [28, 28, 1]; // Default to MNIST shape
                        model.add(tf.layers.conv2d({
                            filters: layer.filters,
                            kernelSize: layer.kernelSize,
                            strides: layer.strides,
                            padding: layer.padding,
                            activation: layer.activation,
                            inputShape: inputShape,
                            name: layer.name || `conv2d_${index}`
                        }));
                        isFirstLayer = false;
                    } else {
                        model.add(tf.layers.conv2d({
                            filters: layer.filters,
                            kernelSize: layer.kernelSize,
                            strides: layer.strides,
                            padding: layer.padding,
                            activation: layer.activation,
                            name: layer.name || `conv2d_${index}`
                        }));
                    }
                    break;
                    
                case "ReLU":
                    model.add(tf.layers.activation({ 
                        activation: "relu",
                        name: layer.name || `relu_${index}`
                    }));
                    break;
                    
                case "MaxPooling2D":
                    model.add(tf.layers.maxPooling2d({
                        poolSize: layer.poolSize,
                        strides: layer.strides,
                        padding: layer.padding,
                        name: layer.name || `maxpool_${index}`
                    }));
                    break;
                    
                case "BatchNormalization":
                    model.add(tf.layers.batchNormalization({
                        name: layer.name || `batchnorm_${index}`
                    }));
                    break;
                    
                case "Dropout":
                    model.add(tf.layers.dropout({
                        rate: layer.rate,
                        name: layer.name || `dropout_${index}`
                    }));
                    break;
                    
                case "Flatten":
                    model.add(tf.layers.flatten({
                        name: layer.name || `flatten_${index}`
                    }));
                    break;
                    
                case "Dense":
                    model.add(tf.layers.dense({
                        units: layer.units,
                        activation: layer.activation,
                        name: layer.name || `dense_${index}`
                    }));
                    break;
                    
                case "Softmax":
                    model.add(tf.layers.activation({ 
                        activation: "softmax",
                        name: layer.name || `softmax_${index}`
                    }));
                    break;
                    
                default:
                    console.warn(`Unknown layer type: ${layer.type}`);
                    break;
            }
        });
        
        // Compile the model with default settings or from the config
        const trainingSettings = cnnBuilderData.trainingSettings || {
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        };
        
        model.compile({
            optimizer: trainingSettings.optimizer,
            loss: trainingSettings.loss || "categoricalCrossentropy",
            metrics: trainingSettings.metrics || ["accuracy"]
        });
        
        // If weights are available, try to load them
        if (cnnBuilderData.weights && cnnBuilderData.weights.layerWeights) {
            try {
                console.log('Loading weights from CNN-Builder format...');
                await loadCNNBuilderWeights(model, cnnBuilderData.weights);
                console.log('Weights loaded successfully');
            } catch (error) {
                console.warn('Could not load weights:', error);
                // Continue without weights
            }
        }
        
        console.log('CNN-Builder model converted successfully');
        return model;
        
    } catch (error) {
        console.error('Error converting CNN-Builder model:', error);
        throw error;
    }
}

// Load weights from CNN-Builder format into TensorFlow.js model
async function loadCNNBuilderWeights(model, weightsData) {
    try {
        const layerWeights = weightsData.layerWeights;
        
        for (let i = 0; i < layerWeights.length; i++) {
            const layerWeight = layerWeights[i];
            const modelLayer = model.layers[layerWeight.layerIndex];
            
            if (!modelLayer) {
                console.warn(`Model layer ${layerWeight.layerIndex} not found`);
                continue;
            }
            
            // Convert weight data back to tensors
            const weightTensors = layerWeight.weights.map(weight => {
                return tf.tensor(weight.values, weight.shape);
            });
            
            if (weightTensors.length > 0) {
                modelLayer.setWeights(weightTensors);
                
                // Clean up tensors
                weightTensors.forEach(tensor => tensor.dispose());
            }
        }
    } catch (error) {
        console.error('Error loading CNN-Builder weights:', error);
        throw error;
    }
}

async function handleCustomModelFiles(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    console.log('Loading custom model files:', files.map(f => f.name));
    
    try {
        showStatus('Loading custom model...', true);
        
        // Check if TensorFlow.js is available
        if (typeof tf === 'undefined') {
            showStatus('❌ TensorFlow.js not loaded. Please wait and try again.');
            return;
        }
        
        // Clean up existing model
        if (model && !model.isDisposedInternal) {
            try {
                model.dispose();
            } catch (e) {
                console.warn('Model already disposed:', e.message);
            }
        }
        
        // Check if we have CNN-Builder JSON files, TensorFlow.js files, or H5 files
        const jsonFiles = files.filter(f => f.name.endsWith('.json'));
        const weightsFiles = files.filter(f => f.name.includes('.bin') || f.name.endsWith('.h5'));
        const h5Files = files.filter(f => f.name.endsWith('.h5'));
        
        console.log('JSON files:', jsonFiles.map(f => f.name));
        console.log('Weights files:', weightsFiles.map(f => f.name));
        console.log('H5 files:', h5Files.map(f => f.name));
        
        if (jsonFiles.length === 0 && h5Files.length === 0) {
            showStatus('❌ Please select either a JSON file (CNN-Builder or TensorFlow.js) or an .h5 file');
            return;
        }
        
        // Case 1: Single .h5 file
        if (h5Files.length === 1 && jsonFiles.length === 0) {
            console.log('Loading single .h5 file...');
            try {
                const fileUrl = URL.createObjectURL(h5Files[0]);
                console.log('Loading from URL:', fileUrl);
                model = await tf.loadLayersModel(fileUrl);
                URL.revokeObjectURL(fileUrl);
                console.log('H5 model loaded successfully');
            } catch (error) {
                console.error('Error loading .h5 file:', error);
                showStatus('❌ Error loading .h5 file: ' + error.message);
                return;
            }
        }
        // Case 2: JSON file (could be CNN-Builder or TensorFlow.js format)
        else if (jsonFiles.length > 0) {
            const jsonFile = jsonFiles[0];
            console.log('Loading JSON file...');
            
            try {
                const jsonText = await jsonFile.text();
                const jsonData = JSON.parse(jsonText);
                
                // Check if this is a CNN-Builder format (has layers array with custom structure)
                if (jsonData.layers && Array.isArray(jsonData.layers) && jsonData.layers.length > 0) {
                    const firstLayer = jsonData.layers[0];
                    
                    // CNN-Builder format detection
                    if (firstLayer.type && typeof firstLayer.type === 'string' && 
                        ['Conv2D', 'ReLU', 'MaxPooling2D', 'BatchNormalization', 'Dropout', 'Flatten', 'Dense', 'Softmax'].includes(firstLayer.type)) {
                        
                        console.log('Detected CNN-Builder format, converting...');
                        model = await convertCNNBuilderToTensorFlow(jsonData);
                        
                        if (model) {
                            console.log('CNN-Builder model converted successfully');
                        } else {
                            showStatus('❌ Failed to convert CNN-Builder model');
                            return;
                        }
                    }
                    // TensorFlow.js format detection
                    else if (firstLayer.className || firstLayer.config) {
                        console.log('Detected TensorFlow.js format...');
                        
                        if (weightsFiles.length === 0) {
                            // Load model without weights
                            model = await tf.models.modelFromJSON(jsonData);
                            showStatus('⚠️ TensorFlow.js model loaded without weights (random initialization)', false);
                        } else {
                            // Try to load with weights
                            try {
                                const modelUrl = URL.createObjectURL(jsonFile);
                                model = await tf.loadLayersModel(modelUrl);
                                URL.revokeObjectURL(modelUrl);
                            } catch (error) {
                                console.warn('Failed to load with weights, trying without:', error);
                                model = await tf.models.modelFromJSON(jsonData);
                                showStatus('⚠️ TensorFlow.js model loaded without weights (could not load weight files)', false);
                            }
                        }
                    }
                    else {
                        showStatus('❌ Unrecognized JSON format. Expected CNN-Builder or TensorFlow.js format.');
                        return;
                    }
                }
                else {
                    showStatus('❌ Invalid JSON format. Missing or invalid layers array.');
                    return;
                }
                
            } catch (error) {
                console.error('Error loading JSON file:', error);
                showStatus('❌ Error loading JSON file: ' + error.message);
                return;
            }
        }
        
        if (!model) {
            showStatus('❌ Failed to load model');
            return;
        }
        
        console.log('Model loaded successfully:', model);
        
        // Extract layer information
        layers = model.layers.map((layer, index) => {
            try {
                return {
                    name: layer.name || `layer_${index}`,
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
        
        console.log('Custom model layers:', layers);
        
        displayModelInfo();
        displayLayers();
        
        showStatus('✅ Custom model loaded successfully! Load an image to visualize.');
        
        // Show image loading options
        showImageLoadingOptions();
        
        // Reset file input
        event.target.value = '';
        
    } catch (error) {
        console.error('Error loading custom model:', error);
        showStatus('❌ Error loading custom model: ' + error.message);
        
        // Clean up on error
        if (model && !model.isDisposedInternal) {
            try {
                model.dispose();
            } catch (e) {
                console.warn('Error disposing model after failure:', e.message);
            }
        }
        model = null;
        
        // Reset file input
        event.target.value = '';
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

// Show image loading options after model is loaded
function showImageLoadingOptions() {
    // Add demo image button
    const loadDemoBtn = document.getElementById('loadDemoBtn');
    if (loadDemoBtn && !document.getElementById('demoImageBtn')) {
        const demoImageBtn = document.createElement('button');
        demoImageBtn.id = 'demoImageBtn';
        demoImageBtn.className = 'btn';
        demoImageBtn.textContent = '🖼️ Load Demo Image';
        demoImageBtn.onclick = loadDemoImage;
        demoImageBtn.style.marginLeft = '10px';
        loadDemoBtn.parentNode.appendChild(demoImageBtn);
    }
    
    // Show custom image button
    const customImageBtn = document.getElementById('loadCustomImageBtn');
    if (customImageBtn) {
        customImageBtn.style.display = 'inline-block';
    }
}

// Load custom image file
function loadCustomImageFile() {
    const fileInput = document.getElementById('imageFileInput');
    if (!fileInput) {
        console.error('Image file input not found');
        return;
    }
    
    fileInput.click();
}

// Load custom image from file
async function loadCustomImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!model) {
        showStatus('❌ Please load a model first');
        return;
    }
    
    try {
        showStatus('Processing image...', true);
        
        const img = new Image();
        img.onload = function() {
            try {
                // Get expected input shape from model
                const inputShape = model.layers[0].batchInputShape;
                const height = inputShape[1] || 28;
                const width = inputShape[2] || 28;
                const channels = inputShape[3] || 1;
                
                // Create canvas to process the image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Resize to expected dimensions
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to tensor based on expected channels
                let tensor;
                if (channels === 1) {
                    // Grayscale
                    tensor = tf.browser.fromPixels(canvas, 1);
                } else if (channels === 3) {
                    // RGB
                    tensor = tf.browser.fromPixels(canvas, 3);
                } else {
                    // Default to grayscale
                    tensor = tf.browser.fromPixels(canvas, 1);
                }
                
                const normalized = tensor.div(255.0);
                const batched = normalized.expandDims(0);
                
                // Clean up existing image
                if (inputImage && !inputImage.isDisposed) {
                    try {
                        inputImage.dispose();
                    } catch (e) {
                        console.warn('Input image already disposed:', e.message);
                    }
                }
                
                inputImage = batched;
                tensor.dispose();
                normalized.dispose();
                
                // Display the processed image
                displayInputImage();
                
                // Update layer list to enable selection
                displayLayers();
                
                showStatus(`✅ Image loaded! (${width}x${height}x${channels}) Select a layer to visualize.`);
                
            } catch (error) {
                console.error('Error processing image:', error);
                showStatus('❌ Error processing image: ' + error.message);
            }
        };
        
        img.src = URL.createObjectURL(file);
        
    } catch (error) {
        console.error('Error loading custom image:', error);
        showStatus('❌ Error loading custom image: ' + error.message);
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
    const layerList = document.getElementById('layerList');
    if (!layerList) return;
    
    if (!layers || layers.length === 0) {
        layerList.innerHTML = '<li class="empty-state"><div class="icon">🧠</div><p>Load a model first</p></li>';
        return;
    }
    
    const visualizableLayers = layers.filter(layer => 
        layer.type === 'Conv2D' || layer.type === 'Dense'
    );
    
    if (visualizableLayers.length === 0) {
        layerList.innerHTML = '<li class="empty-state"><p style="color: #ff6b6b;">No visualizable layers found</p></li>';
        return;
    }
    
    layerList.innerHTML = visualizableLayers.map(layer => {
        const isDisabled = !inputImage;
        const shapeText = Array.isArray(layer.shape) ? layer.shape.slice(1).join(' × ') : 'N/A';
        
        return `
            <li class="layer-item ${isDisabled ? 'disabled' : ''}" 
                 onclick="${!isDisabled ? `selectLayer(${layer.index})` : ''}"
                 id="layer-${layer.index}">
                <div style="font-weight: 600; color: #2196F3; font-size: 1.1rem; margin-bottom: 5px;">
                    ${layer.name}
                </div>
                <div style="font-size: 0.9rem; opacity: 0.8;">
                    Type: ${layer.type} | Shape: ${shapeText}
                </div>
                ${isDisabled ? '<div style="font-size: 0.8rem; color: #ff6b6b; margin-top: 5px;">Load an image first</div>' : ''}
            </li>
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
    const visualizationContent = document.getElementById('visualizationContent');
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
    layerInfo.innerHTML = `
        <h3 style="color: #2d3748; font-size: 2rem; margin-bottom: 15px; text-shadow: none; font-weight: 600;">${layer.name} (${layer.getClassName()})</h3>
        <p style="font-size: 1.2rem; margin: 10px 0; color: #4a5568;"><strong>Output Shape:</strong> ${shape.slice(1).join(' × ')}</p>
        <p style="font-size: 1.2rem; margin: 10px 0; color: #4a5568;"><strong>Activation Range:</strong> ${Math.min(...data).toFixed(3)} to ${Math.max(...data).toFixed(3)}</p>
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
            const displaySize = Math.max(height * 12, 180); // Larger display size for better visibility
            canvas.width = displaySize;
            canvas.height = displaySize;
            canvas.className = 'feature-map-canvas';
            canvas.style.imageRendering = 'pixelated';
            
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            
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
            
            // Scale up for display with pixel-perfect rendering
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
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
            color: #2d3748;
            font-size: 1.6rem;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 600;
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
    const status = document.getElementById('status');
    if (!status) return;
    
    status.className = 'status show';
    
    if (loading) {
        status.className += ' loading';
        status.innerHTML = `<span class="loading-spinner"></span>${message}`;
    } else if (message.includes('Error') || message.includes('❌')) {
        status.className += ' error';
        status.innerHTML = message;
    } else if (message.includes('✅') || message.includes('success')) {
        status.className += ' success';
        status.innerHTML = message;
    } else {
        status.innerHTML = message;
    }
    
    // Hide after 5 seconds if not loading
    if (!loading) {
        setTimeout(() => {
            status.className = 'status';
        }, 5000);
    }
}
