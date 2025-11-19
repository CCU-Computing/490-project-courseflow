import React from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, BookOpen, Star } from 'lucide-react';
import { getRawCourse, buildPrereqTree, PrereqNode, getPrereqIds, parsePrereqDisplay } from '@/lib/course-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

interface CourseDetailSidebarProps {
    // Accept either the app's Course object or a string id like 'ACCT*330'
    course: any | null;
    allCourses?: any[];
    onClose: () => void;
    onAddCourse: (courseCode: string, term:string) => void;
}

const PrerequisiteChip: React.FC<{ id: string }> = ({ id }) => {
    const raw = getRawCourse(id);
    const title = raw ? (raw.Title || raw.FullTitleDisplay || raw.CourseTitleDisplay) : id;
    return (
        <div className="px-3 py-1 rounded-md border bg-background/60 text-sm flex items-center gap-2">
            <div className="font-semibold">{id}</div>
            <div className="text-xs text-muted-foreground">{title}</div>
        </div>
    );
};

// NEW: A more robust PrerequisiteGroupView component
const PrerequisiteGroupView: React.FC<{ group: any; allCourses?: any[]; level?: number }> = ({ group, allCourses, level = 0 }) => {
    // guard
    if (!group) return null;

    // If group is a string or has DisplayText, attempt to parse ids
    if (typeof group === 'string') {
        const ids = getPrereqIds(group);
        const type = /\bAND\b/i.test(group) ? 'and' : (/\bOR\b/i.test(group) ? 'or' : 'and');
        return (
            <div className="rounded-md border bg-muted/20 p-3">
                <div className="text-xs font-semibold mb-2">{type.toUpperCase()}</div>
                <div className="flex flex-wrap gap-2">{ids.map(id => <PrerequisiteChip key={id} id={id} />)}</div>
            </div>
        );
    }

    // Expect object with type and courses (array)
    const type = (group.type || 'and').toLowerCase();
    const header = type === 'or' ? 'OR' : 'AND';

    return (
        <div className={`rounded-md border bg-muted/20 p-3 ${level > 0 ? 'ml-4' : ''}`}>
            <div className="text-xs font-semibold mb-2">{header}</div>
            <div className="flex flex-wrap gap-2">
                {Array.isArray(group.courses) ? group.courses.map((p: any, i: number) => (
                    <div key={i}>
                        {typeof p === 'string' ? <PrerequisiteChip id={p} /> : <PrerequisiteGroupView group={p} allCourses={allCourses} level={level + 1} />}
                    </div>
                )) : null}
            </div>
        </div> 
    );
};

// NEW: A more robust PrerequisiteView component
const PrerequisiteView: React.FC<{ prerequisites: any; allCourses?: any[] }> = ({ prerequisites, allCourses }) => {
    if (!prerequisites) return <p className="text-muted-foreground italic p-3 rounded-md bg-muted/50 text-center">No prerequisites available.</p>;

    // If it's a structured group (object with type & courses) or an array
    if (typeof prerequisites === 'object' && ('type' in prerequisites || Array.isArray(prerequisites))) {
        // normalize to group object
        const group = Array.isArray(prerequisites) ? { type: 'and', courses: prerequisites } : prerequisites;
        return <PrerequisiteGroupView group={group} allCourses={allCourses} />;
    }

    // Fallback: parse display text string into logical groups
    if (typeof prerequisites === 'string') {
        const parsed = parsePrereqDisplay(prerequisites);
        if (parsed) return <PrerequisiteGroupView group={parsed} allCourses={allCourses} />;
        // otherwise fall back to raw string parse
        return <PrerequisiteGroupView group={prerequisites} allCourses={allCourses} />;
    }

    return <p className="text-muted-foreground italic p-3 rounded-md bg-muted/50 text-center">No prerequisites available.</p>;
};



