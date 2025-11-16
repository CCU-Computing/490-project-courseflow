import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Search, Filter, Plus } from 'lucide-react';
import { CourseSearchbar } from '@/components/course-searchbar';
import type { Course } from '@/lib/mock-data';
import { cn } from '@/lib/utils'

interface CourseSearchSidebarProps {
    onClose: () => void;
    onCourseSelect?: (course: Course) => void;
    courses: Course[];
}

interface FilterState {
    credits: number[];
    subjects: string[];
    level: string[];
    sortBy: 'code' | 'title' | 'credits';
    sortOrder: 'asc' | 'desc';
}

interface FilterOption {
    type: 'credits' | 'subject' | 'level' | 'semester';
    value: string | number;
    label: string;
}

// Helper: read semester info from Course
function getCourseSemesters(course: Course): string[] {
    const c: any = course;

    // your real field
    if (Array.isArray(c.semesters_offered)) return c.semesters_offered;

    // fallbacks
    if (Array.isArray(c.semesters)) return c.semesters;
    if (typeof c.semesters === 'string') return [c.semesters];

    if (Array.isArray(c.semester)) return c.semester;
    if (typeof c.semester === 'string') return [c.semester];

    if (Array.isArray(c.semesterOffered)) return c.semesterOffered;
    if (typeof c.semesterOffered === 'string') return [c.semesterOffered];

    if (Array.isArray(c.terms)) return c.terms;
    if (typeof c.terms === 'string') return [c.terms];

    if (typeof c.term === 'string') return [c.term];

    return [];
}

