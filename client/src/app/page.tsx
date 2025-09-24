"use client";

import React, { useState, useEffect } from 'react';
import { CourseDiagram } from '@/components/course-diagram';
import { CourseDetailSidebar } from '@/components/course-detail-sidebar';
import { CourseSearchSidebar } from '@/components/course-search-sidebar';
import type { Course } from '@/lib/mock-data';
import { computerScienceProgram } from '@/lib/mock-data';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelRight, Search, BookOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Define the possible states for the sidebar
type SidebarMode = 'details' | 'search' | 'closed';

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('details');
  const isMobile = useIsMobile();

  // state to check if sidebar is currently visible
  const isSidebarVisible = sidebarMode !== 'closed';

  useEffect(() => {
    if (isMobile) {
      setSidebarMode('closed'); // Hide sidebar on mobile by default
    } else {
      setSidebarMode('details'); // Show details sidebar on desktop
    }
  }, [isMobile]);

  const handleNodeClick = (course: Course) => {
    setSelectedCourse(course);
    setSidebarMode('details'); // Switch to details view
    if (!isSidebarVisible && isMobile) {
      setSidebarMode('details'); // Auto-open sidebar on mobile when selecting a course
    }
  };

  const handleCloseSidebar = () => {
    if(isMobile) {
      setSidebarMode('closed');
    }
    setSelectedCourse(null);
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

  // Render sidebar content based on current mode
  const sidebarContent = (
    <>
      {sidebarMode === 'details' && (
        <CourseDetailSidebar
          course={selectedCourse}
          allCourses={computerScienceProgram.courses}
          onClose={handleCloseSidebar}
        />
      )}
      {sidebarMode === 'search' && (
        <CourseSearchSidebar onClose={handleCloseSidebar} />
      )}
    </>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <header className="absolute top-0 left-0 z-20 p-4 w-full flex justify-between items-center pointer-events-none">
        <div className="bg-background/80 backdrop-blur-sm p-2 px-4 rounded-lg pointer-events-auto shadow-sm border">
            <h1 className="text-xl font-bold text-primary font-headline">CourseFlow</h1>
            <p className="text-sm text-muted-foreground">{computerScienceProgram.name}</p>
        </div>
      </header>
      <main className="flex-1 relative h-full">
        <CourseDiagram onNodeClick={handleNodeClick} />
      </main>

      {/* Sidebar toggle buttons- position relative to main container*/}
      <div className={cn(
        "absolute right-0 top-6 z-30 flex flex-col gap-2 transition-all duration-300",
        isSidebarVisible ? "right-96" : "right-0"
      )}>
        {/* Main toggle button- always visible*/}
        <Button
          variant="outline"
          size="icon"
          onClick={handleToggleSidebar}
          className="h-10 w-10 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border"
          aria-label={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
        >
          {isSidebarVisible ? (
            <PanelRight className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </Button>

        {/* Mode buttons - only visible when sidebar open */}
        {isSidebarVisible && (
          <>
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
          </>
        )}
      </div>

      {isMobile ? (
        <Sheet open={isSidebarVisible} onOpenChange={(open) => setSidebarMode(open ? 'details' : 'closed')}>
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
