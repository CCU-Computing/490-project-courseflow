"use client";

import React, { useMemo, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    type Node,
    type Edge,
    BackgroundVariant,
    type XYPosition,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './custom-node';
// Use the pre-built course JSON dataset
import rawCourseData from '../../data/course_data_full.json';

// Minimal local course shape (mapped from JSON). We don't import the project's Course type
// because the JSON has a different shape. We keep node.data lightweight and consistent.
type JSONCourse = {
    id: string; // like 'ACCT*330'
    subject: string; // 'ACCT'
    number: string; // '330' or '101L'
    code?: string; // same as id but convenient for node data
    title?: string;
    fullTitle?: string;
    requisitesDisplay?: string; // concatenation of CourseRequisites DisplayText
};

const nodeTypes = {
    custom: CustomNode,
};

const NODE_WIDTH = 180;
const NODE_HEIGHT = 72;
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 100;

interface CourseDiagramProps {
    onNodeClick: (course: JSONCourse) => void;
    // If 'courses' prop is provided, use it; otherwise the component will use the imported JSON data.
    courses?: JSONCourse[];
}

// Parse prerequisite course ids from a free-form DisplayText string.
// Example DisplayText: "Student must have completed ACCT*330 and FIN*301."
const getPrereqIds = (displayText?: string): string[] => {
    if (!displayText || typeof displayText !== 'string') return [];
    // Normalize common connectors and separators to make parsing easier
    let txt = displayText
        // unify separators
        .replace(/[,;()]/g, ' ')
        // convert slashes to 'or'
        .replace(/\//g, ' or ')
        // normalize common words (case-insensitive after uppercasing)
        .replace(/\bAND\b/gi, ' OR ')
        .replace(/\bOR\b/gi, ' OR ')
        // remove extra punctuation
        .replace(/[\.\:\-\u2013\u2014]/g, ' ')
        .toUpperCase();

    // Common patterns we want to capture: SUBJECT*123, SUBJECT 123, SUBJECT123, SUBJECT*123L
    const regex = /([A-Z]{2,6})\s?\*?\s?(\d{2,3}[A-Z]?)/g;
    const ids: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(txt)) !== null) {
        const subject = m[1].trim();
        const number = m[2].trim();
        // Normalize to the course id key format used in the JSON (e.g. ACCT*330)
        ids.push(`${subject}*${number}`);
    }

    // Deduplicate while preserving order
    return Array.from(new Set(ids));
};

