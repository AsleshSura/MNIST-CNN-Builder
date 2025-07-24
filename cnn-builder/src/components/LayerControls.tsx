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
    const [params, setParams] = useState<Partial<CNNLayers>>(defaultParams['Conv2D']);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value as LayerType;
        setLayerType(type);
        setParams(defaultParams[type]);
    };

    const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setParams((prev) => ({ ...prev, })) //BREH. MY MOMS FORCING ME TO SLEEP. SMH. WILL FINISH TMRW.
    }
}