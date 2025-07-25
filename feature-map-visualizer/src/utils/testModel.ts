// Test model creation for the feature map visualizer
// This will create and save a simple CNN model for testing

import * as tf from '@tensorflow/tfjs';

export const createTestModel = () => {
  const model = tf.sequential({
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

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  });

  return model;
};

export const saveTestModel = async () => {
  const model = createTestModel();
  await model.save('downloads://test-cnn-model');
  console.log('Test model saved to downloads');
  return model;
};

// Generate a sample MNIST-like image for testing
export const generateTestImage = () => {
  // Create a simple 28x28 test image with some patterns
  const imageData = new Float32Array(28 * 28);
  
  // Create a simple pattern - a diagonal line and some noise
  for (let i = 0; i < 28; i++) {
    for (let j = 0; j < 28; j++) {
      const idx = i * 28 + j;
      
      // Diagonal line
      if (Math.abs(i - j) < 2) {
        imageData[idx] = 1.0;
      }
      // Add some random noise
      else if (Math.random() > 0.8) {
        imageData[idx] = Math.random() * 0.5;
      }
      // Background
      else {
        imageData[idx] = 0.0;
      }
    }
  }
  
  return tf.tensor4d(imageData, [1, 28, 28, 1]);
};
