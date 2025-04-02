import { createContext, useState, useEffect } from 'react';

export const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode);
        document.body.classList.toggle('dark-mode', newMode);
    };

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
};