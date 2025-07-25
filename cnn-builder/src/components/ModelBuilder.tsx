import React, { useState} from 'react';
import { CNNLayer, TrainingSettings, ModelConfig } from '../types/layers';
import LayerList from './LayerList';
import LayerControls from './LayerControls';
import TrainingSettingsForm from './TrainingSettingsForm';
import TrainAndVisualize from './TrainAndVisualize';
import ImportExportControls from './ImportExportControls';

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
        <div className="app-container">
            <h2>CNN Model Builder</h2>
            <section>
                <LayerList layers={layers} onEdit={handleEditLayer} onRemove={handleRemoveLayer} />
            </section>
            <section>
                <LayerControls onAdd={handleAddLayer} />
            </section>
            <section>
                <TrainingSettingsForm settings={trainingSettings} onChange={setTrainingSettings} />
            </section>
            <section>
                <TrainAndVisualize layers={layers} trainingSettings={trainingSettings} />
            </section>
            <section>
                <ImportExportControls modelConfig={{layers, trainingSettings, metadata: { label:'', timestamp: new Date().toISOString()}}} onImport={handleImport} />
            </section>
        </div>
    );
};

export default ModelBuilder;