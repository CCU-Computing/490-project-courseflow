import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, BookOpen, Star, ChevronsRight } from 'lucide-react';
import { getRawCourse, buildPrereqTree, PrereqNode } from '@/lib/course-utils';
import { cn } from '@/lib/utils';

interface CourseDetailSidebarProps {
    // Accept either the app's Course object or a string id like 'ACCT*330'
    course: any | null;
    allCourses?: any[];
    onClose: () => void;
}

const PrerequisiteItem: React.FC<{ node: PrereqNode }> = ({ node }) => (
    <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/50">
        <ChevronsRight className="h-4 w-4 text-primary flex-shrink-0" />
        <div>
            <p className="font-medium">{node.code}</p>
            <p className="text-sm text-muted-foreground">{node.title}</p>
        </div>
    </div>
);

// NEW: A more robust PrerequisiteGroupView component
const PrerequisiteGroupView: React.FC<{ group: any; allCourses?: any[] }> = ({ group, allCourses }) => {
    // This guard clause prevents crashes if the 'courses' array is missing.
    if (!Array.isArray(group.courses)) {
        return null; // Don't render anything if the data is malformed
    }

    const description = group.type === 'or' ? 'One of the following is required:' : 'All of the following are required:';

    return (
        <div className="relative rounded-lg border bg-muted/20 p-4">
            <p className="text-sm font-semibold text-muted-foreground mb-3">{description}</p>
            <div className="space-y-3">
                {group.courses.map((prereq: any, index: number) => (
                    <React.Fragment key={index}>
                        {typeof prereq === 'string' ? (
                            (() => {
                                const raw = getRawCourse(prereq);
                                const node: PrereqNode | null = raw ? { id: prereq, code: prereq, title: raw.Title || raw.FullTitleDisplay || raw.CourseTitleDisplay, children: [] } : null;
                                return node ? <PrerequisiteItem node={node} /> : null;
                            })()
                        ) : (
                            <PrerequisiteGroupView group={prereq} allCourses={allCourses} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

// NEW: A more robust PrerequisiteView component
const PrerequisiteView: React.FC<{ prerequisites: any; allCourses?: any[] }> = ({ prerequisites, allCourses }) => {
    const isPrereqGroup = (p: any): p is any => {
        return p != null && typeof p === 'object' && 'type' in p && 'courses' in p && Array.isArray((p as any).courses);
    };

    if (!prerequisites) return <p className="text-muted-foreground italic p-3 rounded-md bg-muted/50 text-center">No prerequisites available.</p>;
    if (!isPrereqGroup(prerequisites)) {
        // If it's not structured, try to parse display text
        const rawText = typeof prerequisites === 'string' ? prerequisites : '';
        if (!rawText) return <p className="text-muted-foreground italic p-3 rounded-md bg-muted/50 text-center">No prerequisites for this course.</p>;
        // render parsed ids
        const ids = ([] as string[]); // nothing here without raw mapping
        return <p className="text-muted-foreground italic p-3 rounded-md bg-muted/50 text-center">{rawText}</p>;
    }

    return <PrerequisiteGroupView group={prerequisites} allCourses={allCourses} />;
};


export function CourseDetailSidebar({ course, allCourses, onClose }: CourseDetailSidebarProps) {
    // Course may be a Course object, or a string key like 'ACCT*330', or null
    let raw: any | null = null;
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

    // If course is a string id, load raw JSON; if it's an object, try to map fields
    if (typeof course === 'string') {
        raw = getRawCourse(course);
    } else if (course && typeof course === 'object') {
        // attempt to use an id field from the object
        raw = getRawCourse(course.id) || course;
    }

    if (!raw) {
        return (
            <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center bg-card rounded-lg">
                <div className="flex flex-col items-center gap-4 p-8 border-2 border-dashed rounded-xl">
                    <h3 className="text-xl font-semibold text-foreground font-headline">Course not found</h3>
                    <p className="text-muted-foreground max-w-xs">Details for the selected course are not available in the dataset.</p>
                </div>
            </div>
        );
    }

    // Build a readable prerequisite tree
    const prereqTree = buildPrereqTree(raw.CourseTitleDisplay ? raw.CourseTitleDisplay : raw.CourseTitleDisplay || raw.CourseTitleDisplay || raw.CourseTitleDisplay);

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
                <CardTitle className="text-2xl font-bold text-primary pr-10 font-headline">{raw.Title || raw.FullTitleDisplay || raw.CourseTitleDisplay}</CardTitle>
                <CardDescription>{raw.CourseTitleDisplay || raw.CourseCode || raw.Number}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-4 overflow-y-auto">
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg mb-2 font-headline">Description</h4>
                        <p className="text-muted-foreground leading-relaxed">{raw.Description || raw.DescriptionDisplay || raw.FullTitleDisplay}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                        <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-accent fill-accent" />
                            <span className="font-semibold text-secondary-foreground">Credits</span>
                        </div>
                        <Badge variant="outline" className="text-lg bg-background">{raw.CreditsCeusDisplay || raw.MinimumCredits || raw.CreditsDisplay}</Badge>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-3 font-headline">Prerequisites</h4>
                        <div className="space-y-4">
                            {prereqTree ? (
                                <div className="space-y-2">
                                    <PrerequisiteItem node={prereqTree} />
                                    {prereqTree.children.length > 0 && (
                                        <div className="ml-6 border-l pl-4">
                                            {prereqTree.children.map(child => (
                                                <div key={child.id} className="mb-2">
                                                    <PrerequisiteItem node={child} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic p-3 rounded-md bg-muted/50 text-center">No prerequisites available.</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-2 font-headline">Semesters Offered</h4>
                        <div className="text-muted-foreground">{raw.TermsOffered || raw.TermsAndSections || 'All Years'}</div>
                    </div>
                </div>
            </CardContent>
        </div>
    );
}