import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import { CourseSearchbar } from '@/components/course-searchbar';
import type { Course } from '@/lib/mock-data';

interface CourseSearchSidebarProps {
    onClose: () => void;
    onCourseSelect?: (course: Course) => void;
    courses: Course[];
}

export function CourseSearchSidebar({ onClose, onCourseSelect, courses }: CourseSearchSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) {
            return [];
        }

        const query = searchQuery.toLowerCase().trim();
        
        return courses.filter(course => {
            // Normalize the course code for searching
            const normalizedCode = course.code.toLowerCase().replace('*', ' ').replace(/\s+/g, ' ').trim();
            const normalizedTitle = course.title.toLowerCase();
            
            // Check if query matches code (with different formatting)
            const codeMatch = normalizedCode.includes(query) || 
                            course.code.toLowerCase().includes(query) ||
                            // Handle "MATH 130A" vs "MATH*130A"
                            course.code.toLowerCase().replace('*', '').includes(query.replace(/\s/g, '')) ||
                            // Handle "math130a" without spaces
                            course.code.toLowerCase().replace('*', '').includes(query.replace(/\s/g, '')) ||
                            // Handle partial matches like "math130"
                            course.code.toLowerCase().includes(query.replace(/\s/g, ''));

            // Check if query matches title
            const titleMatch = normalizedTitle.includes(query);
            
            return codeMatch || titleMatch;
        });
    }, [searchQuery, courses]);

    const handleCourseClick = (course: Course) => {
        onCourseSelect?.(course);
    };

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

            <CardContent className="flex-grow p-6 overflow-hidden flex flex-col">
                <div className="space-y-6">
                    <CourseSearchbar 
                        placeholder="Search by course code or name..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto mt-6">
                    {searchQuery.trim() && filteredCourses.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <p>No courses found for "{searchQuery}"</p>
                            <p className="text-sm mt-2">Try searching with just the subject or number</p>
                        </div>
                    ) : filteredCourses.length > 0 ? (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground">
                                Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                            </h3>
                            {filteredCourses.map((course) => (
                                <Card 
                                    key={course.id} 
                                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                                    onClick={() => handleCourseClick(course)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-primary">{course.code}</h4>
                                                <p className="text-sm font-medium">{course.title}</p>
                                                {course.description && (
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {course.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end text-xs text-muted-foreground">
                                                <span>{course.credits} credit{course.credits !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <Search className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                            <p>Enter a course code or name to search</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </div>
    );
}