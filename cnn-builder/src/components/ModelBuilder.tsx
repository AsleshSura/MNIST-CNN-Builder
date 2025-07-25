import React, { useState} from 'react';
import { CNNLayer, TrainingSettings, ModelConfig } from '../types/layers';
import LayerList from './LayerList';
import LayerControls from './LayerControls';
import LayerVisualization from './LayerVisualization';
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
    const [editingLayerIndex, setEditingLayerIndex] = useState<number | null>(null);

    const handleAddLayer = (layer:CNNLayer) => {
        setLayers([ ...layers, layer]);
    };

    const handleEditLayer = (index: number) => {
        setEditingLayerIndex(index);
    };

    const handleUpdateLayer = (updatedLayer: CNNLayer) => {
        if (editingLayerIndex !== null) {
            const updatedLayers = [...layers];
            updatedLayers[editingLayerIndex] = updatedLayer;
            setLayers(updatedLayers);
            setEditingLayerIndex(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingLayerIndex(null);
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
                <LayerList 
                    layers={layers} 
                    onEdit={handleEditLayer} 
                    onRemove={handleRemoveLayer} 
                    editingIndex={editingLayerIndex}
                />
            </section>
            <section>
                <LayerVisualization layers={layers} />
            </section>
            <section>
                {editingLayerIndex !== null ? (
                    <LayerControls 
                        onUpdate={handleUpdateLayer} 
                        onCancel={handleCancelEdit}
                        currentLayers={layers} 
                        editingLayer={layers[editingLayerIndex]}
                        mode="edit"
                    />
                ) : (
                    <LayerControls 
                        onAdd={handleAddLayer} 
                        currentLayers={layers} 
                        mode="add"
                    />
                )}
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