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
import GroupNode from './group-node';
// Use the pre-built course JSON dataset
import rawCourseData from '../../data/course_data_full.json';

type JSONCourse = {
    id: string;
    subject: string;
    number: string;
    code?: string;
    title?: string;
    fullTitle?: string;
    requisitesDisplay?: string;
};

const nodeTypes = {
    custom: CustomNode,
    group: GroupNode,
};

const NODE_WIDTH = 150;
const NODE_HEIGHT = 54;
const HORIZONTAL_SPACING = 64;
const VERTICAL_SPACING = 120;

interface CourseDiagramProps {
    onNodeClick: (course: JSONCourse | { id: string; label: string; members: string[] }) => void;
    courses?: JSONCourse[];
}

const getPrereqIds = (displayText?: string): string[] => {
    if (!displayText || typeof displayText !== 'string') return [];
    let txt = displayText.replace(/[,;()]/g, ' ').replace(/\//g, ' or ').replace(/[\.\:\-\u2013\u2014]/g, ' ').toUpperCase();
    // match SUBJ*123, SUBJ 123, SUBJ123, allow suffix letters (L, A, B)
    const regex = /([A-Z]{2,6})\s?\*?\s?(\d{2,4}[A-Z]?)/g;
    const ids: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(txt)) !== null) {
        ids.push(`${m[1].trim()}*${m[2].trim()}`);
    }
    return Array.from(new Set(ids));
};

const splitNumber = (num?: string) => {
    if (!num) return { numeric: 0, suffix: '' };
    const m = num.toUpperCase().match(/(\d{2,4})([A-Z]*)/);
    if (!m) return { numeric: 0, suffix: '' };
    return { numeric: parseInt(m[1], 10), suffix: m[2] || '' };
};