export function CourseSearchSidebar({ onClose, onCourseSelect, courses }: CourseSearchSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);

    // Extract available filter options from courses
    const availableFilters = useMemo(() => {
        const subjects = Array.from(new Set(courses.map(course => {
            const match = course.code.match(/^([A-Z]+)/);
            return match ? match[1] : '';
        }))).filter(Boolean).sort();

        const credits = Array.from(new Set(courses.map(course => course.credits))).sort((a, b) => a - b);

        const levels = Array.from(new Set(courses.map(course => {
            const match = course.code.match(/\d+/);
            if (match) {
                const num = parseInt(match[0]);
                const level = Math.floor(num / 100) * 100;
                return level.toString();
            }
            return 'Other';
        }))).filter(level => level !== 'Other').sort((a, b) => parseInt(a) - parseInt(b));

        // Collect semesters from data AND always include Fall/Spring/Summer/Winter
        const baseSemesters = ['Fall', 'Spring', 'Summer', 'Winter'];

        const semesters = Array.from(
            new Set([
                ...baseSemesters,
                ...courses.flatMap(course => getCourseSemesters(course))
            ])
        )
            .filter(Boolean)
            .sort();

        return {
            subjects: subjects.map(subject => ({
                type: 'subject' as const,
                value: subject,
                label: subject
            })),
            credits: credits.map(credit => ({
                type: 'credits' as const,
                value: credit,
                label: `${credit} credit${credit !== 1 ? 's' : ''}`
            })),
            levels: levels.map(level => ({
                type: 'level' as const,
                value: level,
                label: `${level} Level`
            })),
            semesters: semesters.map(semester => ({
                type: 'semester' as const,
                value: semester,
                label: semester
            }))
        };
    }, [courses]);

    const filteredCourses = useMemo(() => {
        let result = courses;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            
            result = result.filter(course => {
                const normalizedCode = course.code.toLowerCase().replace('*', ' ').replace(/\s+/g, ' ').trim();
                const normalizedTitle = course.title.toLowerCase();
                
                const codeMatch = normalizedCode.includes(query) || 
                                course.code.toLowerCase().includes(query) ||
                                course.code.toLowerCase().replace('*', '').includes(query.replace(/\s/g, '')) ||
                                course.code.toLowerCase().includes(query.replace(/\s/g, ''));

                const titleMatch = normalizedTitle.includes(query);
                
                return codeMatch || titleMatch;
            });
        }

        // Apply active filters
        if (activeFilters.length > 0) {
            result = result.filter(course => {
                return activeFilters.every(filter => {
                    switch (filter.type) {
                        case 'subject':
                            return course.code.startsWith(filter.value as string);

                        case 'credits':
                            return course.credits === filter.value;

                        case 'level': {
                            const match = course.code.match(/\d+/);
                            if (match) {
                                const num = parseInt(match[0]);
                                const courseLevel = Math.floor(num / 100) * 100;
                                return courseLevel.toString() === filter.value;
                            }
                            return false;
                        }

                        case 'semester': {
                            const semesters = getCourseSemesters(course);
                            return semesters.includes(filter.value as string);
                        }

                        default:
                            return true;
                    }
                });
            });
        }

        return result;
    }, [searchQuery, courses, activeFilters]);

    const handleCourseClick = (course: Course) => {
        onCourseSelect?.(course);
    };

    const handleAddFilter = (filter: FilterOption) => {
        if (!activeFilters.some(f => f.type === filter.type && f.value === filter.value)) {
            setActiveFilters(prev => [...prev, filter]);
        }
    };

    const handleRemoveFilter = (filterToRemove: FilterOption) => {
        setActiveFilters(prev => prev.filter(filter => 
            !(filter.type === filterToRemove.type && filter.value === filterToRemove.value)
        ));
    };

    const handleClearFilters = () => {
        setActiveFilters([]);
    };

    const handleApplyFilters = () => {
        setShowFilters(false);
    };

    const displayCourses = searchQuery.trim() || activeFilters.length > 0 ? filteredCourses : [];

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
                <div className="space-y-4 flex-shrink-0">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <CourseSearchbar 
                                placeholder="Search by course code or name..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "h-10 w-10 flex-shrink-0",
                                activeFilters.length > 0 && "bg-primary/10 border-primary/20"
                            )}
                            aria-label="Open filters"
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Active Filters */}
                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {activeFilters.map((filter) => (
                                <div
                                    key={`${filter.type}-${filter.value}`}
                                    className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                                >
                                    <span>{filter.label}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 hover:bg-primary/20"
                                        onClick={() => handleRemoveFilter(filter)}
                                        aria-label={`Remove ${filter.label} filter`}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-sm h-auto py-1"
                            >
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <Card className="mt-4 border-l-2 border-l-primary flex flex-col flex-1 min-h-0">
                        <CardHeader className="pb-3 flex-shrink-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Add Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Subject Filters */}
                            <div>
                                <h4 className="font-semibold text-sm mb-3">Subject</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {availableFilters.subjects.map(subject => (
                                        <Button
                                            key={subject.value}
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start text-sm font-normal"
                                            onClick={() => handleAddFilter(subject)}
                                        >
                                            <Plus className="h-2 w-2 mr-1" />
                                            {subject.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Credit Filters */}
                            <div>
                                <h4 className="font-semibold text-sm mb-3">Credits</h4>
                                <div className="space-y-2">
                                    {availableFilters.credits.map(credit => (
                                        <Button
                                            key={credit.value}
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start text-sm font-normal"
                                            onClick={() => handleAddFilter(credit)}
                                        >
                                            <Plus className="h-2 w-2 mr-1" />
                                            {credit.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Level Filters */}
                            <div>
                                <h4 className="font-semibold text-sm mb-3">Level</h4>
                                <div className="space-y-2">
                                    {availableFilters.levels.map(level => (
                                        <Button
                                            key={level.value}
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start text-sm font-normal"
                                            onClick={() => handleAddFilter(level)}
                                        >
                                            <Plus className="h-2 w-2 mr-1" />
                                            {level.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Semester Filters */}
                            <div>
                                <h4 className="font-semibold text-sm mb-3">Semester</h4>
                                <div className="space-y-2">
                                    {availableFilters.semesters?.map(semester => (
                                        <Button
                                            key={semester.value}
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start text-sm font-normal"
                                            onClick={() => handleAddFilter(semester)}
                                        >
                                            <Plus className="h-2 w-2 mr-1" />
                                            {semester.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Actions */}
                            <div className="flex-shrink-0 border-t p-6">
                                <div className="flex gap-2">
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleApplyFilters}
                                        className="flex-1"
                                    >
                                        Apply Filters
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="flex-1"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Search Results - Only show when filter panel is closed */}
                {!showFilters && (
                    <div className="flex-1 overflow-y-auto mt-6">
                        {displayCourses.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                <Search className="h-12 w-12 mx-auto mb-4 opacity-50"/>
                                {searchQuery.trim() || activeFilters.length > 0 ? (
                                    <>
                                        <p>No courses found</p>
                                        <p className="text-sm mt-2">
                                            {searchQuery.trim() 
                                                ? `for "${searchQuery}"${activeFilters.length > 0 ? ' with current filters' : ''}`
                                                : 'with current filters'
                                            }
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p>Enter a course code or name to search</p>
                                        <p className="text-sm mt-2">Or add filters to browse courses</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-muted-foreground">
                                    Found {displayCourses.length} course{displayCourses.length !== 1 ? 's' : ''}
                                </h3>
                                {displayCourses.map((course) => (
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
                                                </div>
                                                <div className="flex flex-col items-end text-xs text-muted-foreground">
                                                    <span>{course.credits} credit{course.credits !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </div>
    );
}
