import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AppContextProvider } from './context/AppContextProvider.jsx';
import { CompanyProvider } from './context/CompanyContext.jsx';

createRoot(document.getElementById('root')).render(
    <AppContextProvider>
      <CompanyProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CompanyProvider>
    </AppContextProvider>
);
