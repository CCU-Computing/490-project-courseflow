"use client";

import React, { useState, useEffect } from 'react';
import { CourseDiagram } from '@/components/course-diagram';
import { CourseDetailSidebar } from '@/components/course-detail-sidebar';
import type { Course } from '@/lib/mock-data';
import { computerScienceProgram } from '@/lib/mock-data';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PanelLeft, PanelRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function Home() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      setIsSidebarVisible(false);
    } else {
      setIsSidebarVisible(true);
    }
  }, [isMobile]);

  const handleNodeClick = (course: Course) => {
    setSelectedCourse(course);
    if (!isSidebarVisible) {
      setIsSidebarVisible(true);
    }
  };

  const handleCloseSidebar = () => {
    if(isMobile) {
      setIsSidebarVisible(false);
    }
    setSelectedCourse(null);
  };

  const handleToggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  }

  const sidebarContent = (
    <CourseDetailSidebar
      course={selectedCourse}
      allCourses={computerScienceProgram.courses}
      onClose={handleCloseSidebar}
    />
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
        {!isSidebarVisible && !isMobile && (
          <Button
            variant="outline"
            className="absolute top-6 right-6 z-10 shadow-lg pointer-events-auto"
            onClick={handleToggleSidebar}
            aria-label="Show details panel"
          >
            <PanelLeft className="h-5 w-5 mr-2" />
            <span>Details</span>
          </Button>
        )}
      </main>

      {isMobile ? (
        <Sheet open={isSidebarVisible} onOpenChange={setIsSidebarVisible}>
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
          {isSidebarVisible && (
            <Button
              variant="outline"
              size="icon"
              className="absolute top-6 -left-5 z-10 h-10 w-10 rounded-full shadow-lg"
              onClick={handleToggleSidebar}
              aria-label="Hide details panel"
            >
              <PanelRight className="h-5 w-5" />
            </Button>
          )}
          <div className="w-96 h-full overflow-hidden">
             {sidebarContent}
          </div>
        </aside>
      )}
    </div>
  );
}
