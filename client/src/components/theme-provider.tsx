import { createContext, useContext, useEffect, useState } from "react";
import { safeLocalStorage } from "@/lib/local-storage";
import { AppSettings, ThemeColors } from "@/types";
import { defaultAppSettings } from "@/lib/constants";

type Theme = 'light' | 'dark' | 'blue' | 'green';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
  fontSize: number;
  setFontSize: (size: number) => void;
  applyThemeColors: (colors: Partial<ThemeColors>) => void;
}

const themeColors = {
  light: {
    background: 'bg-gray-100',
    foreground: 'text-gray-800',
    card: 'bg-white',
    cardForeground: 'text-gray-800',
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-200 hover:bg-gray-300',
    accent: 'bg-blue-100',
    muted: 'bg-gray-100'
  },
  dark: {
    background: 'bg-gray-900',
    foreground: 'text-white',
    card: 'bg-gray-800',
    cardForeground: 'text-white',
    primary: 'bg-blue-600 hover:bg-blue-700',
    secondary: 'bg-gray-700 hover:bg-gray-600',
    accent: 'bg-gray-700',
    muted: 'bg-gray-800'
  },
  blue: {
    background: 'bg-blue-900',
    foreground: 'text-white',
    card: 'bg-blue-800',
    cardForeground: 'text-white',
    primary: 'bg-blue-500 hover:bg-blue-400',
    secondary: 'bg-blue-700 hover:bg-blue-600',
    accent: 'bg-blue-700',
    muted: 'bg-blue-800'
  },
  green: {
    background: 'bg-green-900',
    foreground: 'text-white',
    card: 'bg-green-800',
    cardForeground: 'text-white',
    primary: 'bg-green-500 hover:bg-green-400',
    secondary: 'bg-green-700 hover:bg-green-600',
    accent: 'bg-green-700',
    muted: 'bg-green-800'
  }
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'light'
}: ThemeProviderProps) {
  // Get stored settings or use defaults
  const [settings, setSettings] = useState<AppSettings>(() => 
    safeLocalStorage.getItem('appSettings', defaultAppSettings)
  );
  
  const [theme, setTheme] = useState<Theme>(settings.theme as Theme || defaultTheme);
  const [colors, setColors] = useState<ThemeColors>(themeColors[theme]);
  const [fontSize, setFontSize] = useState<number>(settings.fontSize || 16);

  useEffect(() => {
    // Update settings when theme or font size changes
    const newSettings = { ...settings, theme, fontSize };
    setSettings(newSettings);
    safeLocalStorage.setItem('appSettings', newSettings);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply font size to document
    document.documentElement.style.fontSize = `${fontSize}px`;
    
    // Set colors based on theme
    setColors(themeColors[theme]);
    
    // Apply dark class for dark mode
    if (theme === 'dark' || theme === 'blue' || theme === 'green') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
  }, [theme, fontSize, settings]);

  // Function to apply custom colors
  const applyThemeColors = (customColors: Partial<ThemeColors>) => {
    setColors(prevColors => ({ ...prevColors, ...customColors }));
  };

  const contextValue = {
    theme,
    setTheme,
    colors,
    fontSize,
    setFontSize,
    applyThemeColors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};