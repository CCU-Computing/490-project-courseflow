"use client";

import React, { useMemo, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
  type XYPosition,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Course, PrerequisiteGroup } from "@/lib/mock-data";
import { computerScienceProgram } from "@/lib/mock-data";
import CustomNode from "./custom-node";

const nodeTypes = {
  custom: CustomNode,
};

const NODE_WIDTH = 256;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 60;
const VERTICAL_SPACING = 100;

interface CourseDiagramProps {
  onNodeClick: (course: Course) => void;
  semesterFilter: "All" | "Fall" | "Spring" | "Summer";
}

const getPrereqIds = (prereqs: Course["prerequisites"]): string[] => {
  if (!("type" in prereqs)) return [];
  const group = prereqs as PrerequisiteGroup;
  let ids: string[] = [];
  for (const p of group.courses) {
    if (typeof p === "string") ids.push(p);
    else ids = ids.concat(getPrereqIds(p));
  }
  return ids;
};

export function CourseDiagram({ onNodeClick, semesterFilter }: CourseDiagramProps) {
  // Build the graph ONCE from ALL courses
  const base = useMemo(() => {
    const courses = computerScienceProgram.courses;
    const courseMap = new Map(courses.map((c) => [c.id, c]));

    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    courses.forEach((c) => {
      adj[c.id] = [];
      inDegree[c.id] = 0;
    });

    courses.forEach((course) => {
      const prereqs = getPrereqIds(course.prerequisites);
      prereqs.forEach((prereqId) => {
        if (courseMap.has(prereqId)) {
          adj[prereqId].push(course.id);
          inDegree[course.id]++;
        }
      });
    });

    const queue: string[] = [];
    courses.forEach((c) => {
      if (inDegree[c.id] === 0) queue.push(c.id);
    });

    const levels: Record<number, string[]> = {};
    let level = 0;
    while (queue.length > 0) {
      const n = queue.length;
      levels[level] = [];
      for (let i = 0; i < n; i++) {
        const u = queue.shift()!;
        levels[level].push(u);
        adj[u]?.forEach((v) => {
          inDegree[v]--;
          if (inDegree[v] === 0) queue.push(v);
        });
      }
      level++;
    }

    const nodes: Node<Course>[] = [];
    const edges: Edge[] = [];

    Object.entries(levels).forEach(([levelStr, courseIds]) => {
      const y = parseInt(levelStr, 10) * (NODE_HEIGHT + VERTICAL_SPACING);
      const totalWidth =
        courseIds.length * (NODE_WIDTH + HORIZONTAL_SPACING) - HORIZONTAL_SPACING;
      const startX = -totalWidth / 2;

      courseIds.forEach((courseId, index) => {
        const course = courseMap.get(courseId);
        if (!course) return;

        const position: XYPosition = {
          x: startX + index * (NODE_WIDTH + HORIZONTAL_SPACING),
          y,
        };

        nodes.push({
          id: course.id,
          type: "custom",
          position,
          data: course,
        });

        const prereqs = getPrereqIds(course.prerequisites);
        prereqs.forEach((prereqId) => {
          if (courseMap.has(prereqId)) {
            edges.push({
              id: `e-${prereqId}-${course.id}`,
              source: prereqId,
              target: course.id,
              type: "smoothstep",
              animated: false,
              style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
              markerEnd: { type: "arrowclosed", color: "hsl(var(--primary))" },
            });
          }
        });
      });
    });

    return { nodes, edges };
  }, []);

  // Keep nodes in state so we can update their styles (opacity) on the fly
  const [nodes, setNodes] = useState<Node<Course>[]>(base.nodes);
  const [edges] = useState<Edge[]>(base.edges);

  // When the semesterFilter changes, dim non-matching nodes
  useEffect(() => {
    setNodes((prev) =>
      prev.map((n) => {
        const offered = n.data.semesters_offered;
        const matches =
          semesterFilter === "All" ||
          (Array.isArray(offered) && offered.includes(semesterFilter));
        return {
          ...n,
          style: { ...(n.style || {}), opacity: matches ? 1 : 0.3 },
        };
      })
    );
  }, [semesterFilter]);

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
        zoomOnScroll
        panOnDrag
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
