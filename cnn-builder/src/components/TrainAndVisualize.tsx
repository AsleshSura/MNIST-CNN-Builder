import React from "react";
import { CNNLayer } from "../types/layers";

interface TrainAndVisualizeProps {
    layers: CNNLayer[];
    trainingSettings: TrainingSettings;
}

const mockEpoch = [1, 2, 3, 4, 5];
const mockAccuracy = [0.85, 0.90, 0.92, 0.94, 0.95];
const mockLoss = [0.35, 0.25, 0.18, 0.13, 0.10];

const TrainAndVisualize: React.FC<TrainAndVisualizeProps> = ({ layers, trainingSettings }) => {
    return (
        <div>
            <h3>Train & Visualize</h3>
            <div style={{display:'flex', gap:'2rem'}}>
                <div>
                    <h4>Mock Accuracy per Epoch</h4>
                    <ul>
                        {mockEpoch.map((epoch,i) => (
                            <li key={epoch}>Epoch {epoch}: Accuracy {Math.round(mockAccuracy[i] * 100)}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4>Mock Loss per Epoch</h4>
                    <ul>
                        {mockEpoch.map((epoch, i) => (
                            <li key={epoch}>Epoch {epoch}: Loss {mockLoss[i].toFixed(2)}</li>
                        ))}
                    </ul>
                </div>
            </div>
            <div style={{marginTop:'1rem'}}>
                <h4>Sample Training Log</h4>
                <pre style={{background:'#f4f4f4', padding:'1em', borderRadius: '6px'}}>
                    {
                        `Epoch 1/5
                        - loss: 0.35 - acc: 0.85
                        Epoch 2/5
                        - loss: 0.25 - acc: 0.90
                        Epoch 3/5
                        - loss: 0.18 - acc: 0.92
                        Epoch 4/5
                        - loss: 0.13 - acc: 0.94
                        Epoch 5/5
                        - loss: 0.10 - acc: 0.95
                        Training complete!`
                    }
                </pre>
            </div>
        </div>
    );
};

export default TrainAndVisualize;