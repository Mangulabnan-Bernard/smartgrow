
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';

// PWA Install Prompt
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA install prompt detected');
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button or UI
  const installButton = document.createElement('button');
  installButton.textContent = 'Install App';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #22c55e;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    z-index: 9999;
  `;
  
  installButton.onclick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome} the installation`);
      deferredPrompt = null;
      installButton.remove();
    }
  };
  
  document.body.appendChild(installButton);
});

window.addEventListener('appinstalled', () => {
  console.log('PWA installed successfully');
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
