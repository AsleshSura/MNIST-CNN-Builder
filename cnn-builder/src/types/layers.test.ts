import { CNNLayer, LayerType, TrainingSettings } from './layers';

describe('Layer Types', () => {
  test('Conv2D layer type is properly defined', () => {
    const conv2dLayer: CNNLayer = {
      type: 'Conv2D',
      filters: 32,
      kernelSize: 3,
      strides: 1,
      padding: 'same'
    };
    
    expect(conv2dLayer.type).toBe('Conv2D');
    expect(conv2dLayer.filters).toBe(32);
    expect(conv2dLayer.kernelSize).toBe(3);
  });

  test('ReLU layer type is properly defined', () => {
    const reluLayer: CNNLayer = {
      type: 'ReLU'
    };
    
    expect(reluLayer.type).toBe('ReLU');
  });

  test('MaxPooling2D layer type is properly defined', () => {
    const poolingLayer: CNNLayer = {
      type: 'MaxPooling2D',
      poolSize: 2,
      strides: 2,
      padding: 'valid'
    };
    
    expect(poolingLayer.type).toBe('MaxPooling2D');
    expect(poolingLayer.poolSize).toBe(2);
  });

  test('Dense layer type is properly defined', () => {
    const denseLayer: CNNLayer = {
      type: 'Dense',
      units: 10
    };
    
    expect(denseLayer.type).toBe('Dense');
    expect(denseLayer.units).toBe(10);
  });

  test('Dropout layer type is properly defined', () => {
    const dropoutLayer: CNNLayer = {
      type: 'Dropout',
      rate: 0.5
    };
    
    expect(dropoutLayer.type).toBe('Dropout');
    expect(dropoutLayer.rate).toBe(0.5);
  });

  test('all layer types are defined', () => {
    const layerTypes: LayerType[] = [
      'Conv2D',
      'ReLU',
      'MaxPooling2D',
      'BatchNormalization',
      'Dropout',
      'Flatten',
      'Dense',
      'Softmax'
    ];
    
    layerTypes.forEach(type => {
      expect(typeof type).toBe('string');
    });
  });

  test('training settings are properly defined', () => {
    const settings: TrainingSettings = {
      epochs: 5,
      batchSize: 32,
      learningRate: 0.001,
      optimizer: 'adam'
    };
    
    expect(settings.epochs).toBe(5);
    expect(settings.batchSize).toBe(32);
    expect(settings.learningRate).toBe(0.001);
    expect(settings.optimizer).toBe('adam');
  });
});
