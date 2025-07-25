import React, { useState } from 'react';
import { LayerType, CNNLayer } from '../types/layers';

interface LayerControlsProps {
    onAdd: (layer: CNNLayer) => void;
}

const defaultParams: Record<LayerType, Partial<CNNLayer>> = {
    Conv2D: { type: 'Conv2D', filters: 8, kernelSize: 3, strides: 1, padding: 'same'},
    ReLU: { type: 'ReLU'},
    MaxPooling2D: { type: 'MaxPooling2D', poolSize: 2, strides: 2, padding: 'same'},
    BatchNormalization: { type: 'BatchNormalization'},
    Dropout: { type: 'Dropout', rate: .25},
    Flatten: { type: 'Flatten'},
    Dense: { type: 'Dense', units: 64},
    Softmax: {type: 'Softmax'},
};

const LayerControls: React.FC<LayerControlsProps> = ({ onAdd }) => {
    const [layerType, setLayerType] = useState<LayerType>('Conv2D');
    const [params, setParams] = useState<Partial<CNNLayer>>(defaultParams['Conv2D']);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as LayerType;
        setLayerType(type);
        setParams(defaultParams[type]);
    };

    const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setParams((prev: Partial<CNNLayer>) => ({ ...prev, [name]: isNaN(Number(value)) ? value : Number(value) }));
    };

    const handleAdd = () => {
        if (params.type) {
            onAdd(params as CNNLayer);
        }
    };

    const renderParams = () => {
        switch (layerType) {
            case 'Conv2D':
                return (
                    <>
                        <label>Filters: <input name="filters" type="number" value={(params as any).filters} onChange={handleParamChange}/></label>
                        <label>Kernel Size: <input name="kernelSize" type="number" value={(params as any).kernelSize} onChange={handleParamChange}/></label>
                        <label>Strides: <input name="strides" type="number" value={(params as any).strides} onChange={handleParamChange}/></label>
                        <label>Padding: <select name="padding" value={(params as any).padding} onChange={handleParamChange}>
                            <option value="same">same</option>
                            <option value="valid">valid</option>
                        </select></label>
                    </>
                );
            case 'MaxPooling2D':
                return (
                    <>
                        <label>Pool Size: <input name="poolSize" type="number" value={(params as any).poolSize} onChange={handleParamChange} /></label>
                        <label>Strides: <input name='strides' type="number" value={(params as any).strides} onChange={handleParamChange} /></label>
                        <label>Padding: <select name="padding" value={(params as any).padding} onChange={handleParamChange}>
                            <option value="same">same</option>
                            <option value="valid">valid</option>
                        </select></label>
                    </>
                );
            case 'Dropout':
                return (
                    <label>Rate: <input name="rate" type="number" step="0.01" min="0" max="1" value={(params as any).rate} onChange={handleParamChange} /></label>
                );
            case 'Dense':
                return (
                    <label>Units: <input name="units" type="number" value={(params as any).units} onChange={handleParamChange} /></label>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <h3>Add Layer</h3>
            <select value={layerType} onChange={handleTypeChange}>
                {Object.keys(defaultParams).map((type) => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
            {renderParams()}
            <button onClick={handleAdd}>Add Layer</button>
        </div>
    );
};

export default LayerControls;