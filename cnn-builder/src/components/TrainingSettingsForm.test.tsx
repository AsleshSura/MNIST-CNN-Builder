import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TrainingSettingsForm from './TrainingSettingsForm';
import { TrainingSettings } from '../types/layers';

describe('TrainingSettingsForm Component', () => {
  const mockOnChange = jest.fn();
  
  const defaultSettings: TrainingSettings = {
    epochs: 5,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: 'adam'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders training settings form', () => {
    render(
      <TrainingSettingsForm 
        settings={defaultSettings}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByText(/Training Settings/i)).toBeInTheDocument();
  });

  test('displays current settings values', () => {
    render(
      <TrainingSettingsForm 
        settings={defaultSettings}
        onChange={mockOnChange}
      />
    );
    
    expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // epochs
    expect(screen.getByDisplayValue('32')).toBeInTheDocument(); // batch size
    expect(screen.getByDisplayValue('0.001')).toBeInTheDocument(); // learning rate
    
    // For select elements, check if the correct option is selected
    const optimizerSelect = screen.getByTitle('Algorithm used to update model weights') as HTMLSelectElement;
    expect(optimizerSelect.value).toBe('adam');
  });

  test('calls onChange when epochs changed', () => {
    render(
      <TrainingSettingsForm 
        settings={defaultSettings}
        onChange={mockOnChange}
      />
    );
    
    const epochsInput = screen.getByDisplayValue('5');
    fireEvent.change(epochsInput, { target: { value: '10' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultSettings,
      epochs: 10
    });
  });

  test('calls onChange when optimizer changed', () => {
    render(
      <TrainingSettingsForm 
        settings={defaultSettings}
        onChange={mockOnChange}
      />
    );
    
    const optimizerSelect = screen.getByTitle('Algorithm used to update model weights');
    fireEvent.change(optimizerSelect, { target: { value: 'sgd' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultSettings,
      optimizer: 'sgd'
    });
  });

  test('handles batch size changes', () => {
    render(
      <TrainingSettingsForm 
        settings={defaultSettings}
        onChange={mockOnChange}
      />
    );
    
    const batchSizeInput = screen.getByDisplayValue('32');
    fireEvent.change(batchSizeInput, { target: { value: '64' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultSettings,
      batchSize: 64
    });
  });

  test('handles learning rate changes', () => {
    render(
      <TrainingSettingsForm 
        settings={defaultSettings}
        onChange={mockOnChange}
      />
    );
    
    const learningRateInput = screen.getByDisplayValue('0.001');
    fireEvent.change(learningRateInput, { target: { value: '0.01' } });
    
    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultSettings,
      learningRate: 0.01
    });
  });
});
