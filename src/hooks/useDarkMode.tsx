

import { useState, useEffect } from 'react';
export default function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(() => {
      // Initialize the state based on local storage or default value
      if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem('darkMode');
        return storedValue ? JSON.parse(storedValue) : false;
      }
      return false;
    });
  
    useEffect(() => {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      if (!isDarkMode) {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      } 
    }, [isDarkMode]);
  
    return [isDarkMode, setIsDarkMode];
  }
  