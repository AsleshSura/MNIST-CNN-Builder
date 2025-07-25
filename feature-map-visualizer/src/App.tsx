import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import './App.css';
import ImageUploader from './components/ImageUploader';
import ModelLoader from './components/ModelLoader';
import FeatureMapDisplay from './components/FeatureMapDisplay';
import LayerSelector from './components/LayerSelector';
import { createTestModel, generateTestImage } from './utils/testModel';

interface LayerInfo {
  name: string;
  index: number;
  shape: number[];
  type: string;
}

function App() {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [inputImage, setInputImage] = useState<tf.Tensor | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [featureMaps, setFeatureMaps] = useState<tf.Tensor | null>(null);
  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract layer information when model changes
  useEffect(() => {
    if (model) {
      const layerInfo: LayerInfo[] = model.layers.map((layer, index) => ({
        name: layer.name,
        index,
        shape: layer.outputShape as number[],
        type: layer.getClassName()
      }));
      setLayers(layerInfo);
    }
  }, [model]);

  // Generate feature maps when layer selection changes
  useEffect(() => {
    const generateFeatureMaps = async () => {
      if (model && inputImage && selectedLayer !== null) {
        setIsProcessing(true);
        try {
          // Create a model that outputs intermediate activations
          const layerOutput = model.layers[selectedLayer].output;
          const intermediateModel = tf.model({
            inputs: model.input,
            outputs: layerOutput
          });

          // Get the feature maps
          const prediction = intermediateModel.predict(inputImage) as tf.Tensor;
          setFeatureMaps(prediction);
          
          intermediateModel.dispose();
        } catch (error) {
          console.error('Error generating feature maps:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    generateFeatureMaps();
  }, [model, inputImage, selectedLayer]);

  const handleModelLoad = (loadedModel: tf.LayersModel) => {
    if (model) {
      model.dispose();
    }
    setModel(loadedModel);
    setSelectedLayer(null);
    setFeatureMaps(null);
  };

  const handleImageLoad = (image: tf.Tensor) => {
    if (inputImage) {
      inputImage.dispose();
    }
    setInputImage(image);
    setFeatureMaps(null);
  };

  const handleLayerSelect = (layerIndex: number) => {
    setSelectedLayer(layerIndex);
    if (featureMaps) {
      featureMaps.dispose();
      setFeatureMaps(null);
    }
  };

  const loadTestDemo = async () => {
    try {
      // Create test model
      const testModel = createTestModel();
      handleModelLoad(testModel);
      
      // Generate test image
      const testImage = generateTestImage();
      handleImageLoad(testImage);
      
      console.log('Test demo loaded successfully');
    } catch (error) {
      console.error('Error loading test demo:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🧠 CNN Feature Map Visualizer</h1>
        <p>Explore how Convolutional Neural Networks see and process images</p>
      </header>

      <main className="App-main">
        <div className="control-panel">
          <div className="section">
            <h2>1. Load a Model</h2>
            <ModelLoader onModelLoad={handleModelLoad} />
            <div className="demo-section">
              <button onClick={loadTestDemo} className="demo-button">
                🚀 Load Demo (Test CNN + Sample Image)
              </button>
            </div>
            {model && (
              <div className="model-info">
                <h3>Model Loaded Successfully!</h3>
                <p>Layers: {layers.length}</p>
                <p>Input Shape: {model.inputs[0].shape?.slice(1).join(' × ')}</p>
              </div>
            )}
          </div>

          <div className="section">
            <h2>2. Upload an Image</h2>
            <ImageUploader onImageLoad={handleImageLoad} disabled={!model} />
          </div>

          <div className="section">
            <h2>3. Select a Layer</h2>
            <LayerSelector 
              layers={layers} 
              selectedLayer={selectedLayer}
              onLayerSelect={handleLayerSelect}
              disabled={!inputImage}
            />
          </div>
        </div>

        <div className="visualization-panel">
          <h2>Feature Map Visualization</h2>
          {isProcessing && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Generating feature maps...</p>
            </div>
          )}
          
          {featureMaps && selectedLayer !== null && (
            <FeatureMapDisplay 
              featureMaps={featureMaps}
              layerInfo={layers[selectedLayer]}
              inputImage={inputImage}
            />
          )}

          {!model && (
            <div className="placeholder">
              <h3>Welcome to the CNN Feature Map Visualizer!</h3>
              <p>This tool helps you understand how Convolutional Neural Networks process images by visualizing the feature maps at each layer.</p>
              <div className="instructions">
                <h4>How to use:</h4>
                <ol>
                  <li>Load a pre-trained model or create one in the CNN Builder</li>
                  <li>Upload an image to analyze</li>
                  <li>Select a layer to see its feature maps</li>
                  <li>Explore how the network transforms the image at each step</li>
                </ol>
              </div>
            </div>
          )}

          {model && !inputImage && (
            <div className="placeholder">
              <h3>Model loaded! Now upload an image to analyze.</h3>
              <p>Choose an image that your model can process (typically 28×28 for MNIST or 224×224 for other models).</p>
            </div>
          )}

          {model && inputImage && selectedLayer === null && (
            <div className="placeholder">
              <h3>Great! Now select a layer to visualize its feature maps.</h3>
              <p>Different layers capture different aspects:</p>
              <ul>
                <li><strong>Early layers:</strong> Edges, textures, simple patterns</li>
                <li><strong>Middle layers:</strong> Shapes, object parts</li>
                <li><strong>Later layers:</strong> Complex features, whole objects</li>
              </ul>
            </div>
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>Built with TensorFlow.js • <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">← Back to CNN Builder</a></p>
      </footer>
    </div>
  );
}

export default App;
