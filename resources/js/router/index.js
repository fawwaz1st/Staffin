import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../app.jsx';
import '../bootstrap.js';
import '../../css/app.css';

function mount() {
  const el = document.getElementById('app');
  if (!el) return;
  const root = createRoot(el);
  root.render(React.createElement(App));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
  mount();
}
