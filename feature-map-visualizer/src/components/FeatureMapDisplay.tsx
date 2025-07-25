import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

interface LayerInfo {
  name: string;
  index: number;
  shape: number[];
  type: string;
}

interface FeatureMapDisplayProps {
  featureMaps: tf.Tensor;
  layerInfo: LayerInfo;
  inputImage: tf.Tensor | null;
}

const FeatureMapDisplay: React.FC<FeatureMapDisplayProps> = ({ 
  featureMaps, 
  layerInfo, 
  inputImage 
}) => {
  const [processedMaps, setProcessedMaps] = useState<Float32Array[]>([]);
  const [stats, setStats] = useState<{
    numMaps: number;
    mapSize: string;
    activationRange: string;
  } | null>(null);

  useEffect(() => {
    const processFeatureMaps = async () => {
      if (!featureMaps) return;

      try {
        // Get the feature map data
        const data = await featureMaps.data();
        const shape = featureMaps.shape;
        
        let maps: Float32Array[] = [];
        let numMaps = 0;
        let mapHeight = 0;
        let mapWidth = 0;

        if (shape.length === 4) {
          // Conv2D output: [batch, height, width, channels]
          const [batch, height, width, channels] = shape;
          numMaps = channels;
          mapHeight = height;
          mapWidth = width;

          // Extract each feature map
          for (let c = 0; c < channels; c++) {
            const map = new Float32Array(height * width);
            for (let h = 0; h < height; h++) {
              for (let w = 0; w < width; w++) {
                const idx = h * width * channels + w * channels + c;
                map[h * width + w] = data[idx];
              }
            }
            maps.push(map);
          }
        } else if (shape.length === 2) {
          // Dense layer output: [batch, units]
          const [batch, units] = shape;
          numMaps = 1;
          mapHeight = Math.ceil(Math.sqrt(units));
          mapWidth = mapHeight;

          // Reshape dense output into a square-ish map
          const map = new Float32Array(mapHeight * mapWidth);
          for (let i = 0; i < units; i++) {
            map[i] = data[i];
          }
          maps.push(map);
        }

        setProcessedMaps(maps);

        // Calculate statistics
        const allValues = Array.from(data);
        const min = Math.min(...allValues);
        const max = Math.max(...allValues);
        
        setStats({
          numMaps,
          mapSize: `${mapHeight}×${mapWidth}`,
          activationRange: `${min.toFixed(3)} to ${max.toFixed(3)}`
        });

      } catch (error) {
        console.error('Error processing feature maps:', error);
      }
    };

    processFeatureMaps();
  }, [featureMaps]);

  const renderFeatureMap = (mapData: Float32Array, index: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Determine dimensions
    const size = Math.sqrt(mapData.length);
    const height = Math.floor(size);
    const width = Math.ceil(mapData.length / height);
    
    canvas.width = width;
    canvas.height = height;

    // Normalize data to 0-255 range
    let min = mapData[0];
    let max = mapData[0];
    for (let i = 1; i < mapData.length; i++) {
      if (mapData[i] < min) min = mapData[i];
      if (mapData[i] > max) max = mapData[i];
    }
    const range = max - min;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < mapData.length; i++) {
      const normalized = range > 0 ? (mapData[i] - min) / range : 0;
      const value = Math.floor(normalized * 255);
      
      const pixelIndex = i * 4;
      data[pixelIndex] = value;     // R
      data[pixelIndex + 1] = value; // G
      data[pixelIndex + 2] = value; // B
      data[pixelIndex + 3] = 255;   // A
    }

    ctx.putImageData(imageData, 0, 0);

    return (
      <div key={index} className="feature-map-item">
        <canvas
          className="feature-map-canvas"
          width={width * 4} // Scale up for visibility
          height={height * 4}
          style={{
            imageRendering: 'pixelated',
            width: `${width * 4}px`,
            height: `${height * 4}px`
          }}
          ref={(canvasRef) => {
            if (canvasRef) {
              const scaledCtx = canvasRef.getContext('2d');
              if (scaledCtx) {
                scaledCtx.imageSmoothingEnabled = false;
                scaledCtx.drawImage(canvas, 0, 0, width * 4, height * 4);
              }
            }
          }}
        />
        <div className="feature-map-label">
          Filter {index + 1}
        </div>
      </div>
    );
  };

  const renderInputImage = () => {
    if (!inputImage) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const shape = inputImage.shape;
    if (shape.length === 4) {
      const [batch, height, width, channels] = shape;
      canvas.width = width;
      canvas.height = height;

      inputImage.data().then(data => {
        const imageData = ctx.createImageData(width, height);
        const imgData = imageData.data;

        for (let i = 0; i < height * width; i++) {
          const value = Math.floor(data[i] * 255);
          const pixelIndex = i * 4;
          imgData[pixelIndex] = value;     // R
          imgData[pixelIndex + 1] = value; // G
          imgData[pixelIndex + 2] = value; // B
          imgData[pixelIndex + 3] = 255;   // A
        }

        ctx.putImageData(imageData, 0, 0);
      });

      return (
        <div className="input-preview">
          <div>
            <h4>Input Image</h4>
            <canvas
              className="input-image"
              width={width * 8}
              height={height * 8}
              style={{
                imageRendering: 'pixelated',
                width: `${width * 8}px`,
                height: `${height * 8}px`
              }}
              ref={(canvasRef) => {
                if (canvasRef) {
                  const scaledCtx = canvasRef.getContext('2d');
                  if (scaledCtx) {
                    scaledCtx.imageSmoothingEnabled = false;
                    setTimeout(() => {
                      scaledCtx.drawImage(canvas, 0, 0, width * 8, height * 8);
                    }, 100);
                  }
                }
              }}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="feature-map-display">
      {renderInputImage()}
      
      <div className="layer-info">
        <h3>{layerInfo.name || `Layer ${layerInfo.index + 1}`}</h3>
        <p>Type: {layerInfo.type}</p>
        
        {stats && (
          <div className="layer-stats">
            <div className="stat-item">
              <div className="stat-label">Feature Maps</div>
              <div className="stat-value">{stats.numMaps}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Map Size</div>
              <div className="stat-value">{stats.mapSize}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Activation Range</div>
              <div className="stat-value">{stats.activationRange}</div>
            </div>
          </div>
        )}
      </div>

      <div className="feature-maps-container">
        <h4>Feature Maps ({processedMaps.length})</h4>
        <div className="feature-maps-grid">
          {processedMaps.map((mapData, index) => renderFeatureMap(mapData, index))}
        </div>
        
        {processedMaps.length === 0 && (
          <p>No feature maps to display</p>
        )}
      </div>
    </div>
  );
};

export default FeatureMapDisplay;
