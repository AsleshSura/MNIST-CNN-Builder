import React from "react";
import { TrainingSettings } from "../types/layers";

interface TrainingSettingsFormProps {
    settings: TrainingSettings;
    onChange: (settings: TrainingSettings) => void;
}

const TrainingSettingsForm: React.FC<TrainingSettingsFormProps> = ({ settings, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onChange({
            ...settings,
            [name]: name === 'optimizer' ? value : Number(value),
        });
    };

    return (
        <div>
            <h3>Training Settings</h3>
            <label>Epochs: <input name="epochs" type="number" value={settings.epochs} onChange={handleChange} /></label>
            <label>Batch Size: <input name="batchSize" type="number" value={settings.batchSize} onChange={handleChange} /></label>
            <label>Learning Rate: <input name="learningRate" type="number" step="0.0001" value={settings.learningRate} onChange={handleChange} /></label>
            <label>Optimizer:
                <select name="optimizer" value={settings.optimizer} onChange={handleChange}>
                    <option value="sgd">SGD</option>
                    <option value="adam">Adam</option>
                </select>
            </label>
        </div>
    );
};

export default TrainingSettingsForm;