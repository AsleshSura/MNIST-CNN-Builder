# Quick Start Guide

## 🎯 5-Minute Demo

### Step 1: Add Basic CNN Layers
1. **Conv2D**: 8 filters, 3x3 kernel → Click "Add Layer"
2. **ReLU**: No parameters → Click "Add Layer"  
3. **MaxPooling2D**: 2x2 pool → Click "Add Layer"
4. **Flatten**: No parameters → Click "Add Layer"
5. **Dense**: 10 units → Click "Add Layer"
6. **Softmax**: No parameters → Click "Add Layer"

### Step 2: Configure Training
- **Epochs**: 3 (for quick demo)
- **Batch Size**: 32
- **Learning Rate**: 0.001
- **Optimizer**: Adam

### Step 3: Train
- Click "Start Training"
- Watch the live chart update
- Should reach ~85%+ accuracy in 3 epochs

### Step 4: Export (Optional)
- Click "Export Model" to save your architecture
- Try importing it later to restore settings

## 🔧 Pro Tips

### For Better Accuracy
- Add BatchNormalization after Conv2D layers
- Use Dropout (0.25) before final Dense layer
- Try 16-32 filters in Conv2D layers
- Increase epochs to 5-10

### For Faster Training
- Reduce batch size to 16
- Use fewer epochs (2-3)
- Smaller models train faster

### Common Mistakes
- ❌ Dense before Flatten
- ❌ Missing Softmax at end
- ❌ Wrong number of units in final Dense (should be 10)
- ❌ Too high learning rate (> 0.01)

## 🎨 UI Features

### Validation Indicators
- ✅ **Green**: Valid architecture
- ⚠️ **Orange**: Warnings (still trainable)
- ❌ **Red**: Errors (cannot train)

### Visual Feedback
- **⭐ Starred layers**: Recommended next layers
- **Real-time metrics**: Updates every epoch
- **Progress indicators**: Shows current epoch/total

### Smart Suggestions
The app automatically suggests the most logical next layer based on your current architecture. Follow the stars for best results!

## 📱 Mobile Usage
- All features work on mobile
- Charts are responsive
- Touch-friendly interface
- Portrait mode recommended

## 🚀 Advanced Experiments

### ResNet-Style Architecture
Try adding multiple Conv2D→ReLU→Conv2D→ReLU→MaxPooling2D blocks for deeper networks.

### Regularization Focus
Add BatchNormalization after every Conv2D and Dropout before Dense layers.

### Parameter Tuning
Experiment with different:
- Filter counts (8, 16, 32, 64)
- Kernel sizes (3x3, 5x5)
- Learning rates (0.0001, 0.001, 0.01)

---

**Happy experimenting! 🧠🚀**
