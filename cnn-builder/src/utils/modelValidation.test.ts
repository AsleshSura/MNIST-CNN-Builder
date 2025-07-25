import { validateLayerSequence, validateForTraining, getRecommendedNextLayers } from './modelValidation';
import { CNNLayer } from '../types/layers';

describe('Model Validation', () => {
  describe('validateLayerSequence', () => {
    test('empty layer array is valid', () => {
      const result = validateLayerSequence([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('single Conv2D layer is valid with warning', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' }
      ];
      const result = validateLayerSequence(layers);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    test('Conv2D with invalid parameters produces errors', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 0, kernelSize: 3, strides: 1, padding: 'same' }
      ];
      const result = validateLayerSequence(layers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Conv2D layer at position 1: filters must be positive');
    });

    test('Dense before Flatten produces error', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' },
        { type: 'Dense', units: 10 }
      ];
      const result = validateLayerSequence(layers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Dense layer at position 2 must come after Flatten layer');
    });

    test('final Dense layer with wrong units produces error', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' },
        { type: 'Flatten' },
        { type: 'Dense', units: 5 }
      ];
      const result = validateLayerSequence(layers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Final Dense layer must have exactly 10 units for MNIST classification, but has 5 units');
    });

    test('valid MNIST model structure passes validation', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' },
        { type: 'ReLU' },
        { type: 'MaxPooling2D', poolSize: 2, strides: 2, padding: 'valid' },
        { type: 'Flatten' },
        { type: 'Dense', units: 10 },
        { type: 'Softmax' }
      ];
      const result = validateLayerSequence(layers);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateForTraining', () => {
    test('empty model cannot be trained', () => {
      const result = validateForTraining([]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Cannot train an empty model. Add some layers first.');
    });

    test('model without Flatten cannot be trained', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' },
        { type: 'Dense', units: 10 }
      ];
      const result = validateForTraining(layers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Model must have a Flatten layer to transition from 2D to 1D data');
    });

    test('model without Dense cannot be trained', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' },
        { type: 'Flatten' }
      ];
      const result = validateForTraining(layers);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Model must have at least one Dense layer for classification');
    });

    test('trainable model passes validation', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' },
        { type: 'Flatten' },
        { type: 'Dense', units: 10 },
        { type: 'Softmax' }
      ];
      const result = validateForTraining(layers);
      expect(result.isValid).toBe(true);
    });
  });

  describe('getRecommendedNextLayers', () => {
    test('empty model recommends Conv2D', () => {
      const recommendations = getRecommendedNextLayers([]);
      expect(recommendations).toContain('Conv2D');
    });

    test('Conv2D layer recommends activation', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' }
      ];
      const recommendations = getRecommendedNextLayers(layers);
      expect(recommendations).toContain('ReLU');
    });

    test('after Flatten recommends Dense', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' },
        { type: 'Flatten' }
      ];
      const recommendations = getRecommendedNextLayers(layers);
      expect(recommendations).toContain('Dense');
    });

    test('after Softmax recommends nothing', () => {
      const layers: CNNLayer[] = [
        { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' },
        { type: 'Flatten' },
        { type: 'Dense', units: 10 },
        { type: 'Softmax' }
      ];
      const recommendations = getRecommendedNextLayers(layers);
      expect(recommendations).toHaveLength(0);
    });
  });
});
