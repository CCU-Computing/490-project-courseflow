import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search} from 'lucide-react';
import { CourseSearchbar } from '@/components/course-searchbar';

interface CourseSearchSidebarProps {
    onClose: () => void;
}

export function CourseSearchSidebar({ onClose }: CourseSearchSidebarProps) {
    return (
        <div className="flex flex-col h-full bg-card">
            <CardHeader className="relative p-6 border-b">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold font-headline flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Courses
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onClose}
                        aria-label="Close search"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-grow p-6">
                <div className="space-y-6">
                    <CourseSearchbar placeholder="Search by course code or name..." />

                    {/* placeholder for search results- functionality later*/}
                    <div className="text-center text-muted-foreground py-8">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                        <p>Enter a course code or name to search</p>
                    </div>
                </div>
            </CardContent>
        </div>
    );
}