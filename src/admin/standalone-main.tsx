import React from 'react';
import ReactDOM from 'react-dom/client';
import { StandaloneAdminPortal } from './StandaloneAdminPortal';
import '../index.css';

const rootEl = document.getElementById('admin-root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <StandaloneAdminPortal />
    </React.StrictMode>
  );
}
