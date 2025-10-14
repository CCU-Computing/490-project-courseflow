// group-node.tsx
import type { FC } from "react";
import { type NodeProps } from "reactflow";

// Local minimal node data shape
type NodeData = {
    code?: string;
    title?: string;
};

// A simple container node for grouping sequential courses
const GroupNode: FC<NodeProps<NodeData>> = ({ data }) => {
    return (
        <div className="bg-muted/30 border-2 border-dashed border-border rounded-xl p-4 pt-8 w-full h-full">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-bold text-muted-foreground">
                {data.title}
            </div>
        </div>
    );
};

export default GroupNode;