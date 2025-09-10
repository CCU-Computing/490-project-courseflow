"use client";

import React, { useMemo } from 'react';
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
import type { Course, PrerequisiteGroup } from '@/lib/mock-data';
import { computerScienceProgram } from '@/lib/mock-data';
import CustomNode from './custom-node';

const nodeTypes = {
  custom: CustomNode,
};

const NODE_WIDTH = 256;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 100;

interface CourseDiagramProps {
  onNodeClick: (course: Course) => void;
}

const getPrereqIds = (prereqs: Course['prerequisites']): string[] => {
  if (!('type' in prereqs)) {
    return [];
  }
  const group = prereqs as PrerequisiteGroup;
  let ids: string[] = [];
  for (const p of group.courses) {
    if (typeof p === 'string') {
      ids.push(p);
    } else {
      ids = ids.concat(getPrereqIds(p));
    }
  }
  return ids;
};

export function CourseDiagram({ onNodeClick }: CourseDiagramProps) {
  const { nodes, edges } = useMemo(() => {
    const courses = computerScienceProgram.courses;
    const courseMap = new Map(courses.map(c => [c.id, c]));

    // Graph representation
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    courses.forEach(c => {
      adj[c.id] = [];
      inDegree[c.id] = 0;
    });

    courses.forEach(course => {
      const prereqs = getPrereqIds(course.prerequisites);
      prereqs.forEach(prereqId => {
        if (courseMap.has(prereqId)) {
          // prereq -> course
          adj[prereqId].push(course.id);
          inDegree[course.id]++;
        }
      });
    });

    // Topological sort to determine levels
    const queue: string[] = [];
    courses.forEach(c => {
      if (inDegree[c.id] === 0) {
        queue.push(c.id);
      }
    });

    const levels: Record<number, string[]> = {};
    let level = 0;
    while (queue.length > 0) {
      const levelSize = queue.length;
      levels[level] = [];
      for (let i = 0; i < levelSize; i++) {
        const u = queue.shift()!;
        levels[level].push(u);
        adj[u]?.forEach(v => {
          inDegree[v]--;
          if (inDegree[v] === 0) {
            queue.push(v);
          }
        });
      }
      level++;
    }

    const initialNodes: Node<Course>[] = [];
    const initialEdges: Edge[] = [];

    // Position nodes based on levels
    Object.entries(levels).forEach(([levelStr, courseIds]) => {
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
            data: course,
          });

          const prereqs = getPrereqIds(course.prerequisites);
          prereqs.forEach(prereqId => {
            if (courseMap.has(prereqId)) {
              initialEdges.push({
                id: `e-${prereqId}-${course.id}`,
                source: prereqId,
                target: course.id,
                type: 'smoothstep',
                animated: false,
                style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
                markerEnd: { type: 'arrowclosed', color: 'hsl(var(--primary))' },
              });
            }
          });
        }
      });
    });

    return { nodes: initialNodes, edges: initialEdges };
  }, []);

  const handleNodeClick = (_: React.MouseEvent, node: Node<Course>) => {
    onNodeClick(node.data);
  };

  return (
    <div className="h-full w-full bg-background">
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
