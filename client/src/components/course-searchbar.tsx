import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CourseSearchbarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    debounceMs?: number;
}

export function CourseSearchbar({ placeholder = "Search course by name or code...", value = "", onChange, debounceMs = 250 }: CourseSearchbarProps) {
    const [input, setInput] = useState<string>(value || '');

    // keep local input in sync if parent controls value
    useEffect(() => {
        setInput(value || '');
    }, [value]);

    // debounce calls to onChange
    useEffect(() => {
        const id = window.setTimeout(() => {
            onChange?.(input);
        }, debounceMs);
        return () => window.clearTimeout(id);
    }, [input, onChange, debounceMs]);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                className="pl-10 pr-4 py-2"
                type="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
        </div>
    );
}