export function CourseDiagram({ onNodeClick, courses }: CourseDiagramProps) {
    const [selectedSubject, setSelectedSubject] = useState('');

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
                : val.CourseRequisites?.DisplayText || undefined,
        }));
    }, [courses]);

    const allCoursesMap = useMemo(() => new Map(allCourses.map(c => [c.id, c])), [allCourses]);

    const uniqueSubjects = useMemo(() => Array.from(new Set(allCourses.map(c => c.subject))).filter(Boolean).sort(), [allCourses]);

    const filteredCourses = useMemo(() => {
        const subj = selectedSubject.trim().toUpperCase();
        if (!subj) return [];
        // only include courses up to 400 level
        const initial = allCourses.filter(c => {
            if ((c.subject || '').toUpperCase() !== subj) return false;
            const n = splitNumber(c.number).numeric || 0;
            return n <= 500;
        });

        const expanded = new Map<string, JSONCourse>();

        const addWithPrereqs = (course: JSONCourse) => {
            if (expanded.has(course.id)) return;
            // skip adding courses above 400 (prereqs may point to grad-level)
            const num = splitNumber(course.number).numeric || 0;
            if (num > 500) return;
            expanded.set(course.id, course);
            const prereqIds = getPrereqIds(course.requisitesDisplay);
            prereqIds.forEach(pid => {
                const p = allCoursesMap.get(pid);
                if (p) {
                    const pn = splitNumber(p.number).numeric || 0;
                    if (pn <= 500) addWithPrereqs(p);
                }
            });
        };

        initial.forEach(c => addWithPrereqs(c));
        return Array.from(expanded.values());
    }, [allCourses, allCoursesMap, selectedSubject]);

    const { nodes, edges } = useMemo(() => {
        if (!filteredCourses || filteredCourses.length === 0) return { nodes: [], edges: [] };

        // Step 1: Preprocessing groups
        // sequential groups: detect same subject with same numeric + suffix A/B or A->B pattern
        const idToCourse = new Map(filteredCourses.map(c => [c.id, c]));

        const grouped: Map<string, { id: string; label: string; members: string[]; type: 'sequential' | 'combined' | 'single' }>
            = new Map();

        const visited = new Set<string>();

        // Helper to create a group id
        const mkGroupId = (base: string) => `group-${base}`;

        // 1a: find lecture/lab pairs (suffix L or numbers matching)
        filteredCourses.forEach(c => {
            if (visited.has(c.id)) return;
            const { numeric, suffix } = splitNumber(c.number);
            // look for companion lab with same numeric and suffix 'L' or course code ending with L
            if (suffix === '' || suffix === undefined) {
                const labId = `${c.subject}*${numeric}L`;
                if (idToCourse.has(labId)) {
                    const gid = mkGroupId(`${c.subject}-${numeric}-combined`);
                    grouped.set(gid, { id: gid, label: `${c.subject} ${numeric}`, members: [c.id, labId], type: 'combined' });
                    visited.add(c.id);
                    visited.add(labId);
                }
            }
        });

        // 1b: find sequential like 160A -> 160B
        filteredCourses.forEach(c => {
            if (visited.has(c.id)) return;
            const { numeric, suffix } = splitNumber(c.number);
            if (!suffix) return;
            // look for companion with same numeric and suffix next letter (A->B)
            const nextSuffix = String.fromCharCode(suffix.charCodeAt(0) + 1);
            const nextId = `${c.subject}*${numeric}${nextSuffix}`;
            if (idToCourse.has(nextId)) {
                const gid = mkGroupId(`${c.subject}-${numeric}-seq`);
                grouped.set(gid, { id: gid, label: `${c.subject} ${numeric}`, members: [c.id, nextId], type: 'sequential' });
                visited.add(c.id);
                visited.add(nextId);
            }
        });

        // Everything else becomes single-member groups (for simpler layout handling)
        filteredCourses.forEach(c => {
            if (visited.has(c.id)) return;
            const gid = mkGroupId(c.id.replace(/\*/, '-'));
            grouped.set(gid, { id: gid, label: c.id, members: [c.id], type: 'single' });
            visited.add(c.id);
        });

        // Build mapping from course id -> group id
        const courseToGroup = new Map<string, string>();
        grouped.forEach((g, gid) => g.members.forEach(m => courseToGroup.set(m, gid)));

        // Build adjacency between groups based on course prereqs
        const groupAdj = new Map<string, Set<string>>();
        const groupInDegree: Record<string, number> = {};
        Array.from(grouped.keys()).forEach(gid => { groupAdj.set(gid, new Set()); groupInDegree[gid] = 0; });

        grouped.forEach((g, gid) => {
            // group's prereqs defined as prereqs of the first member (for sequential groups)
            const first = g.members[0];
            const course = idToCourse.get(first);
            const prereqs = course ? getPrereqIds(course.requisitesDisplay) : [];
            prereqs.forEach(pcid => {
                const pg = courseToGroup.get(pcid);
                if (pg && pg !== gid) {
                    if (!groupAdj.get(pg)!.has(gid)) {
                        groupAdj.get(pg)!.add(gid);
                        groupInDegree[gid] = (groupInDegree[gid] || 0) + 1;
                    }
                }
            });
        });

        // Topological Kahn on groups
        const q: string[] = [];
        Object.keys(groupInDegree).forEach(k => { if (groupInDegree[k] === 0) q.push(k); });
        const topoLevels: Record<string, number> = {};
        let lvl = 0;
        while (q.length > 0) {
            const size = q.length;
            for (let i = 0; i < size; i++) {
                const u = q.shift()!;
                topoLevels[u] = lvl;
                groupAdj.get(u)!.forEach(v => {
                    groupInDegree[v]--;
                    if (groupInDegree[v] === 0) q.push(v);
                });
            }
            lvl++;
        }

        // any remaining groups (cycles) get appended levels
        Array.from(grouped.keys()).forEach((gid, idx) => { if (topoLevels[gid] === undefined) topoLevels[gid] = lvl + idx; });

        // compute courseNumLevel for groups (based on lowest member course number)
        const groupNumLevel: Record<string, number> = {};
        grouped.forEach((g, gid) => {
            const nums = g.members.map(m => splitNumber(idToCourse.get(m)?.number).numeric || 100);
            const minNum = Math.min(...nums);
            const bucket = Math.max(0, Math.floor(minNum / 100) - 1);
            groupNumLevel[gid] = bucket;
        });

        // initial level = max(topo, num)
        const groupLevel: Record<string, number> = {};
        grouped.forEach((_, gid) => { groupLevel[gid] = Math.max(topoLevels[gid] ?? 0, groupNumLevel[gid] ?? 0); });

        // enforcement pass: ensure every dependent is strictly below its prereqs
        let changed = true;
        while (changed) {
            changed = false;
            grouped.forEach((g, gid) => {
                const preds = Array.from(groupAdj.entries()).filter(([, set]) => set.has(gid)).map(([k]) => k);
                preds.forEach(pred => {
                    if ((groupLevel[gid] ?? 0) <= (groupLevel[pred] ?? 0)) {
                        groupLevel[gid] = (groupLevel[pred] ?? 0) + 1;
                        changed = true;
                    }
                });
            });
        }

        // Build level buckets
        const levels: Record<number, string[]> = {};
        Object.entries(groupLevel).forEach(([gid, lv]) => { if (!levels[lv]) levels[lv] = []; levels[lv].push(gid); });

        // Compute incoming counts (fresh) and detect isolated groups (no in, no out)
        const incomingCount: Record<string, number> = {};
        Array.from(grouped.keys()).forEach(gid => incomingCount[gid] = 0);
        groupAdj.forEach((set, from) => {
            Array.from(set).forEach(to => { incomingCount[to] = (incomingCount[to] || 0) + 1; });
        });

        const isolatedGids: string[] = [];
        Array.from(grouped.keys()).forEach(gid => {
            const out = (groupAdj.get(gid) || new Set()).size;
            const inc = incomingCount[gid] || 0;
            if (inc === 0 && out === 0) isolatedGids.push(gid);
        });

        // Remove isolated groups from the central levels so they don't take up main space
        isolatedGids.forEach(iso => {
            Object.keys(levels).forEach(lk => {
                levels[parseInt(lk, 10)] = levels[parseInt(lk, 10)].filter(g => g !== iso);
                if (levels[parseInt(lk, 10)].length === 0) delete levels[parseInt(lk, 10)];
            });
        });

        // sort inside levels for determinism
        Object.keys(levels).forEach(k => levels[parseInt(k, 10)].sort());

        const nodes: Node<any>[] = [];
        const edges: Edge[] = [];

        // Position groups
        Object.entries(levels).forEach(([lvlStr, gids]) => {
            const y = parseInt(lvlStr, 10) * (NODE_HEIGHT + VERTICAL_SPACING);
            const totalWidth = gids.length * (NODE_WIDTH + HORIZONTAL_SPACING) - HORIZONTAL_SPACING;
            const startX = -totalWidth / 2;
            gids.forEach((gid, idx) => {
                const g = grouped.get(gid)!;
                const x = startX + idx * (NODE_WIDTH + HORIZONTAL_SPACING);
                // If group has multiple members, render as group node; otherwise custom node
                if (g.members.length > 1) {
                    nodes.push({ id: gid, type: 'group', position: { x, y }, data: { id: gid, label: g.label, members: g.members } });
                    // also create internal child nodes for visual clarity (place inside group)
                    const innerX = x - NODE_WIDTH / 2 + 16;
                    g.members.forEach((mid, mi) => {
                        const c = idToCourse.get(mid)!;
                        nodes.push({ id: mid, type: 'custom', position: { x: innerX + mi * 110, y: y + 20 }, data: { ...c, code: c.code || c.id, title: c.title || c.fullTitle || c.id } });
                        // internal edge for sequence/combined
                        edges.push({ id: `inner-${mid}`, source: mid, target: g.members[mi + 1] ?? mid, style: { stroke: '#999' }, animated: false, markerEnd: undefined });
                    });
                } else {
                    const mid = g.members[0];
                    const c = idToCourse.get(mid)!;
                    nodes.push({ id: mid, type: 'custom', position: { x, y }, data: { ...c, code: c.code || c.id, title: c.title || c.fullTitle || c.id } });
                }
            });
        });

        // After central placement, position isolated groups in a left column
        if (isolatedGids.length > 0) {
            const levelCount = Object.keys(levels).length || 1;
            const centralWidth = levelCount * (NODE_WIDTH + HORIZONTAL_SPACING);
            const leftX = -centralWidth / 2 - NODE_WIDTH - 250;
            const colStartY = 0;
            isolatedGids.forEach((gid, idx) => {
                const g = grouped.get(gid)!;
                const y = colStartY + idx * (NODE_HEIGHT + 24);
                const x = leftX;
                if (g.members.length > 1) {
                    nodes.push({ id: gid, type: 'group', position: { x, y }, data: { id: gid, label: g.label, members: g.members } });
                    const innerX = x - NODE_WIDTH / 2 + 16;
                    g.members.forEach((mid, mi) => {
                        const c = idToCourse.get(mid)!;
                        nodes.push({ id: mid, type: 'custom', position: { x: innerX + mi * 110, y: y + 20 }, data: { ...c, code: c.code || c.id, title: c.title || c.fullTitle || c.id } });
                        if (mi < g.members.length - 1) {
                            edges.push({ id: `inner-${mid}`, source: mid, target: g.members[mi + 1], animated: false, style: { stroke: '#999' } });
                        }
                    });
                } else {
                    const mid = g.members[0];
                    const c = idToCourse.get(mid)!;
                    nodes.push({ id: mid, type: 'custom', position: { x, y }, data: { ...c, code: c.code || c.id, title: c.title || c.fullTitle || c.id } });
                }
            });
        }

        // Prune edges: only connect groups to groups that are on the immediate next level
        const gidToLevel = Object.fromEntries(Object.entries(groupLevel).map(([k, v]) => [k, v]));
        grouped.forEach((g, gid) => {
            const deps = Array.from(groupAdj.get(gid) || []);
            if (deps.length === 0) return;
            const srcLevel = gidToLevel[gid] ?? 0;
            const higher = deps.map(d => ({ id: d, l: gidToLevel[d] ?? 0 })).filter(x => x.l > srcLevel);
            if (higher.length === 0) return;
            const minLevel = Math.min(...higher.map(h => h.l));
            const nextDeps = higher.filter(h => h.l === minLevel).map(h => h.id);
            nextDeps.forEach(dgid => {
                // connect group nodes (or member nodes) from gid -> dgid
                const sourceNode = g.members[g.members.length - 1]; // last member acts as source
                const targetGroup = grouped.get(dgid)!;
                const targetNode = targetGroup.members[0];
                edges.push({ id: `e-${sourceNode}-${targetNode}`, source: sourceNode, target: targetNode, animated: false, style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed' as any, color: 'hsl(var(--primary))' } });
            });
        });

        return { nodes, edges };
    }, [filteredCourses]);

    const handleNodeClick = (_: React.MouseEvent, node: Node<any>) => {
        onNodeClick(node.data);
    };

    return (
        <div className="h-full w-full bg-background">
            <div className="p-2 flex items-center gap-2 justify-center">
                <label className="text-sm text-muted-foreground">Subject:</label>
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="select select-sm">
                    <option value="">Select subject</option>
                    {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="text-sm text-muted-foreground">{filteredCourses.length} courses</div>
            </div>
            <ReactFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick} nodeTypes={nodeTypes} fitView zoomOnScroll panOnDrag panOnScroll={false} zoomOnDoubleClick={false} className="react-flow-course-diagram" proOptions={{ hideAttribution: true }}>
                <Controls />
                <MiniMap nodeStrokeWidth={3} zoomable pannable />
                <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
            </ReactFlow>
        </div>
    );
}

export default CourseDiagram;