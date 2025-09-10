"use client";

import type { FC } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Course } from "@/lib/mock-data";

const CustomNode: FC<NodeProps<Course>> = ({ data, selected }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary/50" />
      <Card className={`w-64 border-2 transition-all duration-200 hover:shadow-lg hover:border-primary/80 ${selected ? 'border-primary shadow-xl scale-105' : 'border-transparent shadow-md'}`}>
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-base font-bold font-headline">{data.code}</CardTitle>
            <p className="text-sm text-muted-foreground">{data.title}</p>
          </div>
        </CardHeader>
      </Card>
      <Handle type="source" position={Position.Bottom} className="!bg-primary/50" />
    </>
  );
};

export default CustomNode;
