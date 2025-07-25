import React, { useRef, ChangeEvent } from 'react';
import * as tf from '@tensorflow/tfjs';

interface ImageUploaderProps {
  onImageLoad: (image: tf.Tensor) => void;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageLoad, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      processImage(img);
    };
    img.src = URL.createObjectURL(file);
  };

  const processImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize image to 28x28 for MNIST-style models
    canvas.width = 28;
    canvas.height = 28;

    // Draw and resize image
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, 28, 28);
    ctx.drawImage(img, 0, 0, 28, 28);

    // Convert to grayscale and create tensor
    const imageData = ctx.getImageData(0, 0, 28, 28);
    const data = imageData.data;
    
    // Convert RGBA to grayscale and normalize
    const grayscaleData = [];
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255;
      grayscaleData.push(gray);
    }

    // Create tensor with shape [1, 28, 28, 1] for MNIST
    const tensor = tf.tensor4d(grayscaleData, [1, 28, 28, 1]);
    onImageLoad(tensor);
  };

  const handleUploadClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="image-uploader">
      <div 
        className={`upload-area ${disabled ? 'disabled' : ''}`}
        onClick={handleUploadClick}
      >
        <div>
          <h3>📁 Upload Image</h3>
          <p>Click to select an image file</p>
          <p className="format-info">Supports: JPG, PNG, GIF</p>
          {disabled && <p className="disabled-text">Load a model first</p>}
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="upload-input"
        disabled={disabled}
      />
      
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ImageUploader;