function AddCourseDialog({
  open,
  onClose,
  onConfirm,
  allowedTerms
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (term: string) => void;
  allowedTerms: string[];
}) {
  const [term, setTerm] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Select Semester</DialogTitle>
        </DialogHeader>
        <select
          className="border rounded p-2 w-full"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        >
        <option value="">Select term</option>
        <option value="Fall 2025" disabled={!allowedTerms.includes("Fall")}>
            Fall 2025
        </option>

        <option value="Spring 2026" disabled={!allowedTerms.includes("Spring")}>
            Spring 2026
        </option>

        <option value="Summer 2026" disabled={!allowedTerms.includes("Summer")}>
            Summer 2026
        </option>

        <option value="Fall 2026" disabled={!allowedTerms.includes("Fall")}>
            Fall 2026
        </option>
        </select>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
                if (!term) return;
                
                // Prevent adding invalid terms
                const normalized = term.toLowerCase();
                const valid = allowedTerms.some(t => normalized.includes(t.toLowerCase()));

                if (!valid) {
                alert("This course is not offered in that term.");
                return;
                }

                onConfirm(term);
                onClose();
            }}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function parseOfferedTerms(termsOffered: string | null | undefined): string[] {
  if (!termsOffered) return [];

  const lower = termsOffered.toLowerCase();

  if (lower.includes("all years")) {
    return ["Fall", "Spring", "Summer"];
  }

  const terms: string[] = [];
  if (lower.includes("fall")) terms.push("Fall");
  if (lower.includes("spring")) terms.push("Spring");
  if (lower.includes("summer")) terms.push("Summer");

  return terms;
}



export function CourseDetailSidebar({ course, allCourses, onClose, onAddCourse }: CourseDetailSidebarProps) {
    // Course may be a Course object, or a string key like 'ACCT*330', or null
    const [dialogOpen, setDialogOpen] = useState(false);
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

    const allowedTerms = parseOfferedTerms(raw.TermsOffered);
    const courseId =
        typeof course === "string"
            ? course
            : course.code || course.id;


    // Prefer raw display text for prerequisites (so we can parse AND/OR correctly), otherwise build tree
    const displayTexts: string[] = Array.isArray(raw.CourseRequisites)
        ? raw.CourseRequisites.map((r: any) => r.DisplayText).filter(Boolean)
        : raw.CourseRequisites && raw.CourseRequisites.DisplayText ? [raw.CourseRequisites.DisplayText] : [];
    const combinedDisplay = displayTexts.join(' ; ');
    const prereqTree = combinedDisplay ? combinedDisplay : (buildPrereqTree(raw.CourseTitleDisplay ? raw.CourseTitleDisplay : raw.CourseTitleDisplay || raw.CourseTitleDisplay || raw.CourseTitleDisplay));

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
                                    {typeof prereqTree === 'string' ? (
                                        // raw display text — let the PrerequisiteView parse it into AND/OR groups
                                        <PrerequisiteView prerequisites={prereqTree} allCourses={allCourses} />
                                    ) : (
                                        // built tree object
                                        (() => {
                                            const children = (prereqTree as PrereqNode).children || [];
                                            if (children.length === 0) {
                                                return <p className="text-muted-foreground italic p-3 rounded-md bg-muted/50 text-center">No prerequisites for this course.</p>;
                                            }
                                            if (children.length === 1) {
                                                return (
                                                    <div className="rounded-md border bg-muted/20 p-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            <PrerequisiteChip id={children[0].code} />
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return <PrerequisiteView prerequisites={children.map((c: PrereqNode) => c.code)} allCourses={allCourses} />;
                                        })()
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
                    
                    <Button
                    className="mt-3 bg-primary text-white hover:bg-primary/90"
                    onClick={() => setDialogOpen(true)}
                    >
                    Add Course
                    </Button>

                    <AddCourseDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    allowedTerms={allowedTerms}
                    onConfirm={(term) => onAddCourse(courseId, term)}
                    />

                </div>
            </CardContent>
        </div>
    );
}