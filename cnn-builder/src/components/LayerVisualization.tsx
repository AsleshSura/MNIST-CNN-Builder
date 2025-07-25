import React from 'react';
import { CNNLayer } from '../types/layers';

interface LayerVisualizationProps {
    layers: CNNLayer[];
}

interface LayerDimensions {
    width: number;
    height: number;
    depth: number;
    displayName: string;
    description: string;
}

const LayerVisualization: React.FC<LayerVisualizationProps> = ({ layers }) => {
    // Calculate output dimensions for each layer
    const calculateLayerDimensions = (layers: CNNLayer[]): LayerDimensions[] => {
        const dimensions: LayerDimensions[] = [];
        let currentWidth = 28;  // MNIST input width
        let currentHeight = 28; // MNIST input height
        let currentDepth = 1;   // Grayscale input

        // Add input layer
        dimensions.push({
            width: currentWidth,
            height: currentHeight,
            depth: currentDepth,
            displayName: 'Input',
            description: 'MNIST digit image (28×28×1)'
        });

        for (const layer of layers) {
            switch (layer.type) {
                case 'Conv2D':
                    // Conv2D changes depth (filters) but width/height depend on padding
                    if (layer.padding === 'same') {
                        // Same padding preserves spatial dimensions
                        currentWidth = Math.ceil(currentWidth / layer.strides);
                        currentHeight = Math.ceil(currentHeight / layer.strides);
                    } else {
                        // Valid padding reduces spatial dimensions
                        currentWidth = Math.ceil((currentWidth - layer.kernelSize + 1) / layer.strides);
                        currentHeight = Math.ceil((currentHeight - layer.kernelSize + 1) / layer.strides);
                    }
                    currentDepth = layer.filters;
                    dimensions.push({
                        width: currentWidth,
                        height: currentHeight,
                        depth: currentDepth,
                        displayName: 'Conv2D',
                        description: `${layer.filters} filters, ${layer.kernelSize}×${layer.kernelSize} kernel`
                    });
                    break;

                case 'MaxPooling2D':
                    if (layer.padding === 'same') {
                        currentWidth = Math.ceil(currentWidth / layer.strides);
                        currentHeight = Math.ceil(currentHeight / layer.strides);
                    } else {
                        currentWidth = Math.ceil((currentWidth - layer.poolSize + 1) / layer.strides);
                        currentHeight = Math.ceil((currentHeight - layer.poolSize + 1) / layer.strides);
                    }
                    dimensions.push({
                        width: currentWidth,
                        height: currentHeight,
                        depth: currentDepth,
                        displayName: 'MaxPool2D',
                        description: `${layer.poolSize}×${layer.poolSize} pooling`
                    });
                    break;

                case 'Flatten':
                    const flattenedSize = currentWidth * currentHeight * currentDepth;
                    dimensions.push({
                        width: flattenedSize,
                        height: 1,
                        depth: 1,
                        displayName: 'Flatten',
                        description: `Flattened to ${flattenedSize} units`
                    });
                    currentWidth = flattenedSize;
                    currentHeight = 1;
                    currentDepth = 1;
                    break;

                case 'Dense':
                    dimensions.push({
                        width: layer.units,
                        height: 1,
                        depth: 1,
                        displayName: 'Dense',
                        description: `${layer.units} neurons`
                    });
                    currentWidth = layer.units;
                    break;

                case 'ReLU':
                    dimensions.push({
                        width: currentWidth,
                        height: currentHeight,
                        depth: currentDepth,
                        displayName: 'ReLU',
                        description: 'Activation function'
                    });
                    break;

                case 'BatchNormalization':
                    dimensions.push({
                        width: currentWidth,
                        height: currentHeight,
                        depth: currentDepth,
                        displayName: 'BatchNorm',
                        description: 'Batch normalization'
                    });
                    break;

                case 'Dropout':
                    dimensions.push({
                        width: currentWidth,
                        height: currentHeight,
                        depth: currentDepth,
                        displayName: 'Dropout',
                        description: `${(layer.rate * 100)}% dropout rate`
                    });
                    break;

                case 'Softmax':
                    dimensions.push({
                        width: currentWidth,
                        height: currentHeight,
                        depth: currentDepth,
                        displayName: 'Softmax',
                        description: 'Output probabilities'
                    });
                    break;
            }
        }

        return dimensions;
    };

    const layerDimensions = calculateLayerDimensions(layers);

    const renderLayer = (dim: LayerDimensions, index: number) => {
        const isFlattened = dim.height === 1 && dim.depth === 1;
        const is3D = !isFlattened && dim.depth > 1;
        
        // Scale dimensions for visualization
        const maxDim = 100;
        const scale = Math.min(maxDim / Math.max(dim.width, dim.height, dim.depth), 1);
        
        const visualWidth = isFlattened ? Math.min(dim.width * 2, 200) : dim.width * scale;
        const visualHeight = isFlattened ? 20 : dim.height * scale;
        const visualDepth = is3D ? dim.depth * scale * 0.5 : 0;

        // Get layer type-specific styling
        const getLayerStyle = (displayName: string) => {
            const baseStyle: React.CSSProperties = {};
            
            switch (displayName) {
                case 'Input':
                    return { ...baseStyle, background: 'linear-gradient(135deg, #51cf66, #69db7c)' };
                case 'Conv2D':
                    return { ...baseStyle, background: 'linear-gradient(135deg, #4e9cff, #44d9e8)' };
                case 'MaxPool2D':
                    return { ...baseStyle, background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)' };
                case 'Flatten':
                    return { ...baseStyle, background: 'linear-gradient(90deg, #ffd93d, #ffec8c)' };
                case 'Dense':
                    return { ...baseStyle, background: 'linear-gradient(135deg, #9775fa, #b197fc)' };
                case 'ReLU':
                    return { ...baseStyle, background: 'linear-gradient(135deg, #ff922b, #ffb84d)' };
                case 'BatchNorm':
                    return { ...baseStyle, background: 'linear-gradient(135deg, #20c997, #51cf66)' };
                case 'Dropout':
                    return { ...baseStyle, background: 'linear-gradient(135deg, #868e96, #adb5bd)' };
                case 'Softmax':
                    return { ...baseStyle, background: 'linear-gradient(135deg, #e03131, #ff6b6b)' };
                default:
                    return { ...baseStyle, background: 'linear-gradient(135deg, #4e9cff, #44d9e8)' };
            }
        };

        const layerStyle = getLayerStyle(dim.displayName);

        return (
            <div key={index} className="layer-visualization-item">
                <div className="layer-visual">
                    {isFlattened ? (
                        // Render as a long bar for flattened layers
                        <div 
                            className="layer-shape layer-1d"
                            style={{
                                width: `${visualWidth}px`,
                                height: `${visualHeight}px`,
                                ...layerStyle
                            }}
                        />
                    ) : is3D ? (
                        // Render as 3D-looking rectangle for feature maps
                        <div className="layer-3d-container">
                            <div 
                                className="layer-shape layer-3d"
                                style={{
                                    width: `${visualWidth}px`,
                                    height: `${visualHeight}px`,
                                    transform: `translate(${visualDepth}px, -${visualDepth}px)`,
                                    ...layerStyle
                                }}
                            />
                            <div 
                                className="layer-shape layer-3d-back"
                                style={{
                                    width: `${visualWidth}px`,
                                    height: `${visualHeight}px`,
                                    ...layerStyle,
                                    filter: 'brightness(0.7)'
                                }}
                            />
                            {/* Side faces for 3D effect */}
                            <div 
                                className="layer-3d-side-right"
                                style={{
                                    width: `${visualDepth}px`,
                                    height: `${visualHeight}px`,
                                    left: `${visualWidth}px`,
                                    transform: `skewY(-30deg) translateX(-${visualDepth/2}px)`,
                                    ...layerStyle,
                                    filter: 'brightness(0.5)'
                                }}
                            />
                            <div 
                                className="layer-3d-side-top"
                                style={{
                                    width: `${visualWidth}px`,
                                    height: `${visualDepth}px`,
                                    top: `-${visualDepth}px`,
                                    transform: `skewX(-30deg) translateY(${visualDepth/2}px)`,
                                    ...layerStyle,
                                    filter: 'brightness(0.5)'
                                }}
                            />
                        </div>
                    ) : (
                        // Render as 2D rectangle
                        <div 
                            className="layer-shape layer-2d"
                            style={{
                                width: `${visualWidth}px`,
                                height: `${visualHeight}px`,
                                ...layerStyle
                            }}
                        />
                    )}
                </div>
                
                <div className="layer-info-viz">
                    <div className="layer-name">{dim.displayName}</div>
                    <div className="layer-dimensions">
                        {isFlattened ? 
                            `${dim.width}` : 
                            `${dim.width}×${dim.height}${dim.depth > 1 ? `×${dim.depth}` : ''}`
                        }
                    </div>
                    <div className="layer-description">{dim.description}</div>
                </div>
                
                {index < layerDimensions.length - 1 && (
                    <div className="layer-arrow">→</div>
                )}
            </div>
        );
    };

    if (layers.length === 0) {
        return (
            <div className="layer-visualization-empty">
                <p>Add some layers to see the architecture visualization!</p>
                <div className="sample-flow">
                    <div className="sample-layer">Input (28×28×1)</div>
                    <div className="layer-arrow">→</div>
                    <div className="sample-layer">Conv2D</div>
                    <div className="layer-arrow">→</div>
                    <div className="sample-layer">ReLU</div>
                    <div className="layer-arrow">→</div>
                    <div className="sample-layer">...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="layer-visualization">
            <h3>Architecture Visualization</h3>
            
            {/* Color Legend */}
            <div className="layer-legend">
                <div className="legend-item">
                    <div className="legend-color" style={{ background: 'linear-gradient(135deg, #51cf66, #69db7c)' }}></div>
                    <span>Input</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: 'linear-gradient(135deg, #4e9cff, #44d9e8)' }}></div>
                    <span>Convolution</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)' }}></div>
                    <span>Pooling</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: 'linear-gradient(90deg, #ffd93d, #ffec8c)' }}></div>
                    <span>Flatten</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: 'linear-gradient(135deg, #9775fa, #b197fc)' }}></div>
                    <span>Dense</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color" style={{ background: 'linear-gradient(135deg, #ff922b, #ffb84d)' }}></div>
                    <span>Activation</span>
                </div>
            </div>
            
            <div className="layer-flow">
                {layerDimensions.map((dim, index) => renderLayer(dim, index))}
            </div>
            
            {/* Summary stats */}
            <div className="architecture-summary">
                <div className="summary-item">
                    <strong>Total Layers:</strong> {layers.length + 1} (including input)
                </div>
                <div className="summary-item">
                    <strong>Output Shape:</strong> {
                        layerDimensions.length > 1 ? 
                        (() => {
                            const lastDim = layerDimensions[layerDimensions.length - 1];
                            return lastDim.height === 1 && lastDim.depth === 1 ? 
                                `${lastDim.width}` : 
                                `${lastDim.width}×${lastDim.height}${lastDim.depth > 1 ? `×${lastDim.depth}` : ''}`;
                        })() : 
                        '28×28×1'
                    }
                </div>
                <div className="summary-item">
                    <strong>Parameters:</strong> {calculateTotalParameters(layers)}
                </div>
            </div>
        </div>
    );
};

// Helper function to estimate parameter count
const calculateTotalParameters = (layers: CNNLayer[]): string => {
    let totalParams = 0;
    let currentDepth = 1; // Input depth
    
    for (const layer of layers) {
        switch (layer.type) {
            case 'Conv2D':
                // (kernel_height * kernel_width * input_depth + 1) * num_filters
                const convParams = (layer.kernelSize * layer.kernelSize * currentDepth + 1) * layer.filters;
                totalParams += convParams;
                currentDepth = layer.filters;
                break;
            case 'Dense':
                // This is simplified - would need to track actual input size
                totalParams += layer.units * 100; // Rough estimate
                break;
        }
    }
    
    if (totalParams < 1000) {
        return totalParams.toString();
    } else if (totalParams < 1000000) {
        return `${(totalParams / 1000).toFixed(1)}K`;
    } else {
        return `${(totalParams / 1000000).toFixed(1)}M`;
    }
};

export default LayerVisualization;
