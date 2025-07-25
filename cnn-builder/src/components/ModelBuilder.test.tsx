import React from 'react';
import { render, screen } from '@testing-library/react';
import ModelBuilder from './ModelBuilder';

// Mock all the child components
jest.mock('./LayerList', () => {
  return function MockLayerList() {
    return <div data-testid="layer-list">Layer List Component</div>;
  };
});

jest.mock('./LayerControls', () => {
  return function MockLayerControls() {
    return <div data-testid="layer-controls">Layer Controls Component</div>;
  };
});

jest.mock('./LayerVisualization', () => {
  return function MockLayerVisualization() {
    return <div data-testid="layer-visualization">Layer Visualization Component</div>;
  };
});

jest.mock('./TrainingSettingsForm', () => {
  return function MockTrainingSettingsForm() {
    return <div data-testid="training-settings">Training Settings Component</div>;
  };
});

jest.mock('./TrainAndVisualize', () => {
  return function MockTrainAndVisualize() {
    return <div data-testid="train-visualize">Train and Visualize Component</div>;
  };
});

jest.mock('./ImportExportControls', () => {
  return function MockImportExportControls() {
    return <div data-testid="import-export">Import Export Component</div>;
  };
});

describe('ModelBuilder Component', () => {
  test('renders ModelBuilder heading', () => {
    render(<ModelBuilder />);
    const headingElement = screen.getByText(/CNN Model Builder/i);
    expect(headingElement).toBeInTheDocument();
  });

  test('renders all child components', () => {
    render(<ModelBuilder />);
    
    expect(screen.getByTestId('layer-list')).toBeInTheDocument();
    expect(screen.getByTestId('layer-controls')).toBeInTheDocument();
    expect(screen.getByTestId('layer-visualization')).toBeInTheDocument();
    expect(screen.getByTestId('training-settings')).toBeInTheDocument();
    expect(screen.getByTestId('train-visualize')).toBeInTheDocument();
    expect(screen.getByTestId('import-export')).toBeInTheDocument();
  });

  test('component mounts without crashing', () => {
    const { container } = render(<ModelBuilder />);
    expect(container.firstChild).toHaveClass('app-container');
  });
});
