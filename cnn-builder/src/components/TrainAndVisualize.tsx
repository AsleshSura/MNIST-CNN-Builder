import React, { useEffect, useState, useRef } from "react";
import { CNNLayer, TrainingSettings } from "../types/layers";
import { validateLayerSequence, validateForTraining } from "../utils/modelValidation";
import { mnistDataLoader } from "../utils/mnistLoader";
import { dummyMnistDataLoader } from "../utils/dummyMnistLoader";
import * as tf from "@tensorflow/tfjs";
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface TrainingMetrics {
    epoch: number;
    loss: number;
    accuracy: number;
    valLoss?: number;
    valAccuracy?: number;
}

interface TrainAndVisualizeProps {
    layers: CNNLayer[];
    trainingSettings: TrainingSettings;
    onTrainingUpdate?: (
        model: tf.LayersModel | null,
        metrics: TrainingMetrics[],
        isTrainingStarted: boolean,
        isTrainingComplete: boolean
    ) => void;
}

const TrainAndVisualize: React.FC<TrainAndVisualizeProps> = ({ layers, trainingSettings, onTrainingUpdate }) => {
    const [isTraining, setIsTraining] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [trainingComplete, setTrainingComplete] = useState(false);
    const [metrics, setMetrics] = useState<TrainingMetrics[]>([]);
    const [currentEpoch, setCurrentEpoch] = useState(0);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [usingDummyData, setUsingDummyData] = useState(false);
    const modelRef = useRef<tf.LayersModel | null>(null);

    const validation = validateLayerSequence(layers);

    useEffect(() => {
        // Load MNIST data when component mounts
        const loadData = async () => {
            setIsDataLoading(true);
            try {
                // Try to load real MNIST data first
                await mnistDataLoader.loadData();
                setDataLoaded(true);
                setUsingDummyData(false);
                console.log('Real MNIST data loaded successfully');
            } catch (error) {
                console.warn('Failed to load real MNIST data, using dummy data:', error);
                // Fallback to dummy data
                try {
                    await dummyMnistDataLoader.loadData();
                    setDataLoaded(true);
                    setUsingDummyData(true);
                    console.log('Dummy MNIST data loaded successfully');
                } catch (dummyError) {
                    console.error('Failed to load dummy data:', dummyError);
                    setDataLoaded(false);
                }
            } finally {
                setIsDataLoading(false);
            }
        };
        
        if (!dataLoaded) {
            loadData();
        }
    }, [dataLoaded]);

    const createModel = (): tf.LayersModel | null => {
        if (layers.length === 0) return null;

        try {
            const model = tf.sequential();
            let isFirstLayer = true;

            layers.forEach((layer, index) => {
                switch (layer.type) {
                    case "Conv2D":
                        if (isFirstLayer) {
                            model.add(tf.layers.conv2d({
                                ...layer,
                                inputShape: [28, 28, 1] // MNIST input shape
                            }));
                            isFirstLayer = false;
                        } else {
                            model.add(tf.layers.conv2d(layer));
                        }
                        break;
                    case "ReLU":
                        model.add(tf.layers.activation({ activation: "relu" }));
                        break;
                    case "MaxPooling2D":
                        model.add(tf.layers.maxPooling2d(layer));
                        break;
                    case "BatchNormalization":
                        model.add(tf.layers.batchNormalization());
                        break;
                    case "Dropout":
                        model.add(tf.layers.dropout(layer));
                        break;
                    case "Flatten":
                        model.add(tf.layers.flatten());
                        break;
                    case "Dense":
                        model.add(tf.layers.dense(layer));
                        break;
                    case "Softmax":
                        model.add(tf.layers.activation({ activation: "softmax" }));
                        break;
                }
            });

            model.compile({
                optimizer: trainingSettings.optimizer,
                loss: "categoricalCrossentropy",
                metrics: ["accuracy"],
            });

            return model;
        } catch (error) {
            console.error('Failed to create model:', error);
            return null;
        }
    };

    const handleTrain = async () => {
        if (!dataLoaded || isTraining) return;

        // Use training-specific validation
        const trainingValidation = validateForTraining(layers);
        if (!trainingValidation.isValid) {
            alert(`Cannot start training:\n${trainingValidation.errors.join('\n')}`);
            return;
        }

        setIsTraining(true);
        setTrainingComplete(false);
        setMetrics([]);
        setCurrentEpoch(0);

        // Notify parent about training start
        onTrainingUpdate?.(null, [], true, false);

        try {
            const model = createModel();
            if (!model) {
                alert('Failed to create model. Please check your layer configuration.');
                return;
            }

            modelRef.current = model;

            console.log('Starting training...');

            // Use the appropriate data loader
            const dataLoader = usingDummyData ? dummyMnistDataLoader : mnistDataLoader;
            const trainMetrics: TrainingMetrics[] = [];

            // Use a simpler training approach with proper batching
            for (let epoch = 0; epoch < trainingSettings.epochs; epoch++) {
                setCurrentEpoch(epoch + 1);

                // Get fresh data for each epoch
                const trainBatch = dataLoader.getTrainingBatch(trainingSettings.batchSize);
                const valBatch = dataLoader.getTestBatch(Math.min(trainingSettings.batchSize, 100));

                if (!trainBatch || !valBatch) {
                    alert('Failed to load training data');
                    return;
                }

                try {
                    const history = await model.fit(trainBatch.images, trainBatch.labels, {
                        epochs: 1,
                        validationData: [valBatch.images, valBatch.labels],
                        verbose: 0
                    });

                    const epochMetrics: TrainingMetrics = {
                        epoch: epoch + 1,
                        loss: history.history.loss[0] as number,
                        accuracy: history.history.acc?.[0] as number || 0,
                        valLoss: history.history.val_loss?.[0] as number,
                        valAccuracy: history.history.val_acc?.[0] as number || 0
                    };

                    trainMetrics.push(epochMetrics);
                    setMetrics([...trainMetrics]);

                    // Notify parent about training progress
                    onTrainingUpdate?.(model, [...trainMetrics], false, false);

                    // Clean up tensors for this epoch
                    trainBatch.images.dispose();
                    trainBatch.labels.dispose();
                    valBatch.images.dispose();
                    valBatch.labels.dispose();

                } catch (epochError) {
                    console.error(`Error in epoch ${epoch + 1}:`, epochError);
                    
                    // Clean up on error
                    trainBatch.images.dispose();
                    trainBatch.labels.dispose();
                    valBatch.images.dispose();
                    valBatch.labels.dispose();
                    
                    throw epochError;
                }
            }

            setTrainingComplete(true);
            
            // Notify parent about training completion
            onTrainingUpdate?.(modelRef.current, trainMetrics, false, true);

        } catch (error) {
            console.error('Training failed:', error);
            alert('Training failed. Check console for details.');
        } finally {
            setIsTraining(false);
        }
    };

    const chartData = {
        labels: metrics.map(m => `Epoch ${m.epoch}`),
        datasets: [
            {
                label: 'Training Loss',
                data: metrics.map(m => m.loss),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                yAxisID: 'y',
            },
            {
                label: 'Training Accuracy',
                data: metrics.map(m => m.accuracy),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.2)',
                yAxisID: 'y1',
            },
            {
                label: 'Validation Accuracy',
                data: metrics.map(m => m.valAccuracy),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                yAxisID: 'y1',
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            title: {
                display: true,
                text: 'Training Progress',
            },
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Epoch'
                }
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: 'Loss'
                },
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: {
                    display: true,
                    text: 'Accuracy'
                },
                grid: {
                    drawOnChartArea: false,
                },
                min: 0,
                max: 1,
            },
        },
    };

    return (
        <div>
            <h3>Train & Visualize</h3>
            
            {/* Validation Status */}
            {!validation.isValid && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                    <strong>Cannot train model:</strong>
                    <ul>
                        {validation.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Data Loading Status */}
            {isDataLoading && (
                <p>Loading MNIST dataset... This may take a moment.</p>
            )}

            {usingDummyData && (
                <div style={{ color: 'orange', marginBottom: '1rem' }}>
                    ⚠️ Using dummy data for demonstration (real MNIST data failed to load)
                </div>
            )}

            {/* Training Controls */}
            {dataLoaded && layers.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                    <button 
                        onClick={handleTrain} 
                        disabled={isTraining || !validateForTraining(layers).isValid}
                        style={{ 
                            backgroundColor: isTraining || !validateForTraining(layers).isValid ? '#666' : '#4e9cff',
                            cursor: isTraining || !validateForTraining(layers).isValid ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isTraining ? `Training... (Epoch ${currentEpoch}/${trainingSettings.epochs})` : 'Start Training'}
                    </button>
                    
                    {/* Show training validation errors */}
                    {!validateForTraining(layers).isValid && (
                        <div className="validation-error" style={{ marginTop: '0.5rem' }}>
                            <strong>Cannot start training:</strong>
                            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                                {validateForTraining(layers).errors.map((error, idx) => (
                                    <li key={idx}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Status Messages */}
            {layers.length === 0 && (
                <p>Please add some layers to train the model.</p>
            )}

            {trainingComplete && (
                <div style={{ color: 'lightgreen', marginBottom: '1rem' }}>
                    <strong>Training completed successfully!</strong>
                    {metrics.length > 0 && (
                        <p>
                            Final accuracy: {(metrics[metrics.length - 1].accuracy * 100).toFixed(2)}% | 
                            Final validation accuracy: {((metrics[metrics.length - 1].valAccuracy || 0) * 100).toFixed(2)}%
                        </p>
                    )}
                </div>
            )}

            {/* Training Progress Chart */}
            {metrics.length > 0 && (
                <div style={{ marginTop: '2rem', height: '400px' }}>
                    <Line data={chartData} options={chartOptions} />
                </div>
            )}

            {/* Current Metrics */}
            {isTraining && metrics.length > 0 && (
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
                    <strong>Current Metrics:</strong>
                    <br />
                    Loss: {metrics[metrics.length - 1].loss.toFixed(4)} | 
                    Accuracy: {(metrics[metrics.length - 1].accuracy * 100).toFixed(2)}% |
                    Val Accuracy: {((metrics[metrics.length - 1].valAccuracy || 0) * 100).toFixed(2)}%
                </div>
            )}
        </div>
    );
};

export default TrainAndVisualize;