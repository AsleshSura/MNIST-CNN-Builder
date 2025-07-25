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
    kernelSize: number;
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

export interface ModelConfig {
    layers: CNNLayer[];
    trainingSettings: TrainingSettings;
    metadata: ModelMetadata;
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
}