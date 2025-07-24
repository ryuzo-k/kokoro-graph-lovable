import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PersonNodeData {
  name: string;
  averageRating: number;
  meetingCount: number;
  location?: string;
  avatar?: string;
}

interface PersonNodeProps {
  data: PersonNodeData;
  selected: boolean;
}

const PersonNode = memo(({ data, selected }: PersonNodeProps) => {
  const getTrustColor = (rating: number) => {
    if (rating >= 4) return 'trust-high';
    if (rating >= 3) return 'trust-medium';
    if (rating >= 2) return 'trust-low';
    return 'trust-neutral';
  };

  const getNodeSize = (meetingCount: number) => {
    const baseSize = 60;
    const maxSize = 100;
    const size = Math.min(baseSize + (meetingCount * 5), maxSize);
    return `${size}px`;
  };

  const nodeSize = getNodeSize(data.meetingCount);
  const trustColor = getTrustColor(data.averageRating);

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        bg-card border-2 rounded-full p-3 shadow-node
        transition-all duration-300 ease-out
        ${selected ? `border-primary shadow-lg scale-110` : `border-${trustColor}`}
      `}
      style={{
        width: nodeSize,
        height: nodeSize,
        minWidth: '60px',
        minHeight: '60px'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="opacity-0"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="opacity-0"
      />

      <Avatar className="w-8 h-8 mb-1">
        <AvatarImage src={data.avatar} alt={data.name} />
        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
          {data.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="text-xs font-semibold text-center text-foreground truncate max-w-full px-1">
        {data.name}
      </div>

      {data.averageRating > 0 && (
        <Badge 
          variant="outline" 
          className={`text-xs mt-1 bg-${trustColor} text-white border-0`}
        >
          {data.averageRating.toFixed(1)}★
        </Badge>
      )}

      {data.location && (
        <div className="text-xs text-muted-foreground mt-1 truncate max-w-full">
          {data.location}
        </div>
      )}
    </div>
  );
});

PersonNode.displayName = 'PersonNode';

export default PersonNode;