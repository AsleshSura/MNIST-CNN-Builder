# 🧪 Testing Guide for Enhanced Import/Export Features

## Quick Test Workflow

### 1. **Test Architecture Export** (Basic)
1. Open the CNN Builder application
2. Add some layers (e.g., Conv2D → ReLU → MaxPooling2D → Flatten → Dense → Softmax)
3. Go to the Import/Export section
4. Ensure "Architecture Only" is selected
5. Click "Export Model"
6. Verify the downloaded JSON file contains layer configuration

### 2. **Test Complete Export** (Advanced)
1. Build a model with several layers
2. Configure training settings (e.g., 3 epochs for quick test)
3. Click "Start Training" and wait for completion
4. In Import/Export section, select "Complete" option
5. Click "Export Model"
6. Verify the exported file includes:
   - Layer architecture
   - Training settings
   - Model weights
   - Training history
   - Performance metrics

### 3. **Test Import Functionality**
1. Export a model as described above
2. Clear the current model (refresh page or remove all layers)
3. Click "Import Model"
4. Select the previously exported file
5. Verify all components are restored:
   - Layer list shows correct architecture
   - Training settings are restored
   - Training history is displayed (if available)

### 4. **Test Export Type Switching**
1. Build and train a model
2. Try switching between export types:
   - "Architecture Only" - should always be available
   - "With Weights" - only available after training
   - "Complete" - only available after training
3. Verify appropriate options are enabled/disabled

## 🔍 What to Look For

### Export Preview Panel
- Shows correct number of layers
- Displays training settings
- Indicates model training status
- Shows export type selection

### Advanced Options Panel
- Expands/collapses correctly
- Provides educational information about export types
- Shows file size warnings for weight exports

### Import Summary
- Detailed feedback about imported content
- Shows number of layers, parameters, training history
- Validates file structure correctly

### User Experience
- Clean, intuitive interface
- Clear visual feedback
- Helpful tooltips and descriptions
- Smooth interactions

## 🚨 Common Issues to Check

### Export Issues
- Ensure trained model exists before weight export
- Check file downloads correctly
- Verify JSON structure is valid

### Import Issues
- File validation catches invalid formats
- Error messages are helpful and clear
- Imported data loads correctly into UI

### Performance
- Large weight exports don't freeze UI
- Import/export operations complete in reasonable time
- Memory usage remains stable

## 📊 Expected File Sizes

### Export Type Comparison
- **Architecture Only**: ~1-5 KB (just configuration)
- **With Weights**: ~50-500 KB (depends on model size)
- **Complete**: ~50-500 KB+ (weights + training data)

### Example Model (7 layers, ~25K parameters)
- Architecture: ~2 KB
- With Weights: ~100-200 KB
- Complete: ~100-250 KB

## ✅ Success Criteria

The enhanced import/export system is working correctly if:

1. ✅ All three export types function properly
2. ✅ Weight extraction and serialization works
3. ✅ Training history is captured and exported
4. ✅ Import validation catches invalid files
5. ✅ Imported models restore correctly
6. ✅ UI provides clear feedback throughout
7. ✅ Export/import cycle preserves all data
8. ✅ Performance remains acceptable for typical models

## 🎯 Advanced Testing

### Edge Cases
- Very large models (test memory limits)
- Models with many layers
- Empty models (should export architecture only)
- Partially trained models
- Invalid import files

### Browser Compatibility
- Test download functionality
- Verify file picker works
- Check JSON serialization/parsing
- Validate tensor disposal (no memory leaks)

### Workflow Integration
- Export → Import → Continue Training
- Share model between users
- Compare different architectures
- Version control scenarios

---

*These tests verify that the enhanced import/export system provides a professional-grade model management experience while maintaining the educational focus of the CNN Builder platform.*
