import * as tf from '@tensorflow/tfjs';

export interface MNISTData {
    trainImages: tf.Tensor4D;
    trainLabels: tf.Tensor2D;
    testImages: tf.Tensor4D;
    testLabels: tf.Tensor2D;
}

class MNISTDataLoader {
    private data: MNISTData | null = null;
    private readonly MNIST_IMAGES_SPRITE_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png';
    private readonly MNIST_LABELS_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8';
    
    private readonly NUM_CLASSES = 10;
    private readonly IMAGE_SIZE = 784; // 28 * 28
    private readonly NUM_TRAIN_ELEMENTS = 55000;
    private readonly NUM_TEST_ELEMENTS = 10000;

    async loadData(): Promise<MNISTData> {
        if (this.data) {
            return this.data;
        }

        // console.log('Loading MNIST data...');

        // Load the images sprite and labels
        const [imagesResponse, labelsResponse] = await Promise.all([
            fetch(this.MNIST_IMAGES_SPRITE_PATH),
            fetch(this.MNIST_LABELS_PATH)
        ]);

        // Load images from sprite
        const imageArrayBuffer = await imagesResponse.arrayBuffer();
        const imageBlob = new Blob([imageArrayBuffer]);
        const imageUrl = URL.createObjectURL(imageBlob);
        
        const img = new Image();
        const imageLoaded = new Promise((resolve) => {
            img.onload = resolve;
            img.src = imageUrl;
        });
        await imageLoaded;

        // Create canvas to extract pixel data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const totalImages = this.NUM_TRAIN_ELEMENTS + this.NUM_TEST_ELEMENTS;
        
        // Convert image data to tensor
        const imagesFloat32 = new Float32Array(totalImages * this.IMAGE_SIZE);
        for (let i = 0; i < totalImages; i++) {
            for (let j = 0; j < this.IMAGE_SIZE; j++) {
                const pixelIndex = i * this.IMAGE_SIZE + j;
                // Convert to grayscale and normalize to [0, 1]
                imagesFloat32[pixelIndex] = imageData.data[pixelIndex * 4] / 255.0;
            }
        }

        // Load labels
        const labelsArrayBuffer = await labelsResponse.arrayBuffer();
        const labelsUint8 = new Uint8Array(labelsArrayBuffer);

        // Split into train and test sets
        const trainImages = tf.tensor4d(
            imagesFloat32.slice(0, this.NUM_TRAIN_ELEMENTS * this.IMAGE_SIZE),
            [this.NUM_TRAIN_ELEMENTS, 28, 28, 1]
        );

        const testImages = tf.tensor4d(
            imagesFloat32.slice(this.NUM_TRAIN_ELEMENTS * this.IMAGE_SIZE),
            [this.NUM_TEST_ELEMENTS, 28, 28, 1]
        );

        const trainLabels = tf.oneHot(
            tf.tensor1d(Array.from(labelsUint8.slice(0, this.NUM_TRAIN_ELEMENTS)), 'int32'),
            this.NUM_CLASSES
        ) as tf.Tensor2D;

        const testLabels = tf.oneHot(
            tf.tensor1d(Array.from(labelsUint8.slice(this.NUM_TRAIN_ELEMENTS)), 'int32'),
            this.NUM_CLASSES
        ) as tf.Tensor2D;

        this.data = {
            trainImages,
            trainLabels,
            testImages,
            testLabels
        };

        // Clean up
        URL.revokeObjectURL(imageUrl);
        // console.log('MNIST data loaded successfully');

        return this.data!
    }

    getTrainingBatch(batchSize: number): { images: tf.Tensor4D; labels: tf.Tensor2D } | null {
        if (!this.data) {
            console.warn('MNIST data not loaded. Call loadData() first.');
            return null;
        }

        // Ensure batchSize doesn't exceed available data
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
            console.warn('MNIST data not loaded. Call loadData() first.');
            return null;
        }

        const actualBatchSize = Math.min(batchSize, this.NUM_TEST_ELEMENTS);
        const testImages = this.data.testImages.slice([0, 0, 0, 0], [actualBatchSize, 28, 28, 1]) as tf.Tensor4D;
        const testLabels = this.data.testLabels.slice([0, 0], [actualBatchSize, this.NUM_CLASSES]) as tf.Tensor2D;

        return { images: testImages, labels: testLabels };
    }

    getAllTrainingData(): { images: tf.Tensor4D; labels: tf.Tensor2D } | null {
        if (!this.data) {
            console.warn('MNIST data not loaded. Call loadData() first.');
            return null;
        }
        return { images: this.data.trainImages, labels: this.data.trainLabels };
    }

    getAllTestData(): { images: tf.Tensor4D; labels: tf.Tensor2D } | null {
        if (!this.data) {
            console.warn('MNIST data not loaded. Call loadData() first.');
            return null;
        }
        return { images: this.data.testImages, labels: this.data.testLabels };
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
export const mnistDataLoader = new MNISTDataLoader();
