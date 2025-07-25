import React from 'react';
import { CNNLayer } from '../types/layers';
import { validateLayerSequence } from '../utils/modelValidation';

interface LayerListProps {
    layers: CNNLayer[];
    onEdit: (index: number) => void;
    onRemove: (index: number) => void;
    editingIndex?: number | null;
}

const LayerList: React.FC<LayerListProps> = ({ layers, onEdit, onRemove, editingIndex}) => {
    const validation = validateLayerSequence(layers);

    const formatLayerDetails = (layer: CNNLayer): string => {
        switch (layer.type) {
            case 'Conv2D':
                return `(${layer.filters} filters, ${layer.kernelSize}x${layer.kernelSize}, stride=${layer.strides}, padding=${layer.padding})`;
            case 'MaxPooling2D':
                return `(pool=${layer.poolSize}x${layer.poolSize}, stride=${layer.strides}, padding=${layer.padding})`;
            case 'Dropout':
                return `(rate=${layer.rate})`;
            case 'Dense':
                return `(${layer.units} units)`;
            default:
                return '';
        }
    };

    return (
        <div>
            <h3>Model Layers ({layers.length})</h3>
            
            {/* Validation Status */}
            <div style={{ marginBottom: '1rem' }}>
                {validation.isValid ? (
                    <span style={{ color: 'lightgreen' }}>✓ Valid Model Architecture</span>
                ) : (
                    <span style={{ color: 'red' }}>✗ Invalid Model Architecture</span>
                )}
            </div>

            {layers.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>No layers added yet. Start by adding a Conv2D layer.</p>
            ) : (
                <div>
                    {layers.map((layer, idx) => (
                        <div 
                            key={idx} 
                            className={`layer-item ${editingIndex === idx ? 'editing' : ''}`}
                        >
                            <div className="layer-info">
                                <div className="layer-type">
                                    {idx + 1}. {layer.type}
                                    {editingIndex === idx && (
                                        <span style={{ color: '#ffd93d', marginLeft: '0.5rem' }}>
                                            (Editing)
                                        </span>
                                    )}
                                </div>
                                <div className="layer-params">
                                    {formatLayerDetails(layer)}
                                </div>
                            </div>
                            <div className="layer-actions">
                                <button 
                                    onClick={() => onEdit(idx)}
                                    disabled={editingIndex !== null && editingIndex !== idx}
                                >
                                    {editingIndex === idx ? 'Editing...' : 'Edit'}
                                </button>
                                <button 
                                    onClick={() => onRemove(idx)}
                                    disabled={editingIndex !== null}
                                    style={{ 
                                        background: editingIndex !== null ? '#666' : '#d73027',
                                        borderColor: editingIndex !== null ? '#999' : '#a02621'
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Model Summary */}
            {layers.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#4e9cff' }}>Model Summary</h4>
                    <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                        <div>Total layers: {layers.length}</div>
                        <div>Conv2D layers: {layers.filter(l => l.type === 'Conv2D').length}</div>
                        <div>Dense layers: {layers.filter(l => l.type === 'Dense').length}</div>
                        <div>Has normalization: {layers.some(l => l.type === 'BatchNormalization') ? 'Yes' : 'No'}</div>
                        <div>Has regularization: {layers.some(l => l.type === 'Dropout') ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LayerList;