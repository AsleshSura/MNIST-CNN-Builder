import React, { useState, useRef, useCallback } from 'react';
import { CNNLayer, TrainingSettings, ModelConfig } from '../types/layers';
import LayerList from './LayerList';
import LayerControls from './LayerControls';
import LayerVisualization from './LayerVisualization';
import TrainingSettingsForm from './TrainingSettingsForm';
import TrainAndVisualize from './TrainAndVisualize';
import ImportExportControls from './ImportExportControls';
import * as tf from '@tensorflow/tfjs';

interface TrainingMetrics {
    epoch: number;
    loss: number;
    accuracy: number;
    valLoss?: number;
    valAccuracy?: number;
}

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
    
    // Training state management
    const [trainedModel, setTrainedModel] = useState<tf.LayersModel | null>(null);
    const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics[]>([]);
    const [trainingTime, setTrainingTime] = useState<number>(0);
    const trainingStartTime = useRef<number>(0);

    const handleAddLayer = (layer:CNNLayer) => {
        setLayers([ ...layers, layer]);
        // Clear trained model when architecture changes
        if (trainedModel) {
            trainedModel.dispose();
            setTrainedModel(null);
            setTrainingMetrics([]);
            setTrainingTime(0);
        }
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
            
            // Clear trained model when architecture changes
            if (trainedModel) {
                trainedModel.dispose();
                setTrainedModel(null);
                setTrainingMetrics([]);
                setTrainingTime(0);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingLayerIndex(null);
    };

    const handleRemoveLayer = (index: number) => {
        setLayers(layers.filter((_, i) => i !== index));
        // Clear trained model when architecture changes
        if (trainedModel) {
            trainedModel.dispose();
            setTrainedModel(null);
            setTrainingMetrics([]);
            setTrainingTime(0);
        }
    };

    const handleImport = (config: ModelConfig) => {
        // Clear existing trained model
        if (trainedModel) {
            trainedModel.dispose();
        }
        
        setLayers(config.layers);
        setTrainingSettings(config.trainingSettings);
        setTrainedModel(null);
        setTrainingMetrics([]);
        setTrainingTime(0);
        
        // If imported config has training history, restore it
        if (config.trainingHistory) {
            const metrics = config.trainingHistory.epochs.map((epoch, index) => ({
                epoch,
                loss: config.trainingHistory!.losses[index],
                accuracy: config.trainingHistory!.accuracies[index],
                valLoss: config.trainingHistory!.valLosses?.[index],
                valAccuracy: config.trainingHistory!.valAccuracies?.[index]
            }));
            setTrainingMetrics(metrics);
            setTrainingTime(config.trainingHistory.trainingTime);
        }
    };

    // Callback to receive training updates from TrainAndVisualize
    const handleTrainingUpdate = useCallback((
        model: tf.LayersModel | null,
        metrics: TrainingMetrics[],
        isTrainingStarted: boolean,
        isTrainingComplete: boolean
    ) => {
        if (isTrainingStarted && trainingStartTime.current === 0) {
            trainingStartTime.current = Date.now();
        }
        
        if (isTrainingComplete && trainingStartTime.current > 0) {
            setTrainingTime(Date.now() - trainingStartTime.current);
            trainingStartTime.current = 0;
        }
        
        setTrainedModel(model);
        setTrainingMetrics(metrics);
    }, []);

    const modelConfig: ModelConfig = {
        layers,
        trainingSettings,
        metadata: { 
            label: '', 
            timestamp: new Date().toISOString(),
            exportType: 'architecture-only'
        }
    };

    return (
        <div className="model-builder">
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
                <TrainAndVisualize 
                    layers={layers} 
                    trainingSettings={trainingSettings}
                    onTrainingUpdate={handleTrainingUpdate}
                />
            </section>
            <section>
                <ImportExportControls 
                    modelConfig={modelConfig}
                    onImport={handleImport}
                    trainedModel={trainedModel}
                    trainingMetrics={trainingMetrics}
                    trainingTime={trainingTime}
                />
            </section>
        </div>
    );
};

export default ModelBuilder;