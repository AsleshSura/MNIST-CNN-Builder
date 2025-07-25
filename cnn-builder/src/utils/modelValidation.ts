import { CNNLayer } from '../types/layers';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export const validateLayerSequence = (layers: CNNLayer[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (layers.length === 0) {
        return { isValid: true, errors: [], warnings: [] };
    }

    // Check if model starts with feature extraction layers
    const firstLayer = layers[0];
    if (firstLayer.type !== 'Conv2D') {
        warnings.push('Consider starting with a Conv2D layer for feature extraction');
    }

    // Track if we've seen a Flatten layer
    let flattenIndex = -1;
    let hasClassificationLayers = false;

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const nextLayer = layers[i + 1];

        // Check for Flatten layer
        if (layer.type === 'Flatten') {
            if (flattenIndex !== -1) {
                errors.push(`Multiple Flatten layers found. Only one Flatten layer is allowed.`);
            }
            flattenIndex = i;
        }

        // Check layers after Flatten
        if (flattenIndex !== -1 && i > flattenIndex) {
            if (['Conv2D', 'MaxPooling2D'].includes(layer.type)) {
                errors.push(`${layer.type} layer at position ${i + 1} cannot come after Flatten layer`);
            }
            if (layer.type === 'Dense') {
                hasClassificationLayers = true;
            }
        }

        // Check layers before Flatten
        if (flattenIndex === -1 || i < flattenIndex) {
            if (layer.type === 'Dense') {
                errors.push(`Dense layer at position ${i + 1} must come after Flatten layer`);
            }
        }

        // Specific layer validations
        switch (layer.type) {
            case 'Conv2D':
                if (layer.filters <= 0) {
                    errors.push(`Conv2D layer at position ${i + 1}: filters must be positive`);
                }
                if (layer.kernelSize <= 0) {
                    errors.push(`Conv2D layer at position ${i + 1}: kernelSize must be positive`);
                }
                break;

            case 'MaxPooling2D':
                if (layer.poolSize <= 0) {
                    errors.push(`MaxPooling2D layer at position ${i + 1}: poolSize must be positive`);
                }
                break;

            case 'Dropout':
                if (layer.rate < 0 || layer.rate >= 1) {
                    errors.push(`Dropout layer at position ${i + 1}: rate must be between 0 and 1`);
                }
                break;

            case 'Dense':
                if (layer.units <= 0) {
                    errors.push(`Dense layer at position ${i + 1}: units must be positive`);
                }
                break;
        }

        // Check for activation patterns
        if (layer.type === 'Conv2D' && nextLayer && nextLayer.type !== 'ReLU' && nextLayer.type !== 'BatchNormalization') {
            warnings.push(`Conv2D layer at position ${i + 1} is not followed by activation or normalization`);
        }
    }

    // Check for proper model ending
    const lastLayer = layers[layers.length - 1];
    if (layers.length > 0) {
        if (lastLayer.type !== 'Softmax') {
            warnings.push('Model should end with Softmax activation for MNIST classification');
        }
        
        // Check if we have classification layers
        if (flattenIndex !== -1 && !hasClassificationLayers) {
            warnings.push('Model has Flatten layer but no Dense layers for classification');
        }

        // Ensure final Dense layer has 10 units for MNIST (only for training validation)
        const denseIndicies = layers.map((layer, idx) => layer.type === 'Dense' ? idx : -1).filter(idx => idx !== -1);
        if (denseIndicies.length > 0) {
            const finalDenseIndex = denseIndicies[denseIndicies.length - 1];
            const finalDenseLayer = layers[finalDenseIndex] as CNNLayer & { units?: number };
            if (finalDenseLayer.units !== 10) {
                errors.push(`Final Dense layer must have exactly 10 units for MNIST classification, but has ${finalDenseLayer.units} units`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

// Separate validation for training readiness
export const validateForTraining = (layers: CNNLayer[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (layers.length === 0) {
        errors.push('Cannot train an empty model. Add some layers first.');
        return { isValid: false, errors, warnings };
    }

    // Check basic model structure requirements for training
    const hasFlattened = layers.some(layer => layer.type === 'Flatten');
    const hasDense = layers.some(layer => layer.type === 'Dense');
    
    if (!hasFlattened) {
        errors.push('Model must have a Flatten layer to transition from 2D to 1D data');
    }
    
    if (!hasDense) {
        errors.push('Model must have at least one Dense layer for classification');
    }

    // Check for proper ending
    const lastLayer = layers[layers.length - 1];
    if (lastLayer.type !== 'Softmax') {
        errors.push('Model must end with Softmax activation for classification');
    }

    // Ensure final Dense layer has 10 units for MNIST
    const denseIndicies = layers.map((layer, idx) => layer.type === 'Dense' ? idx : -1).filter(idx => idx !== -1);
    if (denseIndicies.length > 0) {
        const finalDenseIndex = denseIndicies[denseIndicies.length - 1];
        const finalDenseLayer = layers[finalDenseIndex] as CNNLayer & { units?: number };
        if (finalDenseLayer.units !== 10) {
            errors.push(`Final Dense layer must have exactly 10 units for MNIST classification, but has ${finalDenseLayer.units} units`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

export const getRecommendedNextLayers = (layers: CNNLayer[]): string[] => {
    if (layers.length === 0) {
        return ['Conv2D'];
    }

    const lastLayer = layers[layers.length - 1];
    const hasFlattened = layers.some(layer => layer.type === 'Flatten');
    
    if (!hasFlattened) {
        // Still in feature extraction phase
        switch (lastLayer.type) {
            case 'Conv2D':
                return ['ReLU', 'BatchNormalization'];
            case 'ReLU':
                return ['Conv2D', 'MaxPooling2D', 'BatchNormalization', 'Dropout'];
            case 'MaxPooling2D':
                return ['Conv2D', 'Dropout', 'Flatten'];
            case 'BatchNormalization':
                return ['ReLU', 'Conv2D', 'MaxPooling2D'];
            case 'Dropout':
                return ['Conv2D', 'Flatten'];
            default:
                return ['Conv2D', 'ReLU', 'MaxPooling2D', 'Flatten'];
        }
    } else {
        // In classification phase
        switch (lastLayer.type) {
            case 'Flatten':
                return ['Dense'];
            case 'Dense':
                return ['ReLU', 'Dropout', 'Dense', 'Softmax'];
            case 'ReLU':
                return ['Dense', 'Dropout'];
            case 'Dropout':
                return ['Dense'];
            case 'Softmax':
                return []; // Model is complete
            default:
                return ['Dense'];
        }
    }
};
