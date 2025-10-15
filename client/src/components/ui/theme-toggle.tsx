"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        try {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark' || saved === 'light') return saved as 'light' | 'dark';
            return (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
        } catch (e) {
            return 'light';
        }
    });

    useEffect(() => {
        try {
            document.documentElement.classList.toggle('dark', theme === 'dark');
            localStorage.setItem('theme', theme);
        } catch (e) {
            // ignore
        }
    }, [theme]);

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
            className="h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border transition-colors"
        >
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
    );
};

export default ThemeToggle;
