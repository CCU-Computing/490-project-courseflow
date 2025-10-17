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

export type PrereqGroup = {
    type: 'and' | 'or';
    courses: (string | PrereqGroup)[];
};

// Parse a free-form DisplayText into a nested PrereqGroup structure.
export const parsePrereqDisplay = (displayText?: string): PrereqGroup | string | null => {
    if (!displayText || typeof displayText !== 'string') return null;

    // Normalize whitespace and remove common leading preambles
    let txt = displayText.replace(/\s+/g, ' ').trim();
    txt = txt.replace(/^(students?\s+must\s+have\s+completed\s+|student\s+must\s+have\s+completed\s+|prereq[:\s]+|prerequisite[:\s]+|prereq[:\s]*)/i, '').trim();

    // Remove coreq portion and trailing grade/qualifier phrases so they don't interfere
    txt = txt.split(/\bcoreq\b/i)[0].trim();
    txt = txt.replace(/\bwith\b[^.]*$/i, '').replace(/\ball\s+with\b.*$/i, '').trim();

    // Split by sentence terminators to avoid splitting useful comma lists
    const sentences = txt.split(/[\.\;\n]+/).map(s => s.trim()).filter(Boolean);

    const topLevel: (string | PrereqGroup)[] = [];

    const parseSentence = (s: string): string | PrereqGroup | null => {
        if (!s) return null;
        // If sentence contains an ' or ', split on top-level OR (OR has lowest precedence)
        if (/\bor\b/i.test(s)) {
            const orParts = s.split(/\bor\b/i).map(p => p.trim()).filter(Boolean);
            const orItems: (string | PrereqGroup)[] = [];
            for (const part of orParts) {
                // each part may be a list of ANDed courses (commas or 'and')
                const ids = getPrereqIds(part);
                if (ids.length === 0) continue;
                if (ids.length === 1) orItems.push(ids[0]);
                else orItems.push({ type: 'and', courses: ids });
            }
            if (orItems.length === 0) return null;
            if (orItems.length === 1) return orItems[0];
            return { type: 'or', courses: orItems };
        }

        // No OR: treat the sentence as an AND of all courses mentioned (commas commonly mean AND here)
        const ids = getPrereqIds(s);
        if (ids.length === 0) return null;
        if (ids.length === 1) return ids[0];
        return { type: 'and', courses: ids };
    };

    for (const sentence of sentences) {
        const parsed = parseSentence(sentence);
        if (!parsed) continue;
        topLevel.push(parsed);
    }

    if (topLevel.length === 0) return null;
    if (topLevel.length === 1) return topLevel[0];

    // Multiple sentence-level clauses — treat as AND between sentences
    return { type: 'and', courses: topLevel };
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
