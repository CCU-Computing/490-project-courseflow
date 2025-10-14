// Utilities for working with the raw course JSON dataset
import rawCourseData from '../../data/course_data_full.json';

export type RawCourse = any;

export const getRawCourse = (key: string): RawCourse | null => {
    if (!key) return null;
    // Key expected like 'ACCT*330'
    return (rawCourseData as Record<string, any>)[key] ?? null;
};

// Parse prerequisite course ids from a free-form DisplayText string.
export const getPrereqIds = (displayText?: string): string[] => {
    if (!displayText || typeof displayText !== 'string') return [];
    let txt = displayText
        .replace(/[,;()]/g, ' ')
        .replace(/\//g, ' or ')
        .replace(/\bAND\b/gi, ' OR ')
        .replace(/\bOR\b/gi, ' OR ')
        .replace(/[\.\:\-\u2013\u2014]/g, ' ')
        .toUpperCase();

    const regex = /([A-Z]{2,6})\s?\*?\s?(\d{2,3}[A-Z]?)/g;
    const ids: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = regex.exec(txt)) !== null) {
        const subject = m[1].trim();
        const number = m[2].trim();
        ids.push(`${subject}*${number}`);
    }
    return Array.from(new Set(ids));
};

export type PrereqNode = {
    id: string;
    code: string;
    title?: string;
    children: PrereqNode[];
};

export const buildPrereqTree = (rootId: string, maxDepth = 5, visited = new Set<string>()): PrereqNode | null => {
    const raw = getRawCourse(rootId);
    if (!raw) return null;
    const node: PrereqNode = {
        id: rootId,
        code: rootId,
        title: raw.Title || raw.FullTitleDisplay || raw.CourseTitleDisplay,
        children: [],
    };
    if (maxDepth <= 0) return node;
    // Avoid cycles
    if (visited.has(rootId)) return node;
    visited.add(rootId);

    const displayTexts: string[] = Array.isArray(raw.CourseRequisites)
        ? raw.CourseRequisites.map((r: any) => r.DisplayText).filter(Boolean)
        : raw.CourseRequisites && raw.CourseRequisites.DisplayText ? [raw.CourseRequisites.DisplayText] : [];

    const combined = displayTexts.join(' ; ');
    const prereqIds = getPrereqIds(combined);

    for (const pid of prereqIds) {
        if (visited.has(pid)) continue;
        const child = buildPrereqTree(pid, maxDepth - 1, visited);
        if (child) node.children.push(child);
    }
    return node;
};

export default getRawCourse;
