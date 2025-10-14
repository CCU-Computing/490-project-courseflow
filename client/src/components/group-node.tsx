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
        <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-2 pt-6 w-full h-full">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground">
                {data.title}
            </div>
        </div>
    );
};

export default GroupNode;