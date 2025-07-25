import React from 'react';

interface LayerInfo {
  name: string;
  index: number;
  shape: number[];
  type: string;
}

interface LayerSelectorProps {
  layers: LayerInfo[];
  selectedLayer: number | null;
  onLayerSelect: (layerIndex: number) => void;
  disabled?: boolean;
}

const LayerSelector: React.FC<LayerSelectorProps> = ({ 
  layers, 
  selectedLayer, 
  onLayerSelect, 
  disabled = false 
}) => {
  const getLayerDescription = (layer: LayerInfo): string => {
    switch (layer.type) {
      case 'Conv2D':
        const [, height, width, filters] = layer.shape;
        return `Conv2D - ${height}×${width}×${filters}`;
      case 'MaxPooling2D':
        const [, poolH, poolW, poolF] = layer.shape;
        return `MaxPool2D - ${poolH}×${poolW}×${poolF}`;
      case 'Flatten':
        return `Flatten - ${layer.shape[1]} units`;
      case 'Dense':
        return `Dense - ${layer.shape[1]} units`;
      case 'Dropout':
        return `Dropout - ${layer.shape[1]} units`;
      case 'BatchNormalization':
        return `BatchNorm - ${layer.shape.slice(1).join('×')}`;
      default:
        return `${layer.type} - ${layer.shape.slice(1).join('×')}`;
    }
  };

  const isVisualizableLayer = (layer: LayerInfo): boolean => {
    // Only show layers that produce meaningful feature maps
    return ['Conv2D', 'MaxPooling2D', 'BatchNormalization'].includes(layer.type);
  };

  const visualizableLayers = layers.filter(isVisualizableLayer);

  if (visualizableLayers.length === 0) {
    return (
      <div className="layer-selector">
        <p>No visualizable layers found. Load a model with Conv2D layers.</p>
      </div>
    );
  }

  return (
    <div className="layer-selector">
      {visualizableLayers.map((layer) => (
        <div
          key={layer.index}
          className={`layer-item ${
            selectedLayer === layer.index ? 'selected' : ''
          } ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && onLayerSelect(layer.index)}
        >
          <div className="layer-name">
            {layer.name || `Layer ${layer.index + 1}`}
          </div>
          <div className="layer-details">
            {getLayerDescription(layer)}
          </div>
        </div>
      ))}
      
      {disabled && (
        <p className="disabled-message">Upload an image first to select layers</p>
      )}
    </div>
  );
};

export default LayerSelector;
