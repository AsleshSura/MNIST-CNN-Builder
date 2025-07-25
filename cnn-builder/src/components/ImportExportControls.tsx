import React, { useState } from 'react';
import { ModelConfig } from '../types/layers';

interface ImportExportControlsProps {
    modelConfig: ModelConfig;
    onImport: (config: ModelConfig) => void;
}

const ImportExportControls: React.FC<ImportExportControlsProps> = ({ modelConfig, onImport }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [lastExportTime, setLastExportTime] = useState<string | null>(null);

    const handleExport = () => {
        setIsExporting(true);
        
        try {
            // Create enhanced model config with metadata
            const enhancedConfig = {
                ...modelConfig,
                metadata: {
                    ...modelConfig.metadata,
                    label: modelConfig.metadata.label || `CNN-Model-${new Date().toLocaleDateString()}`,
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    totalLayers: modelConfig.layers.length,
                    exportedBy: 'MNIST-CNN-Builder'
                }
            };

            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(enhancedConfig, null, 2));
            const downloadAnchorNode = document.createElement('a');
            const filename = `cnn-model-${Date.now()}.json`;
            
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
                        timestamp: new Date().toISOString()
                    };
                }

                onImport(config);
                alert(`Successfully imported model with ${config.layers.length} layers!`);
                
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

    return (
        <div>
            <h3>Import / Export Model</h3>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <button 
                    onClick={handleExport}
                    disabled={!canExport || isExporting}
                    style={{
                        backgroundColor: canExport && !isExporting ? '#28a745' : '#666',
                        cursor: canExport && !isExporting ? 'pointer' : 'not-allowed',
                        padding: '0.5rem 1rem',
                        fontSize: '1rem'
                    }}
                    title={canExport ? 'Export current model configuration' : 'Add layers to enable export'}
                >
                    {isExporting ? 'Exporting...' : '📁 Export Model'}
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
                            padding: '0.5rem 1rem',
                            fontSize: '1rem'
                        }}
                        onClick={() => {
                            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                            input?.click();
                        }}
                    >
                        📂 Import Model
                    </button>
                </label>
            </div>

            {lastExportTime && (
                <div style={{ color: 'lightgreen', fontSize: '0.9rem' }}>
                    ✓ Last exported at {lastExportTime}
                </div>
            )}
            
            {/* Export Preview */}
            {canExport && (
                <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem', 
                    backgroundColor: '#1a1a1a', 
                    borderRadius: '8px',
                    border: '1px solid #333'
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#4e9cff' }}>Export Preview</h4>
                    <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                        <div><strong>Layers:</strong> {modelConfig.layers.length}</div>
                        <div><strong>Training Settings:</strong> {modelConfig.trainingSettings.epochs} epochs, batch size {modelConfig.trainingSettings.batchSize}</div>
                        <div><strong>Optimizer:</strong> {modelConfig.trainingSettings.optimizer}</div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#888' }}>
                <strong>💡 Export/Import Info:</strong>
                <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1rem' }}>
                    <li>Exported files contain model architecture and training settings</li>
                    <li>JSON format ensures compatibility across different systems</li>
                    <li>Models can be shared with other researchers</li>
                    <li>Import validates layer types and structure</li>
                </ul>
            </div>
        </div>
    );
};

export default ImportExportControls;