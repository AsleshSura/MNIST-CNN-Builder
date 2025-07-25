import React from 'react';
import { ModelConfig } from '../types/layers';
import { read } from 'fs';

interface ImportExportControlsProps {
    modelConfig: ModelConfig;
    onImport: (config: ModelConfig) => void;
}

const ImportExportControls: React.FC<ImportExportControlsProps> = ({ modelConfig, onImport }) => {
    const handleExport = () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(modelConfig, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute('href', dataStr);
        downloadAnchorNode.setAttribute('download', `cnn-model-${Date.now()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const config = JSON.parse(event.target?.result as string);
                onImport(config);
            } catch {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div>
            <button onClick={handleExport}>Export Model</button>
            <input type='file' accept='application/json' onChange={handleImport} />
        </div>
    );
};

export default ImportExportControls;