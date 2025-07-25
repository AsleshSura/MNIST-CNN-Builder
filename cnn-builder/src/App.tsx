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
            href={process.env.NODE_ENV === 'production' ? '/MNIST-CNN-Builder/feature-map-visualizer/' : 'http://localhost:3002'} 
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
