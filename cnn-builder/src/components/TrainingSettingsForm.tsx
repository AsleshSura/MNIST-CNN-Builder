import React from "react";
import { TrainingSettings } from "../types/layers";

interface TrainingSettingsFormProps {
    settings: TrainingSettings;
    onChange: (settings: TrainingSettings) => void;
}

const TrainingSettingsForm: React.FC<TrainingSettingsFormProps> = ({ settings, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newSettings = {
            ...settings,
            [name]: name === "optimizer" ? value : Number(value),
        };
        
        // Validate and clamp values
        if (name === 'epochs') {
            newSettings.epochs = Math.max(1, Math.min(100, newSettings.epochs));
        } else if (name === 'batchSize') {
            newSettings.batchSize = Math.max(1, Math.min(512, newSettings.batchSize));
        } else if (name === 'learningRate') {
            newSettings.learningRate = Math.max(0.0001, Math.min(1, newSettings.learningRate));
        }
        
        onChange(newSettings);
    };

    const getEstimatedTrainingTime = (): string => {
        // Rough estimation based on typical training speeds
        const baseTimePerEpoch = 10; // seconds
        const batchFactor = Math.log10(settings.batchSize) / 2;
        const totalTime = settings.epochs * baseTimePerEpoch * batchFactor;
        
        if (totalTime < 60) {
            return `~${Math.round(totalTime)}s`;
        } else if (totalTime < 3600) {
            return `~${Math.round(totalTime / 60)}min`;
        } else {
            return `~${Math.round(totalTime / 3600)}h`;
        }
    };

    return (
        <div>
            <h3>Training Settings</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <label>
                    Epochs:
                    <input
                        name="epochs"
                        type="number"
                        min="1"
                        max="100"
                        value={settings.epochs}
                        onChange={handleChange}
                        placeholder="Number of epochs"
                        title="Number of complete passes through the training data (1-100)"
                    />
                    <small style={{ display: 'block', color: '#888', fontSize: '0.8rem' }}>
                        Complete training cycles (1-100)
                    </small>
                </label>
                
                <label>
                    Batch Size:
                    <input
                        name="batchSize"
                        type="number"
                        min="1"
                        max="512"
                        value={settings.batchSize}
                        onChange={handleChange}
                        placeholder="Batch size"
                        title="Number of samples processed before model weights are updated (1-512)"
                    />
                    <small style={{ display: 'block', color: '#888', fontSize: '0.8rem' }}>
                        Samples per weight update (1-512)
                    </small>
                </label>
                
                <label>
                    Learning Rate:
                    <input
                        name="learningRate"
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        max="1"
                        value={settings.learningRate}
                        onChange={handleChange}
                        placeholder="Learning rate"
                        title="How much to adjust weights during training (0.0001-1)"
                    />
                    <small style={{ display: 'block', color: '#888', fontSize: '0.8rem' }}>
                        Weight adjustment rate (0.0001-1)
                    </small>
                </label>
                
                <label>
                    Optimizer:
                    <select 
                        name="optimizer" 
                        value={settings.optimizer} 
                        onChange={handleChange}
                        title="Algorithm used to update model weights"
                    >
                        <option value="adam">Adam (Recommended)</option>
                        <option value="sgd">SGD (Simple)</option>
                    </select>
                    <small style={{ display: 'block', color: '#888', fontSize: '0.8rem' }}>
                        Weight update algorithm
                    </small>
                </label>
            </div>
            
            {/* Training Summary */}
            <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                backgroundColor: '#1a1a1a', 
                borderRadius: '8px',
                border: '1px solid #333'
            }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#4e9cff' }}>Training Summary</h4>
                <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                    <div><strong>Estimated time:</strong> {getEstimatedTrainingTime()}</div>
                    <div><strong>Total training steps:</strong> {Math.ceil(1000 / settings.batchSize) * settings.epochs}</div>
                    <div><strong>Configuration:</strong> {settings.epochs} epochs × {settings.batchSize} batch size</div>
                </div>
            </div>
            
            {/* Recommendations */}
            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#888' }}>
                <strong>💡 Tips:</strong>
                <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1rem' }}>
                    <li>Start with 5-10 epochs for quick experimentation</li>
                    <li>Batch size 32-64 works well for MNIST</li>
                    <li>Adam optimizer is generally more robust than SGD</li>
                    <li>Lower learning rates (0.001) are safer but slower</li>
                </ul>
            </div>
        </div>
    );
};

export default TrainingSettingsForm;