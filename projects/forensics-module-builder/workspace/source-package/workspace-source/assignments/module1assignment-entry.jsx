import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './module1assignment-app.jsx';

const rootNode = document.getElementById('root');
if (rootNode) {
  createRoot(rootNode).render(<App />);
}
