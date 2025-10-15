"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { CourseDiagram } from '@/components/course-diagram';
import { CourseDetailSidebar } from '@/components/course-detail-sidebar';
import { CourseSearchSidebar } from '@/components/course-search-sidebar';
import type { Course } from '@/lib/mock-data';
import { useCourses } from '@/hooks/use-courses';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelRight, Search, BookOpen } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Define the possible states for the sidebar
type SidebarMode = 'details' | 'search' | 'closed';

// Local type for the diagram to avoid type conflicts
interface DiagramCourse {
    id: string;
    subject: string;
    number: string;
    code: string;
    title: string;
    fullTitle?: string;
    requisitesDisplay?: string;
}

export default function Home() {
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
    const [sidebarMode, setSidebarMode] = useState<SidebarMode>('details');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const isMobile = useIsMobile();
    const { courses, isLoading } = useCourses();

    // state to check if sidebar is currently visible
    const isSidebarVisible = sidebarMode !== 'closed';

    // Convert courses to match the JSONCourse format expected by the diagram
    const diagramCourses = useMemo(() => {
        if (!courses || courses.length === 0) return undefined;

        return courses.map(course => {
            const [subject = '', number = ''] = course.code.split('*');

            // Handle prerequisites - safely convert to string for diagram display
            let requisitesDisplay = '';
            if (Array.isArray(course.prerequisites)) {
                // If it's a string array, join it
                requisitesDisplay = course.prerequisites.join(' ; ');
            } else if (course.prerequisites && typeof course.prerequisites === 'object' && 'type' in course.prerequisites) {
                // If it's a PrerequisiteGroup, extract course codes
                const extractCourseCodes = (prereq: any): string[] => {
                    if (typeof prereq === 'string') return [prereq];
                    if (prereq && typeof prereq === 'object' && 'courses' in prereq) {
                        return prereq.courses.flatMap(extractCourseCodes);
                    }
                    return [];
                };

                const courseCodes = extractCourseCodes(course.prerequisites);
                requisitesDisplay = courseCodes.join(' ; ');
            }
            // If it's an empty object {}, requisitesDisplay remains empty

            return {
                id: course.code || course.id,
                subject,
                number,
                code: course.code,
                title: course.title,
                fullTitle: course.description,
                requisitesDisplay
            } as DiagramCourse;
        });
    }, [courses]);

    useEffect(() => {
        if (isMobile) {
            setSidebarMode('closed');
        } else {
            setSidebarMode('details');
        }
    }, [isMobile]);

    const handleNodeClick = (course: any) => {
        setSelectedCourse(course);
        setSidebarMode('details');
        if (!isSidebarVisible && isMobile) {
            setSidebarMode('details');
        }
    };

    // Fixed: Always close the sidebar
    const handleCloseSidebar = () => {
        setSidebarMode('closed');
    };

    // Toggle sidebar open/closed
    const handleToggleSidebar = () => {
        setSidebarMode(isSidebarVisible ? 'closed' : 'details');
    };

    // Switch to course details mode
    const handleDetailsMode = () => {
        setSidebarMode('details');
    };

    // Switch to search mode and clear any selected course
    const handleSearchMode = () => {
        setSidebarMode('search');
        setSelectedCourse(null);
    };

    const handleCourseSelectFromSearch = (course: Course) => {
        // Pass the course code as string ID to match course_data_full.json keys
        setSelectedCourse(course.code || course.id);
        setSidebarMode('details');
    };

    // Render sidebar content based on current mode
    const sidebarContent = (
        <>
            {sidebarMode === 'details' && (
                <CourseDetailSidebar
                    course={selectedCourse}
                    allCourses={courses}
                    onClose={handleCloseSidebar}
                />
            )}
            {sidebarMode === 'search' && (
                <CourseSearchSidebar
                    onClose={handleCloseSidebar}
                    onCourseSelect={handleCourseSelectFromSearch}
                    courses={courses}
                />
            )}
        </>
    );

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-lg font-semibold">Loading Courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
            <header className="absolute top-0 left-0 z-20 p-4 w-full flex justify-between items-center pointer-events-none">
                <div className="bg-background/80 backdrop-blur-sm p-2 px-4 rounded-lg pointer-events-auto shadow-sm border flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-primary font-headline">CourseFlow</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">Subject:</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="select select-sm bg-input text-foreground border-border">
                            <option value="">All subjects</option>
                            {/* build unique subject list from diagramCourses */}
                            {Array.from(new Set((diagramCourses || []).map(c => c.subject))).filter(Boolean).sort().map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>
            <main className="flex-1 relative h-full">
                <CourseDiagram onNodeClick={handleNodeClick} courses={diagramCourses} selectedSubject={selectedSubject} onSubjectChange={setSelectedSubject} />
            </main>

            {/* Sidebar toggle buttons- position relative to main container*/}
            <div className={cn(
                "absolute right-0 top-6 z-30 flex items-start gap-2 transition-all duration-300",
                isSidebarVisible ? "right-96" : "right-5"
            )}>
                {/* Theme toggle sits left of the main details toggle and moves with the whole control group */}
                <div className="flex items-center">
                    <div className="mr-2">
                        <ThemeToggle />
                    </div>
                </div>
                {/* Main toggle button- always visible*/}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleSidebar}
                    className={cn("h-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border flex items-center gap-3 transition-all", isSidebarVisible ? "px-3" : "px-4")}
                    aria-label={isSidebarVisible ? "Hide sidebar" : "Show details sidebar"}
                >
                    {isSidebarVisible ? (
                        <>
                            <PanelRight className="h-4 w-4" />
                            <span>Hide</span>
                        </>
                    ) : (
                        <>
                            <BookOpen className="h-4 w-4" />
                            <span>Details</span>
                        </>
                    )}
                </Button>

                {/* Mode buttons - only visible when sidebar open */}
                {isSidebarVisible && (
                    <div className="flex flex-col items-end gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleDetailsMode}
                            className={cn(
                                "h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border transition-colors",
                                sidebarMode === 'details' && "bg-accent text-accent-foreground"
                            )}
                            aria-label="Show course details"
                        >
                            <BookOpen className="h-5 w-5" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSearchMode}
                            className={cn(
                                "h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border transition-colors",
                                sidebarMode === 'search' && "bg-accent text-accent-foreground"
                            )}
                            aria-label="Search courses"
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>

            {isMobile ? (
                <Sheet open={isSidebarVisible} onOpenChange={(open) => setSidebarMode(open ? sidebarMode : 'closed')}>
                    <SheetContent className="w-[85vw] p-0 border-l" side="right">
                        {sidebarContent}
                    </SheetContent>
                </Sheet>
            ) : (
                <aside
                    className={cn(
                        "h-full flex-shrink-0 bg-card border-l transition-all duration-300 ease-in-out relative",
                        isSidebarVisible ? "w-96" : "w-0 border-l-0"
                    )}
                >
                    <div className={cn(
                        "h-full overflow-hidden transition-opacity duration-300",
                        isSidebarVisible ? "w-96 opacity-100" : "w-0 opacity-0"
                    )}>
                        {sidebarContent}
                    </div>
                </aside>
            )}
        </div>
    );
}