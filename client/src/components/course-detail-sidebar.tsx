import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, BookOpen, Star, ChevronsRight } from 'lucide-react';
import type { Course, PrerequisiteGroup, Prerequisites } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
 
interface CourseDetailSidebarProps {
  course: Course | null;
  allCourses: Course[];
  onClose: () => void;
}
 
const PrerequisiteItem: React.FC<{ course: Course }> = ({ course }) => (
<div className="flex items-center gap-3 p-3 rounded-md border bg-muted/50">
<ChevronsRight className="h-4 w-4 text-primary flex-shrink-0" />
<div>
<p className="font-medium">{course.code}</p>
<p className="text-sm text-muted-foreground">{course.title}</p>
</div>
</div>
);
 
// NEW: A more robust PrerequisiteGroupView component
const PrerequisiteGroupView: React.FC<{ group: PrerequisiteGroup; allCourses: Course[] }> = ({ group, allCourses }) => {
  // This guard clause prevents crashes if the 'courses' array is missing.
  if (!Array.isArray(group.courses)) {
    return null; // Don't render anything if the data is malformed
  }
 
  const description = group.type === 'or' ? 'One of the following is required:' : 'All of the following are required:';
 
  return (
<div className="relative rounded-lg border bg-muted/20 p-4">
<p className="text-sm font-semibold text-muted-foreground mb-3">{description}</p>
<div className="space-y-3">
        {group.courses.map((prereq, index) => (
<React.Fragment key={index}>
            {typeof prereq === 'string' ? (
              (() => {
                const course = allCourses.find(c => c.id === prereq);
                return course ? <PrerequisiteItem course={course} /> : null;
              })()
            ) : (
              // Ensure nested groups are also valid before rendering
<PrerequisiteGroupView group={prereq as PrerequisiteGroup} allCourses={allCourses} />
            )}
</React.Fragment>
        ))}
</div>
</div>
  );
};
 
// NEW: A more robust PrerequisiteView component
const PrerequisiteView: React.FC<{ prerequisites: Prerequisites; allCourses: Course[] }> = ({ prerequisites, allCourses }) => {
  // This check is now safer. It ensures 'prerequisites' is a valid object
  // with both 'type' and 'courses' properties before trying to render it as a group.
  const isPrereqGroup = (p: Prerequisites): p is PrerequisiteGroup => {
    return p != null && typeof p === 'object' && 'type' in p && 'courses' in p && Array.isArray((p as PrerequisiteGroup).courses);
  };
 
  if (!isPrereqGroup(prerequisites)) {
    return <p className="text-muted-foreground italic p-3 rounded-md bg-muted/50 text-center">No prerequisites for this course.</p>;
  }
 
  return <PrerequisiteGroupView group={prerequisites} allCourses={allCourses} />;
};
 
 
export function CourseDetailSidebar({ course, allCourses, onClose }: CourseDetailSidebarProps) {
  if (!course) {
    return (
<div className="w-full h-full p-8 flex flex-col items-center justify-center text-center bg-card rounded-lg">
<div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-xl">
<BookOpen className="h-16 w-16 text-muted-foreground" />
<h3 className="text-xl font-semibold text-foreground font-headline">Select a Course</h3>
<p className="text-muted-foreground max-w-xs">Click on any course in the diagram to see its details here.</p>
</div>
</div>
    );
  }
  return (
<div className="flex flex-col h-full bg-card">
<CardHeader className="relative p-6 border-b">
<Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 md:hidden"
          onClick={onClose}
          aria-label="Close course details"
>
<X className="h-4 w-4" />
</Button>
<CardTitle className="text-2xl font-bold text-primary pr-10 font-headline">{course.title}</CardTitle>
<CardDescription>{course.code}</CardDescription>
</CardHeader>
<CardContent className="flex-grow p-6 pt-4 overflow-y-auto">
<div className="space-y-6">
<div>
<h4 className="font-semibold text-lg mb-2 font-headline">Description</h4>
<p className="text-muted-foreground leading-relaxed">{course.description}</p>
</div>
<div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
<div className="flex items-center gap-3">
<Star className="h-5 w-5 text-accent fill-accent" />
<span className="font-semibold text-secondary-foreground">Credits</span>
</div>
<Badge variant="outline" className="text-lg bg-background">{course.credits}</Badge>
</div>
 
          <div>
<h4 className="font-semibold text-lg mb-3 font-headline">Prerequisites</h4>
<div className="space-y-4">
<PrerequisiteView prerequisites={course.prerequisites} allCourses={allCourses} />
</div>
</div>
 
          <div>
<h4 className="font-semibold text-lg mb-2 font-headline">Semesters Offered</h4>
<div className="flex flex-wrap gap-2">
              {course.semesters_offered.map(semester => (
<Badge key={semester} variant="secondary">{semester}</Badge>
              ))}
</div>
</div>
</div>
</CardContent>
</div>
  );
}