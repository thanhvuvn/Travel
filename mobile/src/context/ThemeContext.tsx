import React, { createContext, useContext, useState } from 'react';
import { darkColors, lightColors, ThemeColors } from '../theme/colors';

interface ThemeContextValue {
  isDark: boolean;
  theme: ThemeColors;
  toggleTheme: () => void;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: true,
  theme: darkColors,
  toggleTheme: () => {},
  setDarkMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(true);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setDarkMode = (dark: boolean) => setIsDark(dark);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        theme: isDark ? darkColors : lightColors,
        toggleTheme,
        setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
