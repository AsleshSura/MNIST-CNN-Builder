import React, { useState } from 'react';
import { ModelConfig, ModelWeights, TrainingHistory } from '../types/layers';
import * as tf from '@tensorflow/tfjs';

interface ImportExportControlsProps {
    modelConfig: ModelConfig;
    onImport: (config: ModelConfig) => void;
    trainedModel?: tf.LayersModel | null;
    trainingMetrics?: Array<{
        epoch: number;
        loss: number;
        accuracy: number;
        valLoss?: number;
        valAccuracy?: number;
    }>;
    trainingTime?: number;
}

const ImportExportControls: React.FC<ImportExportControlsProps> = ({ 
    modelConfig, 
    onImport, 
    trainedModel, 
    trainingMetrics = [], 
    trainingTime = 0 
}) => {
    const [isExporting, setIsExporting] = useState(false);
    const [lastExportTime, setLastExportTime] = useState<string | null>(null);
    const [exportType, setExportType] = useState<'architecture' | 'weights' | 'complete'>('architecture');
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

    // Helper function to extract model weights
    const extractModelWeights = async (model: tf.LayersModel): Promise<ModelWeights> => {
        const layerWeights: ModelWeights['layerWeights'] = [];
        
        for (let i = 0; i < model.layers.length; i++) {
            const layer = model.layers[i];
            const weights = layer.getWeights();
            
            if (weights.length > 0) {
                const layerWeightData = await Promise.all(
                    weights.map(async (weight, idx) => ({
                        name: `${layer.name}_weight_${idx}`,
                        shape: weight.shape,
                        values: Array.from(await weight.data())
                    }))
                );

                layerWeights.push({
                    layerIndex: i,
                    layerName: layer.name,
                    layerType: layer.getClassName(),
                    weights: layerWeightData
                });
            }
        }

        return {
            layerWeights,
            modelTopology: model.toJSON()
        };
    };

    // Helper function to create training history
    const createTrainingHistory = (): TrainingHistory | undefined => {
        if (trainingMetrics.length === 0) return undefined;

        return {
            epochs: trainingMetrics.map(m => m.epoch),
            losses: trainingMetrics.map(m => m.loss),
            accuracies: trainingMetrics.map(m => m.accuracy),
            valLosses: trainingMetrics.map(m => m.valLoss).filter(v => v !== undefined) as number[],
            valAccuracies: trainingMetrics.map(m => m.valAccuracy).filter(v => v !== undefined) as number[],
            trainingTime,
            finalMetrics: trainingMetrics.length > 0 ? {
                accuracy: trainingMetrics[trainingMetrics.length - 1].accuracy,
                loss: trainingMetrics[trainingMetrics.length - 1].loss,
                valAccuracy: trainingMetrics[trainingMetrics.length - 1].valAccuracy,
                valLoss: trainingMetrics[trainingMetrics.length - 1].valLoss
            } : undefined
        };
    };

    // Helper function to calculate model performance metrics
    const calculateModelPerformance = (model?: tf.LayersModel) => {
        if (!model) return undefined;

        let trainableParams = 0;
        let nonTrainableParams = 0;

        model.layers.forEach(layer => {
            const weights = layer.getWeights();
            weights.forEach(weight => {
                const paramCount = weight.shape.reduce((a, b) => a * b, 1);
                if (layer.trainable) {
                    trainableParams += paramCount;
                } else {
                    nonTrainableParams += paramCount;
                }
            });
        });

        return {
            parametersCount: trainableParams + nonTrainableParams,
            trainableParameters: trainableParams,
            nonTrainableParameters: nonTrainableParams,
            memoryUsage: undefined // Could be calculated if needed
        };
    };

    const handleExport = async () => {
        setIsExporting(true);
        
        try {
            let enhancedConfig: ModelConfig = {
                ...modelConfig,
                metadata: {
                    ...modelConfig.metadata,
                    label: modelConfig.metadata.label || `CNN-Model-${new Date().toLocaleDateString()}`,
                    timestamp: new Date().toISOString(),
                    version: '2.0',
                    exportType: exportType === 'architecture' ? 'architecture-only' : 
                               exportType === 'weights' ? 'with-weights' : 'complete',
                    description: `Exported CNN model with ${modelConfig.layers.length} layers`,
                    author: 'MNIST-CNN-Builder',
                    tags: ['CNN', 'MNIST', 'Deep Learning', 'TensorFlow.js']
                }
            };

            // Add weights if trained model exists and user requested it
            if ((exportType === 'weights' || exportType === 'complete') && trainedModel) {
                enhancedConfig.weights = await extractModelWeights(trainedModel);
            }

            // Add training history for complete export
            if (exportType === 'complete') {
                enhancedConfig.trainingHistory = createTrainingHistory();
                enhancedConfig.modelPerformance = calculateModelPerformance(trainedModel || undefined);
            }

            const dataStr = 'data:text/json;charset=utf-8,' + 
                           encodeURIComponent(JSON.stringify(enhancedConfig, null, 2));
            
            const downloadAnchorNode = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            const filename = `cnn-model-${exportType}-${timestamp}.json`;
            
            downloadAnchorNode.setAttribute('href', dataStr);
            downloadAnchorNode.setAttribute('download', filename);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            setLastExportTime(new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export model. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            alert('Please select a JSON file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target?.result as string);
                
                // Validate required fields
                if (!config.layers || !Array.isArray(config.layers)) {
                    alert('Invalid file: Missing or invalid layers array.');
                    return;
                }
                
                if (!config.trainingSettings) {
                    alert('Invalid file: Missing training settings.');
                    return;
                }

                // Validate layer structure
                const validLayerTypes = ['Conv2D', 'ReLU', 'MaxPooling2D', 'BatchNormalization', 'Dropout', 'Flatten', 'Dense', 'Softmax'];
                const invalidLayers = config.layers.filter((layer: any) => !validLayerTypes.includes(layer.type));
                
                if (invalidLayers.length > 0) {
                    alert(`Invalid layer types found: ${invalidLayers.map((l: any) => l.type).join(', ')}`);
                    return;
                }

                // Ensure metadata exists
                if (!config.metadata) {
                    config.metadata = {
                        label: 'Imported Model',
                        timestamp: new Date().toISOString(),
                        exportType: 'architecture-only'
                    };
                }

                // Create detailed import summary
                let importSummary = `Successfully imported model:\n`;
                importSummary += `• Architecture: ${config.layers.length} layers\n`;
                importSummary += `• Training Settings: ${config.trainingSettings.epochs} epochs, batch size ${config.trainingSettings.batchSize}\n`;
                
                if (config.weights) {
                    const weightLayers = config.weights.layerWeights.length;
                    const totalWeights = config.weights.layerWeights.reduce((sum: number, layer: any) => 
                        sum + layer.weights.reduce((layerSum: number, weight: any) => 
                            layerSum + weight.values.length, 0), 0);
                    importSummary += `• Weights: ${weightLayers} layers with ${totalWeights.toLocaleString()} parameters\n`;
                }
                
                if (config.trainingHistory) {
                    importSummary += `• Training History: ${config.trainingHistory.epochs.length} epochs recorded\n`;
                    if (config.trainingHistory.finalMetrics) {
                        importSummary += `• Final Accuracy: ${(config.trainingHistory.finalMetrics.accuracy * 100).toFixed(2)}%\n`;
                    }
                }
                
                if (config.modelPerformance) {
                    importSummary += `• Model Size: ${config.modelPerformance.parametersCount.toLocaleString()} parameters\n`;
                }

                onImport(config);
                alert(importSummary);
                
            } catch (error) {
                console.error('Import failed:', error);
                alert('Invalid JSON file. Please check the file format.');
            }
        };
        
        reader.onerror = () => {
            alert('Failed to read file. Please try again.');
        };

        reader.readAsText(file);
        
        // Reset the input value so the same file can be imported again
        e.target.value = '';
    };

    const canExport = modelConfig.layers.length > 0;
    const hasTrainedModel = trainedModel !== null && trainedModel !== undefined;

    return (
        <div>
            <h3>🔄 Advanced Model Import/Export</h3>
            
            {/* Export Type Selection */}
            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#4e9cff' }}>Export Options</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white' }}>
                        <input 
                            type="radio" 
                            value="architecture" 
                            checked={exportType === 'architecture'} 
                            onChange={(e) => setExportType(e.target.value as any)}
                            style={{ marginRight: '0.5rem' }}
                        />
                        🏗️ Architecture Only
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: hasTrainedModel ? 'pointer' : 'not-allowed', opacity: hasTrainedModel ? 1 : 0.5, color: 'white' }}>
                        <input 
                            type="radio" 
                            value="weights" 
                            checked={exportType === 'weights'} 
                            onChange={(e) => setExportType(e.target.value as any)}
                            disabled={!hasTrainedModel}
                            style={{ marginRight: '0.5rem' }}
                        />
                        ⚖️ With Weights
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: hasTrainedModel ? 'pointer' : 'not-allowed', opacity: hasTrainedModel ? 1 : 0.5, color: 'white' }}>
                        <input 
                            type="radio" 
                            value="complete" 
                            checked={exportType === 'complete'} 
                            onChange={(e) => setExportType(e.target.value as any)}
                            disabled={!hasTrainedModel}
                            style={{ marginRight: '0.5rem' }}
                        />
                        📊 Complete (Weights + History)
                    </label>
                </div>
                {!hasTrainedModel && (
                    <div style={{ fontSize: '0.8rem', color: '#ffa500', marginTop: '0.5rem' }}>
                        💡 Train your model to enable weight and complete exports
                    </div>
                )}
            </div>

            {/* Export/Import Buttons */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <button 
                    onClick={handleExport}
                    disabled={!canExport || isExporting}
                    style={{
                        backgroundColor: canExport && !isExporting ? '#28a745' : '#666',
                        cursor: canExport && !isExporting ? 'pointer' : 'not-allowed',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        borderRadius: '6px',
                        border: 'none',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                    title={canExport ? `Export model as ${exportType}` : 'Add layers to enable export'}
                >
                    {isExporting ? '⏳ Exporting...' : '📁 Export Model'}
                </button>
                
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <input 
                        type='file' 
                        accept='application/json,.json' 
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />
                    <button 
                        type="button"
                        style={{
                            backgroundColor: '#17a2b8',
                            cursor: 'pointer',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1rem',
                            borderRadius: '6px',
                            border: 'none',
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                        onClick={() => {
                            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                            input?.click();
                        }}
                    >
                        📂 Import Model
                    </button>
                </label>

                <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    style={{
                        backgroundColor: '#6c757d',
                        cursor: 'pointer',
                        padding: '0.75rem 1rem',
                        fontSize: '0.9rem',
                        borderRadius: '6px',
                        border: 'none',
                        color: 'white'
                    }}
                >
                    {showAdvancedOptions ? '🔽' : '▶️'} Advanced
                </button>
            </div>

            {lastExportTime && (
                <div style={{ color: 'lightgreen', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    ✓ Last exported at {lastExportTime} ({exportType} format)
                </div>
            )}
            
            {/* Export Preview */}
            {canExport && (
                <div style={{ 
                    marginBottom: '1rem', 
                    padding: '0.75rem', 
                    backgroundColor: '#1a1a1a', 
                    borderRadius: '8px',
                    border: '1px solid #333'
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#4e9cff' }}>Export Preview</h4>
                    <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                        <div><strong>📐 Architecture:</strong> {modelConfig.layers.length} layers</div>
                        <div><strong>⚙️ Training Settings:</strong> {modelConfig.trainingSettings.epochs} epochs, batch size {modelConfig.trainingSettings.batchSize}</div>
                        <div><strong>🔧 Optimizer:</strong> {modelConfig.trainingSettings.optimizer}</div>
                        {hasTrainedModel && (
                            <>
                                <div><strong>⚖️ Model State:</strong> Trained model available</div>
                                {trainingMetrics.length > 0 && (
                                    <div><strong>📈 Training Data:</strong> {trainingMetrics.length} epochs recorded</div>
                                )}
                            </>
                        )}
                        <div><strong>💾 Export Type:</strong> {exportType}</div>
                    </div>
                </div>
            )}

            {/* Advanced Options */}
            {showAdvancedOptions && (
                <div style={{ 
                    marginBottom: '1rem', 
                    padding: '0.75rem', 
                    backgroundColor: '#1a1a1a', 
                    borderRadius: '8px',
                    border: '1px solid #333'
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#4e9cff' }}>🔧 Advanced Export Options</h4>
                    <div style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.6' }}>
                        <div><strong>Architecture Only:</strong> Exports layer configuration and training settings only</div>
                        <div><strong>With Weights:</strong> Includes trained model weights for each layer</div>
                        <div><strong>Complete:</strong> Full export with weights, training history, and performance metrics</div>
                        <div style={{ marginTop: '0.5rem', color: '#ffa500' }}>
                            💡 Weights exports can be large files (several MB) depending on model size
                        </div>
                    </div>
                </div>
            )}

            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                <strong>💡 Enhanced Export/Import Features:</strong>
                <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1rem' }}>
                    <li>🏗️ <strong>Architecture exports</strong> preserve complete layer configurations</li>
                    <li>⚖️ <strong>Weight exports</strong> include all trained parameters for model restoration</li>
                    <li>📊 <strong>Complete exports</strong> preserve training history and performance metrics</li>
                    <li>🔍 <strong>Smart validation</strong> ensures imported models are valid and compatible</li>
                    <li>📈 <strong>Training insights</strong> help analyze model performance over time</li>
                    <li>🚀 <strong>Easy sharing</strong> enables collaboration and model distribution</li>
                </ul>
            </div>
        </div>
    );
};

export default ImportExportControls;