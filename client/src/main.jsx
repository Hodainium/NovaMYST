// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './Home.css';
import './Dashboard.css';
import { DarkModeProvider } from './DarkMode'; // Import the DarkModeProvider

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <DarkModeProvider>
            <App />
        </DarkModeProvider>
    </StrictMode>,
);