import React, { useState} from 'react';
import { CNNLayer, TrainingSettings, ModelConfig } from '../types/layers';
import LayerList from './LayerList';
import LayerControls from './LayerControl';
import TrainingSettingsForm from './TrainingSettingsForm';
import TrainAndVisualize from './TrainAndVisualize';
import InportExportControls from './ImportExportControls';

const defaultTrainingSettings: TrainingSettings = {
    epochs: 5,
    batchSize: 32,
    learningRate: 0.001,
    optimizer: 'adam',
};

const ModelBuilder: React.FC = () => {
    const [layers, setLayers] = useState<CNNLayer[]>([]);
    const [trainingSettings, setTrainingSettings] = useState<TrainingSettings>(defaultTrainingSettings);

    const handleAddLayer = (layer:CNNLayer) => {
        setLayers([ ...layers, layer]);
    };

    const handleEditLayer = (index: number) => {
        alert('Edit layer not implemented yet. Remove and re-add to change parameters.');
    };

    const handleRemoveLayer = (index: number) => {
        setLayers(layers.filter((_, i) => i !== index));
    };

    const handleImport = (config: ModelConfig) => {
        setLayers(config.layers);
        setTrainingSettings(config.trainingSettings);
    };

    return (
        <div style={{ maxWidth:700, margin:'2rem auto', background: '#222', color:'#fff', padding='2rem', borderRadius: 12}}>
            <h2 style={{ textAlign:'center'}}>CNN Model Builder</h2>
            <LayerList layers={layers} onEdit={handleEditLayer} onRemove={handleRemoveLayer} />
            <LayerControls onAdd={handleAddLayer} />
            <TrainingSettingsForm settings={trainingSettings} onChange={setTrainingSettings} />
            <TrainAndVisualize layers={layers} trainingSettings={trainingSettings} />
            <InportExportControls modelConfig={{ layers, trainingSettings, metadata: {label:'', timestamp: new Date().toISOString()}}} onImport={handleImport} />
        </div>
    );
};

export default ModelBuilder;