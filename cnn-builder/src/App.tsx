import React from 'react';
import ModelBuilder from './components/ModelBuilder';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🧠 MNIST CNN Builder</h1>
        <nav className="app-nav">
          <a 
            href="/MNIST-CNN-Builder/docs/"
            className="nav-link home-link"
          >
            ← Back to Main
          </a>
          <a 
            href="/MNIST-CNN-Builder/feature-map-visualizer/"
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link feature-map-link"
          >
            🔍 Explore Feature Maps
          </a>
        </nav>
      </header>
      <ModelBuilder/>
    </div>
  );
}

export default App;
