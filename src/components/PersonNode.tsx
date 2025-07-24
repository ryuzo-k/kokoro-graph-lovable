import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Award, Building } from 'lucide-react';

interface PersonNodeData {
  name: string;
  averageRating: number;
  meetingCount: number;
  location?: string;
  avatar?: string;
  company?: string;
  position?: string;
  communities?: string[];
  trustScore?: number;
  connectionCount?: number;
}

interface PersonNodeProps {
  data: PersonNodeData;
  selected: boolean;
}

const PersonNode = memo(({ data, selected }: PersonNodeProps) => {
  // 信用スコア計算（複数次元評価の平均）
  const trustScore = data.trustScore || data.averageRating;
  const trustPercentage = Math.round(trustScore * 20); // 1-5 -> 0-100

  const getTrustColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-500 border-green-400';
    if (score >= 4) return 'bg-blue-500 border-blue-400';
    if (score >= 3) return 'bg-yellow-500 border-yellow-400';
    if (score >= 2) return 'bg-orange-500 border-orange-400';
    return 'bg-gray-500 border-gray-400';
  };

  const getNodeSize = (meetingCount: number) => {
    const baseSize = 140;
    const maxSize = 180;
    const size = Math.min(baseSize + (meetingCount * 3), maxSize);
    return `${size}px`;
  };

  // コミュニティカラー
  const getCommunityColors = () => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700'];
    return (data.communities || []).slice(0, 3).map((_, index) => colors[index % colors.length]);
  };

  const nodeSize = getNodeSize(data.meetingCount);
  const trustColorClass = getTrustColor(trustScore);

  return (
    <div
      className={`
        relative flex flex-col bg-card border-2 rounded-lg p-3 shadow-lg
        transition-all duration-300 ease-out min-w-[140px] max-w-[180px]
        ${selected ? 'border-primary shadow-xl scale-105' : 'border-border hover:border-primary/50'}
      `}
      style={{
        width: nodeSize,
        minHeight: '160px'
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-primary"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-primary"
      />

      {/* Header with Avatar and Trust Score */}
      <div className="relative mb-2">
        <div className="flex items-start space-x-2">
          <Avatar className="w-12 h-12">
            <AvatarImage src={data.avatar} alt={data.name} />
            <AvatarFallback className="text-sm bg-primary text-primary-foreground">
              {data.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {/* Trust Score Badge */}
          <div className={`absolute top-0 right-0 w-8 h-8 rounded-full ${trustColorClass} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
            {trustScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Name and Title */}
      <div className="flex-1 space-y-1 mb-2">
        <h3 className="font-semibold text-sm text-foreground leading-tight">
          {data.name}
        </h3>
        
        {data.company && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Building className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{data.company}</span>
          </div>
        )}
        
        {data.position && (
          <p className="text-xs text-muted-foreground truncate">{data.position}</p>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center space-x-1">
          <Users className="w-3 h-3 text-blue-500" />
          <span className="text-muted-foreground">{data.connectionCount || data.meetingCount}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          <span className="text-muted-foreground">{data.averageRating.toFixed(1)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Award className="w-3 h-3 text-purple-500" />
          <span className="text-muted-foreground">{trustPercentage}</span>
        </div>
      </div>

      {/* Community Badges */}
      {data.communities && data.communities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {data.communities.slice(0, 2).map((community, index) => (
            <Badge
              key={`${data.name}-community-${index}-${community}`}
              variant="secondary"
              className={`text-xs px-1.5 py-0.5 ${getCommunityColors()[index]} border-0`}
            >
              {community.length > 8 ? `${community.substring(0, 8)}...` : community}
            </Badge>
          ))}
          {data.communities.length > 2 && (
            <Badge key={`${data.name}-more-communities`} variant="outline" className="text-xs px-1.5 py-0.5">
              +{data.communities.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Location */}
      {data.location && (
        <div className="text-xs text-muted-foreground flex items-center space-x-1 mt-auto">
          <span>📍</span>
          <span className="truncate">{data.location}</span>
        </div>
      )}
    </div>
  );
});

PersonNode.displayName = 'PersonNode';

export default PersonNode;