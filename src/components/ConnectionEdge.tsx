import { memo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath,
  EdgeProps
} from '@xyflow/react';

interface ConnectionEdgeData {
  strength: number; // Number of meetings
  averageRating: number;
  lastMeeting: string;
}

const ConnectionEdge = memo((props: EdgeProps) => {
  const { t } = useLanguage();
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    style = {},
    markerEnd,
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getEdgeWidth = (strength: number) => {
    return Math.max(1, Math.min(6, strength));
  };

  const getEdgeColor = (rating: number) => {
    if (rating >= 4) return 'hsl(var(--trust-high))';
    if (rating >= 3) return 'hsl(var(--trust-medium))';
    if (rating >= 2) return 'hsl(var(--trust-low))';
    return 'hsl(var(--trust-neutral))';
  };

  const connectionData = data as unknown as ConnectionEdgeData;
  const edgeWidth = getEdgeWidth(connectionData?.strength || 1);
  const edgeColor = getEdgeColor(connectionData?.averageRating || 0);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: edgeWidth,
          stroke: edgeColor,
          strokeOpacity: 0.8,
        }}
      />
      {connectionData && connectionData.strength > 1 && (
        <EdgeLabelRenderer>
          <div
            className="absolute bg-card border border-border rounded-md px-2 py-1 text-xs shadow-soft pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            <div className="font-semibold text-foreground">
              {connectionData.strength} {t('person.meetings')}
            </div>
            {connectionData.averageRating > 0 && (
              <div className="text-muted-foreground">
                {connectionData.averageRating.toFixed(1)}★ {t('profile.averageRating')}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

ConnectionEdge.displayName = 'ConnectionEdge';

export default ConnectionEdge;