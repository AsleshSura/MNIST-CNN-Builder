import * as tf from '@tensorflow/tfjs';

export interface DummyMNISTData {
    trainImages: tf.Tensor4D;
    trainLabels: tf.Tensor2D;
    testImages: tf.Tensor4D;
    testLabels: tf.Tensor2D;
}

class DummyMNISTDataLoader {
    private data: DummyMNISTData | null = null;
    
    private readonly NUM_CLASSES = 10;
    private readonly NUM_TRAIN_ELEMENTS = 1000;
    private readonly NUM_TEST_ELEMENTS = 200;

    async loadData(): Promise<DummyMNISTData> {
        if (this.data) {
            return this.data;
        }

        // console.log('Creating dummy MNIST data for testing...');

        // Create dummy training data that resembles MNIST
        const trainImages = tf.randomUniform([this.NUM_TRAIN_ELEMENTS, 28, 28, 1], 0, 1) as tf.Tensor4D;
        const trainLabels = tf.oneHot(
            tf.randomUniform([this.NUM_TRAIN_ELEMENTS], 0, this.NUM_CLASSES, 'int32'),
            this.NUM_CLASSES
        ) as tf.Tensor2D;

        // Create dummy test data
        const testImages = tf.randomUniform([this.NUM_TEST_ELEMENTS, 28, 28, 1], 0, 1) as tf.Tensor4D;
        const testLabels = tf.oneHot(
            tf.randomUniform([this.NUM_TEST_ELEMENTS], 0, this.NUM_CLASSES, 'int32'),
            this.NUM_CLASSES
        ) as tf.Tensor2D;

        this.data = {
            trainImages,
            trainLabels,
            testImages,
            testLabels
        };

        // console.log('Dummy MNIST data created successfully');
        return this.data;
    }

    getTrainingBatch(batchSize: number): { images: tf.Tensor4D; labels: tf.Tensor2D } | null {
        if (!this.data) {
            console.warn('Dummy MNIST data not loaded. Call loadData() first.');
            return null;
        }

        const actualBatchSize = Math.min(batchSize, this.NUM_TRAIN_ELEMENTS);
        const indices = tf.randomUniform([actualBatchSize], 0, this.NUM_TRAIN_ELEMENTS, 'int32');
        
        const batchImages = tf.gather(this.data.trainImages, indices) as tf.Tensor4D;
        const batchLabels = tf.gather(this.data.trainLabels, indices) as tf.Tensor2D;

        // Clean up indices tensor
        indices.dispose();

        return { images: batchImages, labels: batchLabels };
    }

    getTestBatch(batchSize: number): { images: tf.Tensor4D; labels: tf.Tensor2D } | null {
        if (!this.data) {
            console.warn('Dummy MNIST data not loaded. Call loadData() first.');
            return null;
        }

        const actualBatchSize = Math.min(batchSize, this.NUM_TEST_ELEMENTS);
        const testImages = this.data.testImages.slice([0, 0, 0, 0], [actualBatchSize, 28, 28, 1]) as tf.Tensor4D;
        const testLabels = this.data.testLabels.slice([0, 0], [actualBatchSize, this.NUM_CLASSES]) as tf.Tensor2D;

        return { images: testImages, labels: testLabels };
    }

    isDataLoaded(): boolean {
        return this.data !== null;
    }

    dispose(): void {
        if (this.data) {
            this.data.trainImages.dispose();
            this.data.trainLabels.dispose();
            this.data.testImages.dispose();
            this.data.testLabels.dispose();
            this.data = null;
        }
    }
}

// Singleton instance
export const dummyMnistDataLoader = new DummyMNISTDataLoader();
