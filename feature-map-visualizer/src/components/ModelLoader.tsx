import React, { useState } from 'react';
import * as tf from '@tensorflow/tfjs';

interface ModelLoaderProps {
  onModelLoad: (model: tf.LayersModel) => void;
}

const ModelLoader: React.FC<ModelLoaderProps> = ({ onModelLoad }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPretrainedModel = async (modelType: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let model: tf.LayersModel;
      
      if (modelType === 'simple-mnist') {
        // Create a simple MNIST model for demonstration
        model = createSimpleMNISTModel();
      } else if (modelType === 'demo-cnn') {
        // Create a demo CNN with multiple conv layers
        model = createDemoCNN();
      } else {
        throw new Error('Unknown model type');
      }
      
      console.log('Model loaded:', model);
      onModelLoad(model);
    } catch (err) {
      setError(`Failed to load model: ${err}`);
      console.error('Model loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const modelFile = files[0];
      if (modelFile.name.endsWith('.json')) {
        // Load from JSON file (and accompanying weights)
        const model = await tf.loadLayersModel(tf.io.browserFiles([modelFile]));
        onModelLoad(model);
      } else {
        throw new Error('Please select a model.json file');
      }
    } catch (err) {
      setError(`Failed to load model: ${err}`);
      console.error('Model loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="model-loader">
      <div className="model-options">
        <h4>Demo Models</h4>
        <div className="demo-models">
          <button 
            onClick={() => loadPretrainedModel('simple-mnist')}
            disabled={isLoading}
          >
            Simple MNIST CNN
          </button>
          <button 
            onClick={() => loadPretrainedModel('demo-cnn')}
            disabled={isLoading}
          >
            Demo CNN (Multi-layer)
          </button>
        </div>
        
        <h4>Load from File</h4>
        <input
          type="file"
          accept=".json"
          onChange={loadFromFile}
          disabled={isLoading}
        />
        <p className="file-info">Select a model.json file from the CNN Builder</p>
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading model...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}
    </div>
  );
};

// Helper function to create a simple MNIST model for demonstration
const createSimpleMNISTModel = (): tf.LayersModel => {
  const model = tf.sequential({
    layers: [
      tf.layers.conv2d({
        inputShape: [28, 28, 1],
        kernelSize: 3,
        filters: 8,
        activation: 'relu',
        name: 'conv2d_1'
      }),
      tf.layers.maxPooling2d({
        poolSize: 2,
        name: 'max_pooling2d_1'
      }),
      tf.layers.conv2d({
        kernelSize: 3,
        filters: 16,
        activation: 'relu',
        name: 'conv2d_2'
      }),
      tf.layers.maxPooling2d({
        poolSize: 2,
        name: 'max_pooling2d_2'
      }),
      tf.layers.flatten({
        name: 'flatten_1'
      }),
      tf.layers.dense({
        units: 32,
        activation: 'relu',
        name: 'dense_1'
      }),
      tf.layers.dense({
        units: 10,
        activation: 'softmax',
        name: 'dense_2'
      })
    ]
  });

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
};

// Helper function to create a demo CNN with more layers
const createDemoCNN = (): tf.LayersModel => {
  const model = tf.sequential({
    layers: [
      tf.layers.conv2d({
        inputShape: [28, 28, 1],
        kernelSize: 3,
        filters: 4,
        activation: 'relu',
        name: 'conv2d_1'
      }),
      tf.layers.batchNormalization({
        name: 'batch_normalization_1'
      }),
      tf.layers.conv2d({
        kernelSize: 3,
        filters: 8,
        activation: 'relu',
        name: 'conv2d_2'
      }),
      tf.layers.maxPooling2d({
        poolSize: 2,
        name: 'max_pooling2d_1'
      }),
      tf.layers.conv2d({
        kernelSize: 3,
        filters: 16,
        activation: 'relu',
        name: 'conv2d_3'
      }),
      tf.layers.batchNormalization({
        name: 'batch_normalization_2'
      }),
      tf.layers.maxPooling2d({
        poolSize: 2,
        name: 'max_pooling2d_2'
      }),
      tf.layers.flatten({
        name: 'flatten_1'
      }),
      tf.layers.dense({
        units: 64,
        activation: 'relu',
        name: 'dense_1'
      }),
      tf.layers.dropout({
        rate: 0.5,
        name: 'dropout_1'
      }),
      tf.layers.dense({
        units: 10,
        activation: 'softmax',
        name: 'dense_2'
      })
    ]
  });

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
};

export default ModelLoader;
