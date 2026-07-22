import React, { createContext, useState, useContext, useCallback } from 'react';

const SnackbarContext = createContext();

export const useSnackbar = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
    const [snackbar, setSnackbar] = useState({
        isOpen: false,
        message: '',
        type: 'info',
    });

    const showMessage = useCallback((message, type = 'info') => {
        setSnackbar({ isOpen: true, message, type });
        
        setTimeout(() => {
            setSnackbar((prev) => ({ ...prev, isOpen: false }));
        }, 3000);
    }, []);

    // Tailwind color mapping based on snackbar type
    const typeStyles = {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white',
    };

    return (
        <SnackbarContext.Provider value={{ showMessage }}>
            {children}
            
            {snackbar.isOpen && (
                <div 
                    className={`fixed left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl font-medium z-[9999] animate-slideUp ${typeStyles[snackbar.type]}`}
                >
                    {snackbar.message}
                </div>
            )}
        </SnackbarContext.Provider>
    );
};