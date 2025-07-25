# MNIST CNN Builder

An interactive web-based tool for building and training Convolutional Neural Networks (CNNs) on the MNIST dataset. Made for my IB Extended Essay where I try to find the best model for the MNIST digit classification task.

## 🚀 Features

### ✅ Core Functionality
- **Interactive Layer Builder**: Add CNN layers one by one with real-time validation
- **Smart Validation**: Enforces proper layer ordering and architecture rules
- **Live Training**: Train models directly in the browser using TensorFlow.js
- **Real-time Visualization**: View training progress with live charts (accuracy/loss)
- **Model Export/Import**: Save and share model configurations as JSON files
- **Educational Interface**: Perfect for learning CNN architectures

### 🧱 Supported Layer Types
| Layer Type | Purpose | Parameters |
|------------|---------|------------|
| Conv2D | Feature extraction | Filters, kernel size, strides, padding |
| ReLU | Non-linear activation | None |
| MaxPooling2D | Downsampling | Pool size, strides, padding |
| BatchNormalization | Input normalization | None |
| Dropout | Regularization | Dropout rate (0-1) |
| Flatten | 3D to 1D conversion | None |
| Dense | Fully connected layer | Number of units |
| Softmax | Output probabilities | None |

### 🎯 Smart Features
- **Architecture Validation**: Prevents invalid layer combinations
- **Recommended Layers**: Shows suggested next layers based on current architecture
- **Training Settings**: Customizable epochs, batch size, learning rate, and optimizer
- **Progress Tracking**: Live metrics display during training
- **Model Summary**: Overview of layer counts and architecture features

## 🛠️ Technical Stack
- **Frontend**: React 19 with TypeScript
- **ML Framework**: TensorFlow.js 4.22
- **Visualization**: Chart.js + react-chartjs-2
- **Styling**: Custom CSS with dark theme
- **Data**: MNIST dataset (loaded in browser)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/AsleshSura/MNIST-CNN-Builder.git
cd MNIST-CNN-Builder/cnn-builder

# Install dependencies
npm install

# Start the development server
npm start
```

The app will open at `http://localhost:3000` (or next available port).

## 📖 How to Use

### 1. Build Your Model
- Start by adding a Conv2D layer for feature extraction
- Follow the recommended layer suggestions (marked with ⭐)
- Add activation layers (ReLU) after convolutional layers
- Use MaxPooling2D for downsampling
- Add Flatten before Dense layers
- End with Dense(10) + Softmax for MNIST classification

### 2. Configure Training
- Set epochs (5-10 for quick experiments)
- Choose batch size (32-64 recommended)
- Select learning rate (0.001 is a good start)
- Pick optimizer (Adam is generally more robust)

### 3. Train and Monitor
- Click "Start Training" to begin
- Watch live accuracy and loss charts
- Monitor validation performance
- Training happens entirely in your browser!

### 4. Export/Import Models
- Export successful architectures as JSON
- Share configurations with others
- Import pre-built models to continue experimenting

## 🏗️ Example CNN Architecture

Here's a simple but effective MNIST CNN:

1. **Conv2D** (8 filters, 3x3 kernel)
2. **ReLU**
3. **MaxPooling2D** (2x2 pool)
4. **Conv2D** (16 filters, 3x3 kernel)
5. **ReLU**
6. **MaxPooling2D** (2x2 pool)
7. **Flatten**
8. **Dense** (64 units)
9. **ReLU**
10. **Dropout** (0.25 rate)
11. **Dense** (10 units)
12. **Softmax**

## 🎓 Educational Value

This tool is designed for:
- **ML Students**: Learn CNN architecture principles hands-on
- **Researchers**: Quickly prototype and test ideas
- **Educators**: Interactive demonstrations of deep learning concepts
- **Hobbyists**: Explore neural networks without setup complexity

## 🔧 Advanced Features

### Model Validation
- Prevents invalid layer sequences
- Ensures proper input/output shape matching
- Validates hyperparameter ranges
- Provides architecture recommendations

### Training Enhancements
- Automatic memory management
- Error handling with detailed feedback
- Progress tracking with metrics history
- Fallback to dummy data if MNIST loading fails

### User Experience
- Responsive design for mobile/tablet
- Dark theme optimized for coding
- Real-time validation feedback
- Comprehensive error messages

## 🐛 Troubleshooting

### Common Issues
1. **Training fails**: Check that your model ends with Dense(10) + Softmax
2. **Data loading slow**: MNIST loads from CDN, may take time on slow connections
3. **Memory issues**: Use smaller batch sizes (16-32) for large models
4. **Validation errors**: Follow the recommended layer sequence

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: May have slower performance
- Mobile: Limited by device memory

## 📊 Performance Notes
- Training happens client-side (no server needed)
- Larger models require more browser memory
- Batch size affects both speed and memory usage
- Real MNIST data loads once and caches

## 🤝 Contributing
Feel free to submit issues and enhancement requests! This project is part of academic research but welcomes community improvements.

## 📄 License
MIT License - see LICENSE file for details.

## 🎯 Future Enhancements
- [ ] Support for custom datasets
- [ ] Pre-trained model gallery
- [ ] Architecture comparison tools
- [ ] Advanced layer types (Attention, etc.)
- [ ] Cloud model saving
- [ ] Collaborative features

---

**Built with ❤️ for the IB Extended Essay project exploring optimal CNN architectures for MNIST digit classification.**
