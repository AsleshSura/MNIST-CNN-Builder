// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock TensorFlow.js for testing environment
const mockTensorFlow = {
  ready: jest.fn().mockResolvedValue(undefined),
  getBackend: jest.fn().mockReturnValue('cpu'),
  setBackend: jest.fn().mockResolvedValue(true),
  version: '4.22.0',
  sequential: jest.fn().mockReturnValue({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn().mockResolvedValue({}),
    predict: jest.fn(),
    summary: jest.fn(),
    layers: [],
    dispose: jest.fn()
  }),
  layers: {
    conv2d: jest.fn(),
    maxPooling2d: jest.fn(),
    flatten: jest.fn(),
    dense: jest.fn(),
    activation: jest.fn(),
    batchNormalization: jest.fn(),
    dropout: jest.fn()
  },
  tensor: jest.fn(),
  tensor1d: jest.fn(),
  tensor2d: jest.fn(),
  tensor3d: jest.fn(),
  tensor4d: jest.fn(),
  oneHot: jest.fn(),
  randomUniform: jest.fn(),
  gather: jest.fn(),
  engine: jest.fn().mockReturnValue({
    startScope: jest.fn(),
    endScope: jest.fn()
  }),
  dispose: jest.fn(),
  memory: jest.fn().mockReturnValue({ numTensors: 0 })
};

// Make mocks available globally
Object.defineProperty(window, 'tf', {
  value: mockTensorFlow,
  writable: true
});

(global as any).tf = mockTensorFlow;

// Mock Chart.js components
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn()
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  Title: {},
  Tooltip: {},
  Legend: {}
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: () => 'Chart Component'
}));

// Mock fetch for MNIST data loading
(global as any).fetch = jest.fn();

// Mock the MNIST data loaders to prevent async warnings
jest.mock('./utils/mnistLoader', () => ({
  mnistDataLoader: {
    loadData: jest.fn().mockResolvedValue({}),
    isDataLoaded: jest.fn().mockReturnValue(false),
    getTrainingBatch: jest.fn().mockReturnValue(null),
    getAllTrainingData: jest.fn().mockReturnValue(null),
    dispose: jest.fn()
  }
}));

jest.mock('./utils/dummyMnistLoader', () => ({
  dummyMnistDataLoader: {
    loadData: jest.fn().mockResolvedValue({}),
    isDataLoaded: jest.fn().mockReturnValue(false),
    getTrainingBatch: jest.fn().mockReturnValue(null),
    getAllTrainingData: jest.fn().mockReturnValue(null),
    dispose: jest.fn()
  }
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
(global as any).URL.createObjectURL = jest.fn(() => 'mocked-object-url');
(global as any).URL.revokeObjectURL = jest.fn();

// Mock Image constructor
(global as any).Image = class {
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 100);
  }
  src = '';
  onload: (() => void) | null = null;
  width = 784;
  height = 65000;
};

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  drawImage: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(784 * 65000 * 4).fill(128)
  }))
})) as any;

// Suppress console warnings during tests
const originalWarn = console.warn;
const originalLog = console.log;
const originalError = console.error;

beforeEach(() => {
  console.warn = jest.fn();
  console.log = jest.fn();
  // Only suppress specific React warnings, keep other errors
  console.error = jest.fn().mockImplementation((message) => {
    if (typeof message === 'string' && message.includes('act(')) {
      return; // Suppress act warnings
    }
    if (typeof message === 'string' && message.includes('WebGL')) {
      return; // Suppress WebGL warnings
    }
    originalError(message);
  });
});

afterEach(() => {
  console.warn = originalWarn;
  console.log = originalLog;
  console.error = originalError;
});
