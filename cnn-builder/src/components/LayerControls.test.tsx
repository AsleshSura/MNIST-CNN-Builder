import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LayerControls from './LayerControls';
import { CNNLayer } from '../types/layers';

// Mock the entire module with inline functions
jest.mock('../utils/modelValidation', () => ({
  validateLayerSequence: jest.fn(() => ({
    isValid: true,
    errors: [],
    warnings: []
  })),
  getRecommendedNextLayers: jest.fn(() => ['Conv2D', 'ReLU'])
}));

describe('LayerControls Component', () => {
  const mockOnAdd = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockOnCancel = jest.fn();
  
  const sampleLayers: CNNLayer[] = [
    { type: 'Conv2D', filters: 32, kernelSize: 3, strides: 1, padding: 'same' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders in add mode', () => {
    render(
      <LayerControls 
        mode="add"
        onAdd={mockOnAdd}
        currentLayers={sampleLayers}
      />
    );
    
    expect(screen.getByRole('button', { name: /Add Layer/i })).toBeInTheDocument();
  });

  test('renders in edit mode', () => {
    const editingLayer: CNNLayer = { 
      type: 'Conv2D', 
      filters: 16, 
      kernelSize: 5, 
      strides: 1, 
      padding: 'valid' 
    };
    
    render(
      <LayerControls 
        mode="edit"
        onUpdate={mockOnUpdate}
        onCancel={mockOnCancel}
        currentLayers={sampleLayers}
        editingLayer={editingLayer}
      />
    );
    
    expect(screen.getByText(/Edit Layer/i)).toBeInTheDocument();
  });

  test('shows layer type selection', () => {
    render(
      <LayerControls 
        mode="add"
        onAdd={mockOnAdd}
        currentLayers={[]}
      />
    );
    
    // Should show layer type options
    expect(screen.getByDisplayValue('Conv2D')).toBeInTheDocument();
  });

  test('handles layer type change', () => {
    render(
      <LayerControls 
        mode="add"
        onAdd={mockOnAdd}
        currentLayers={[]}
      />
    );
    
    const selectElement = screen.getByDisplayValue('Conv2D') as HTMLSelectElement;
    fireEvent.change(selectElement, { target: { value: 'Dense' } });
    
    // The component should update to show Dense layer options
    expect(selectElement.value).toBe('Dense');
  });

  test('component renders without crashing', () => {
    const { container } = render(
      <LayerControls 
        mode="add"
        onAdd={mockOnAdd}
        currentLayers={[]}
      />
    );
    
    expect(container.firstChild).toBeTruthy();
  });
});