export function CourseDiagram({ onNodeClick, courses }: CourseDiagramProps) {
    const [selectedSubject, setSelectedSubject] = useState('');

    // Build a list of JSONCourse from either the provided prop or from the imported data
    const allCourses: JSONCourse[] = useMemo(() => {
        if (courses && courses.length > 0) return courses;
        const entries = Object.entries(rawCourseData) as [string, any][];
        return entries.map(([key, val]) => ({
            id: key,
            subject: val.SubjectCode || key.split('*')[0],
            number: val.Number || key.split('*')[1] || '',
            code: key,
            title: val.Title || val.FullTitleDisplay || val.CourseTitleDisplay,
            fullTitle: val.FullTitleDisplay,
            requisitesDisplay: Array.isArray(val.CourseRequisites)
                ? val.CourseRequisites.map((r: any) => r.DisplayText).join(' ; ')
                : undefined,
        }));
    }, [courses]);

    // All courses map for quick lookup
    const allCoursesMap = useMemo(() => new Map(allCourses.map(c => [c.id, c])), [allCourses]);

    // Unique subjects for dropdown
    const uniqueSubjects = useMemo(() => {
        const s = Array.from(new Set(allCourses.map(c => c.subject))).filter(Boolean) as string[];
        return s.sort((a, b) => a.localeCompare(b));
    }, [allCourses]);

    // When a subject is selected, include its courses and recursively include any prerequisites
    const filteredCourses = useMemo(() => {
        const subj = selectedSubject.trim().toUpperCase();
        if (!subj) return [];

        const initial = allCourses.filter(c => (c.subject || '').toUpperCase() === subj);
        const expandedMap = new Map<string, JSONCourse>();

        // add a course and recursively its prereqs
        const addWithPrereqs = (course: JSONCourse) => {
            if (expandedMap.has(course.id)) return;
            expandedMap.set(course.id, course);
            const prereqIds = getPrereqIds(course.requisitesDisplay);
            prereqIds.forEach(pid => {
                const p = allCoursesMap.get(pid);
                if (p) addWithPrereqs(p);
            });
        };

        initial.forEach(c => addWithPrereqs(c));

        return Array.from(expandedMap.values());
    }, [allCourses, allCoursesMap, selectedSubject]);

    const { nodes, edges } = useMemo(() => {
        if (!filteredCourses || filteredCourses.length === 0) {
            return { nodes: [], edges: [] };
        }
        const courseMap = new Map(filteredCourses.map(c => [c.id, c]));

        // Exclude 500 and 600 level courses
        const filtered = filteredCourses.filter(c => {
            const numMatch = (c.number || '').match(/(\d{2,3})/);
            const n = numMatch ? parseInt(numMatch[1], 10) : 0;
            return !(n >= 500 && n < 700);
        });

        // Build adjacency and in-degree for topological ordering (on the filtered set)
        const adj: Record<string, string[]> = {};
        const inDegree: Record<string, number> = {};
        filtered.forEach(c => {
            adj[c.id] = [];
            inDegree[c.id] = 0;
        });

        filtered.forEach(course => {
            const prereqs = getPrereqIds(course.requisitesDisplay);
            prereqs.forEach(prereqId => {
                if (adj[prereqId] !== undefined) {
                    // prereq -> course
                    adj[prereqId].push(course.id);
                    inDegree[course.id]++;
                }
            });
        });

        // Kahn's algorithm to compute topological levels (prereqs above dependents)
        const queue: string[] = [];
        Object.keys(inDegree).forEach(k => {
            if (inDegree[k] === 0) queue.push(k);
        });

        const levels: Record<number, string[]> = {};
        let levelIdx = 0;
        while (queue.length > 0) {
            const size = queue.length;
            levels[levelIdx] = [];
            for (let i = 0; i < size; i++) {
                const u = queue.shift()!;
                levels[levelIdx].push(u);
                adj[u].forEach(v => {
                    inDegree[v]--;
                    if (inDegree[v] === 0) queue.push(v);
                });
            }
            levelIdx++;
        }

        // Any remaining nodes (cycles) go to next level
        const topoIncluded = new Set(Object.values(levels).flat());
        const remaining = filtered.map(c => c.id).filter(k => !topoIncluded.has(k));
        if (remaining.length > 0) {
            levels[levelIdx] = remaining;
        }

        // Compute topoLevel map
        const topoLevel: Record<string, number> = {};
        Object.entries(levels).forEach(([k, arr]) => {
            const idx = parseInt(k, 10);
            arr.forEach(id => { topoLevel[id] = idx; });
        });

        // Compute numeric bucket index (100->0,200->1...) and final level: max(topoLevel, bucketIndex)
        const finalLevelMap: Record<string, number> = {};
        filtered.forEach(c => {
            const numMatch = (c.number || '').match(/(\d{2,3})/);
            const n = numMatch ? parseInt(numMatch[1], 10) : 100;
            const bucketIndex = Math.max(0, Math.floor(n / 100) - 1); // 100->0,200->1
            const t = topoLevel[c.id] ?? 0;
            finalLevelMap[c.id] = Math.max(t, bucketIndex);
        });

        // Build levels by finalLevelMap
        const finalLevels: Record<number, string[]> = {};
        Object.keys(finalLevelMap).forEach(id => {
            const lvl = finalLevelMap[id];
            if (!finalLevels[lvl]) finalLevels[lvl] = [];
            finalLevels[lvl].push(id);
        });

        // Sort within each final level by numeric then id
        Object.keys(finalLevels).forEach(k => {
            finalLevels[parseInt(k, 10)].sort((aId, bId) => {
                const a = courseMap.get(aId);
                const b = courseMap.get(bId);
                const an = a?.number?.match(/(\d{2,3})/);
                const bn = b?.number?.match(/(\d{2,3})/);
                const ai = an ? parseInt(an[1], 10) : 0;
                const bi = bn ? parseInt(bn[1], 10) : 0;
                return ai - bi || aId.localeCompare(bId);
            });
        });

        const initialNodes: Node<JSONCourse>[] = [];
        const initialEdges: Edge[] = [];

        // Position nodes based on finalLevels
        Object.entries(finalLevels).forEach(([levelStr, courseIds]) => {
            const y = parseInt(levelStr, 10) * (NODE_HEIGHT + VERTICAL_SPACING);
            const totalWidth = courseIds.length * (NODE_WIDTH + HORIZONTAL_SPACING) - HORIZONTAL_SPACING;
            const startX = -totalWidth / 2;

            courseIds.forEach((courseId, index) => {
                const course = courseMap.get(courseId);
                if (course) {
                    const position: XYPosition = {
                        x: startX + index * (NODE_WIDTH + HORIZONTAL_SPACING),
                        y,
                    };

                    initialNodes.push({
                        id: course.id,
                        type: 'custom',
                        position,
                        data: {
                            ...course,
                            code: course.code || course.id,
                            title: course.title || course.fullTitle || course.id,
                        },
                    });
                }
            });
        });

        // Create pruned edges: each prereq points only to immediate next-level dependents (nearest level > prereq level)
        const idToLevel = finalLevelMap; // alias
        filtered.forEach(course => {
            const dependents = Object.keys(adj[course.id] ? { [course.id]: adj[course.id] } : {}).length ? adj[course.id] : [];
            // also find dependents from the filtered set (some adj entries may be empty)
            const directDependents = filtered.filter(c => {
                const prereqs = getPrereqIds(c.requisitesDisplay);
                return prereqs.includes(course.id);
            }).map(c => c.id);

            const allDependents = Array.from(new Set([...dependents, ...directDependents]));
            if (allDependents.length === 0) return;

            const sourceLevel = idToLevel[course.id] ?? 0;
            // group dependents by level and pick the minimal level > sourceLevel
            const higher = allDependents
                .map(d => ({ id: d, l: idToLevel[d] ?? 0 }))
                .filter(x => x.l > sourceLevel);
            if (higher.length === 0) return;
            const minLevel = Math.min(...higher.map(h => h.l));
            const nextLevelDeps = higher.filter(h => h.l === minLevel).map(h => h.id);

            nextLevelDeps.forEach(depId => {
                initialEdges.push({
                    id: `e-${course.id}-${depId}`,
                    source: course.id,
                    target: depId,
                    type: 'smoothstep',
                    animated: false,
                    style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
                    markerEnd: { type: 'arrowclosed' as any, color: 'hsl(var(--primary))' },
                });
            });
        });

        return { nodes: initialNodes, edges: initialEdges };
    }, [filteredCourses]);

    const handleNodeClick = (_: React.MouseEvent, node: Node<JSONCourse>) => {
        onNodeClick(node.data);
    };


    return (
        <div className="h-full w-full bg-background">
            <div className="p-2 flex items-center gap-2 justify-center">
                <label className="text-sm text-muted-foreground">Subject:</label>
                <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="select select-sm"
                >
                    <option value="">Select subject</option>
                    {uniqueSubjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <div className="text-sm text-muted-foreground">{filteredCourses.length} courses</div>
            </div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                fitView
                zoomOnScroll={true}
                panOnDrag={true}
                panOnScroll={false}
                zoomOnDoubleClick={false}
                className="react-flow-course-diagram"
                proOptions={{ hideAttribution: true }}
            >
                <Controls />
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
            </ReactFlow>
        </div>
    );
}