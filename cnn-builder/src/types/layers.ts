export type LayerType = 
    | 'Conv2D'
    | 'ReLU'
    | 'MaxPooling2D'
    | 'BatchNormalization'
    | 'Dropout'
    | 'Flatten'
    | 'Dense'
    | 'Softmax';

export interface Conv2DLayer {
    type: 'Conv2D';
    filters: number;
    kernelSize: number;
    strides: number;
    padding: 'valid' | 'same';
}

export interface ReLULayer {
    type: 'ReLU';
}

export interface MaxPooling2DLayer {
    type: 'MaxPooling2D';
    poolSize: number;
    strides: number;
    padding: 'valid' | 'same';
}

export interface BatchNormalizationLayer {
    type: 'BatchNormalization';
}

export interface DropoutLayer {
    type: 'Dropout';
    rate: number;
}

export interface FlattenLayer {
    type: 'Flatten';
}

export interface DenseLayer {
    type: 'Dense';
    units: number;
}

export interface SoftmaxLayer {
    type: 'Softmax';
}

export type CNNLayer =
| Conv2DLayer
| ReLULayer
| MaxPooling2DLayer
| BatchNormalizationLayer
| DropoutLayer
| FlattenLayer
| DenseLayer
| SoftmaxLayer;

export interface ModelWeights {
    layerWeights: Array<{
        layerIndex: number;
        layerName: string;
        layerType: string;
        weights: Array<{
            name: string;
            shape: number[];
            values: any; // TensorFlow.js data can be various types
        }>;
    }>;
    modelTopology?: any; // TensorFlow.js model topology
}

export interface TrainingHistory {
    epochs: number[];
    losses: number[];
    accuracies: number[];
    valLosses?: number[];
    valAccuracies?: number[];
    trainingTime: number; // in milliseconds
    finalMetrics?: {
        accuracy: number;
        loss: number;
        valAccuracy?: number;
        valLoss?: number;
    };
}

export interface ModelConfig {
    layers: CNNLayer[];
    trainingSettings: TrainingSettings;
    metadata: ModelMetadata;
    weights?: ModelWeights;
    trainingHistory?: TrainingHistory;
    modelPerformance?: {
        parametersCount: number;
        trainableParameters: number;
        nonTrainableParameters: number;
        memoryUsage?: number; // in MB
    };
}

export interface TrainingSettings {
    epochs: number;
    batchSize: number;
    learningRate: number;
    optimizer: 'sgd' | 'adam';
}

export interface ModelMetadata {
    label: string;
    timestamp: string;
    version?: string;
    description?: string;
    author?: string;
    tags?: string[];
    exportType: 'architecture-only' | 'with-weights' | 'complete';
}