"use client";

import type { FC } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// Local minimal node data shape
type NodeData = {
    code?: string;
    title?: string;
};

// Compact two-column node: left column shows subject and number, right column shows wrapped title
const CustomNode: FC<NodeProps<NodeData>> = ({ data, selected }) => {
    return (
        <>
            <Handle type="target" position={Position.Left} className="!bg-primary/50" />
            <Card className={`w-40 border-2 transition-all duration-150 hover:shadow-lg hover:border-primary/80 ${selected ? 'border-primary shadow-xl scale-105' : 'border-border shadow-md'}`}>
                <CardContent className="p-1">
                    <div className="flex gap-1">
                        <div className="flex flex-col items-center justify-center w-12 text-center">
                            <div className="text-[10px] font-bold text-primary">{(data.code || '').split('*')[0]}</div>
                            <div className="text-xs font-extrabold">{(data.code || '').split('*')[1]}</div>
                        </div>
                        <div className="flex-0 text-left">
                            <div className="text-xs font-semibold leading-tight break-words" style={{ maxWidth: 160 }}>
                                {data.title}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Handle type="source" position={Position.Right} className="!bg-primary/50" />
        </>
    );
};

export default CustomNode;
