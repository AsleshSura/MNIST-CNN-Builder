import React from 'react';
import { CNNLayer } from '../types/layers';

interface LayerListProps {
    layers: CNNLayer[];
    onEdit: (index: number) => void;
    onRemove: (index: number) => void;
}

const LayerList: React.FC<LayerListProps> = ({ layers, onEdit, onRemove}) => {
    return (
        <div>
            <h3>Model Layers</h3>
            <ul>
                {layers.map(layer, idx) => (
                    <li key={idx}>
                        <span>{layer.type}</span>
                        <button onClick={() => onEdit(idx)}>Edit</button>
                        <button onClick={() => onRemove(idx)}>Remove</button>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default LayerList;