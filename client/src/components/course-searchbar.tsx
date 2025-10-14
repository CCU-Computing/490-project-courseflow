import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CourseSearchbarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
}

export function CourseSearchbar({placeholder = "Search course by name or code...", value = "", onChange }: CourseSearchbarProps) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder={placeholder}
                className="pl-10 pr-4 py-2"
                type="search"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
            />
        </div>
    );
}
