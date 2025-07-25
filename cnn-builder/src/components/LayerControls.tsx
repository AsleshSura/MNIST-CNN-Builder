import React, { useState } from 'react';
import { LayerType, CNNLayer } from '../types/layers';
import { validateLayerSequence, getRecommendedNextLayers } from '../utils/modelValidation';

interface LayerControlsProps {
    onAdd?: (layer: CNNLayer) => void;
    onUpdate?: (layer: CNNLayer) => void;
    onCancel?: () => void;
    currentLayers: CNNLayer[];
    editingLayer?: CNNLayer;
    mode?: 'add' | 'edit';
}

const defaultParams: Record<LayerType, CNNLayer> = {
    Conv2D: { type: 'Conv2D', filters: 8, kernelSize: 3, strides: 1, padding: 'same' },
    ReLU: { type: 'ReLU' },
    MaxPooling2D: { type: 'MaxPooling2D', poolSize: 2, strides: 2, padding: 'same' },
    BatchNormalization: { type: 'BatchNormalization' },
    Dropout: { type: 'Dropout', rate: 0.25 },
    Flatten: { type: 'Flatten' },
    Dense: { type: 'Dense', units: 10 }, // Default to 10 for MNIST
    Softmax: { type: 'Softmax' },
};

const LayerControls: React.FC<LayerControlsProps> = ({ 
    onAdd, 
    onUpdate, 
    onCancel, 
    currentLayers, 
    editingLayer, 
    mode = 'add' 
}) => {
    const [layerType, setLayerType] = useState<LayerType>(editingLayer?.type || 'Conv2D');
    const [params, setParams] = useState<CNNLayer>(editingLayer || defaultParams['Conv2D']);

    // Update params when editingLayer changes
    React.useEffect(() => {
        if (editingLayer) {
            setLayerType(editingLayer.type);
            setParams(editingLayer);
        }
    }, [editingLayer]);

    const validation = validateLayerSequence(currentLayers);
    const recommendedLayers = getRecommendedNextLayers(currentLayers);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as LayerType;
        setLayerType(type);
        setParams(defaultParams[type]);
    };

    const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericValue = Number(value);
        const paramValue = isNaN(numericValue) ? value : numericValue;
        
        setParams(prev => ({ ...prev, [name]: paramValue }));
    };

    const handleAdd = () => {
        if (mode === 'edit') {
            // For edit mode, we'll handle this in handleUpdate
            return;
        }

        // Validate the new layer before adding
        const testLayers = [...currentLayers, params];
        const testValidation = validateLayerSequence(testLayers);
        
        if (testValidation.errors.length > 0) {
            alert(`Cannot add layer: ${testValidation.errors.join(', ')}`);
            return;
        }

        onAdd?.(params);
    };

    const handleUpdate = () => {
        if (mode === 'add') {
            handleAdd();
            return;
        }

        // For edit mode, validate the updated layer
        onUpdate?.(params);
    };

    const handleCancel = () => {
        if (mode === 'edit') {
            onCancel?.();
        } else {
            // Reset to defaults for add mode
            setLayerType('Conv2D');
            setParams(defaultParams['Conv2D']);
        }
    };

    const isLayerRecommended = (layerType: LayerType): boolean => {
        return recommendedLayers.includes(layerType);
    };

    const renderParams = () => {
        switch (layerType) {
            case 'Conv2D':
                if (params.type === 'Conv2D') {
                    return (
                        <>
                            <label>
                                Filters: 
                                <input 
                                    name="filters" 
                                    type="number" 
                                    value={params.filters} 
                                    onChange={handleParamChange}
                                />
                            </label>
                            <label>
                                Kernel Size: 
                                <input 
                                    name="kernelSize" 
                                    type="number" 
                                    value={params.kernelSize} 
                                    onChange={handleParamChange}
                                />
                            </label>
                            <label>
                                Strides: 
                                <input 
                                    name="strides" 
                                    type="number" 
                                    value={params.strides} 
                                    onChange={handleParamChange}
                                />
                            </label>
                            <label>
                                Padding: 
                                <select 
                                    name="padding" 
                                    value={params.padding} 
                                    onChange={handleParamChange}
                                >
                                    <option value="same">same</option>
                                    <option value="valid">valid</option>
                                </select>
                            </label>
                        </>
                    );
                }
                break;
            case 'MaxPooling2D':
                if (params.type === 'MaxPooling2D') {
                    return (
                        <>
                            <label>
                                Pool Size: 
                                <input 
                                    name="poolSize" 
                                    type="number" 
                                    value={params.poolSize} 
                                    onChange={handleParamChange} 
                                />
                            </label>
                            <label>
                                Strides: 
                                <input 
                                    name="strides" 
                                    type="number" 
                                    value={params.strides} 
                                    onChange={handleParamChange} 
                                />
                            </label>
                            <label>
                                Padding: 
                                <select 
                                    name="padding" 
                                    value={params.padding} 
                                    onChange={handleParamChange}
                                >
                                    <option value="same">same</option>
                                    <option value="valid">valid</option>
                                </select>
                            </label>
                        </>
                    );
                }
                break;
            case 'Dropout':
                if (params.type === 'Dropout') {
                    return (
                        <label>
                            Rate: 
                            <input 
                                name="rate" 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                max="1" 
                                value={params.rate} 
                                onChange={handleParamChange} 
                            />
                        </label>
                    );
                }
                break;
            case 'Dense':
                if (params.type === 'Dense') {
                    return (
                        <label>
                            Units: 
                            <input 
                                name="units" 
                                type="number" 
                                value={params.units} 
                                onChange={handleParamChange} 
                            />
                        </label>
                    );
                }
                break;
            default:
                return null;
        }
        return null;
    };

    return (
        <div>
            <h3>{mode === 'edit' ? 'Edit Layer' : 'Add Layer'}</h3>
            
            {/* Validation Messages */}
            {validation.errors.length > 0 && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                    <strong>Errors:</strong>
                    <ul>
                        {validation.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            {validation.warnings.length > 0 && (
                <div style={{ color: 'orange', marginBottom: '1rem' }}>
                    <strong>Warnings:</strong>
                    <ul>
                        {validation.warnings.map((warning, idx) => (
                            <li key={idx}>{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommendations - only show in add mode */}
            {mode === 'add' && recommendedLayers.length > 0 && (
                <div style={{ color: 'lightblue', marginBottom: '1rem' }}>
                    <strong>Recommended next layers:</strong> {recommendedLayers.join(', ')}
                </div>
            )}

            <select 
                value={layerType} 
                onChange={handleTypeChange}
                disabled={mode === 'edit'} // Disable type change in edit mode
            >
                {Object.keys(defaultParams).map((type) => (
                    <option 
                        key={type} 
                        value={type}
                        style={{
                            fontWeight: isLayerRecommended(type as LayerType) ? 'bold' : 'normal'
                        }}
                    >
                        {type} {isLayerRecommended(type as LayerType) ? '⭐' : ''}
                    </option>
                ))}
            </select>
            {renderParams()}
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                    onClick={handleUpdate} 
                    disabled={validation.errors.length > 0}
                >
                    {mode === 'edit' ? 'Update Layer' : 'Add Layer'}
                </button>
                
                {mode === 'edit' && (
                    <button 
                        onClick={handleCancel}
                        style={{ 
                            background: '#666',
                            color: '#fff'
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
};

export default LayerControls;