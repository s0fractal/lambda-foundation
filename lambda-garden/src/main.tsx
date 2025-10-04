/**
 * λ-GARDEN Entry Point
 * The Genesis of Living Computation
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { createGenesisGarden } from './garden/first-seeds';
import './index.css';

// Plant the first seeds
const genesis = createGenesisGarden();
console.log("🌸 Genesis Garden:", genesis);

// Remove loading screen after a moment
setTimeout(() => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.transition = 'opacity 1s';
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 1000);
  }
}, 2000);

// Render the garden
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);