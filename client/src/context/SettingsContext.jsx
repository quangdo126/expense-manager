import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
    const [amountDisplay, setAmountDisplay] = useState(() => {
        return localStorage.getItem('amountDisplay') || 'full'; // 'full' or 'short'
    });

    useEffect(() => {
        localStorage.setItem('amountDisplay', amountDisplay);
    }, [amountDisplay]);

    // Format amount based on setting
    const formatAmount = (amount, showSign = false) => {
        const absAmount = Math.abs(amount);
        const sign = showSign ? (amount >= 0 ? '+' : '-') : (amount < 0 ? '-' : '');

        if (amountDisplay === 'full') {
            return sign + new Intl.NumberFormat('vi-VN').format(absAmount) + 'đ';
        } else {
            // Short format
            if (absAmount >= 1000000000) {
                return sign + (absAmount / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
            } else if (absAmount >= 1000000) {
                return sign + (absAmount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            } else if (absAmount >= 1000) {
                return sign + (absAmount / 1000).toFixed(0) + 'K';
            }
            return sign + absAmount + 'đ';
        }
    };

    return (
        <SettingsContext.Provider value={{
            amountDisplay,
            setAmountDisplay,
            formatAmount
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
