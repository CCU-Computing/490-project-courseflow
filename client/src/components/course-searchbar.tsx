import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CourseSearchbarProps {
    // props added later (functionality)
    placeholder?: string;
}

export function CourseSearchbar({placeholder = "Search course by name or code..." }: CourseSearchbarProps) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder={placeholder}
                className="pl-10 pr-4 py-2"
                type="search"
            />
        </div>
    );
}
