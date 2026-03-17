import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './module3assignment-app.jsx';

const rootNode = document.getElementById('root');
if (rootNode) {
  createRoot(rootNode).render(<App />);
}
