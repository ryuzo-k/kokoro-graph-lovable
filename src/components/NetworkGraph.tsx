import { useCallback, useMemo, useState } from 'react';
import * as React from 'react';
import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceLink,
  forceCollide,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PersonNode from './PersonNode';
import ConnectionEdge from './ConnectionEdge';
import PersonProfile from './PersonProfile';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Zap, Globe, Users2, Building2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Person } from '@/hooks/usePeople';
import { Meeting, useMeetings } from '@/hooks/useMeetings';
import { useToast } from '@/hooks/use-toast';
import { useRelationships } from '@/hooks/useRelationships';
import RelationshipDetailPanel from './RelationshipDetailPanel';
import LinkedInConnector from './LinkedInConnector';

interface PersonWithStats extends Person {
  averageRating: number;
  meetingCount: number;
  meetings: Meeting[];
}

interface NetworkGraphProps {
  people: PersonWithStats[];
  connections: any[];
  onNodeClick?: (person: PersonWithStats) => void;
}

const nodeTypes = {
  person: PersonNode,
};

const edgeTypes = {
  connection: ConnectionEdge,
};

const NetworkGraph = ({ people, connections, onNodeClick }: NetworkGraphProps) => {
  const { t, language } = useLanguage();
  const { addMeeting } = useMeetings();
  const { relationships, getRelationshipBetween } = useRelationships();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<PersonWithStats | null>(null);
  const [showRelationshipDetail, setShowRelationshipDetail] = useState(false);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'force' | 'circular' | 'hierarchical' | 'community'>('force');
  const [focusedPerson, setFocusedPerson] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Filter people based on search and location
  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !locationFilter || person.location?.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesLocation;
    });
  }, [people, searchTerm, locationFilter]);

  // Get unique locations for filter
  const locations = useMemo(() => {
    const locationSet = new Set<string>();
    people.forEach(person => {
      if (person.location) {
        locationSet.add(person.location);
      }
    });
    return Array.from(locationSet);
  }, [people]);

  // 構造的レイアウト計算
  const getStructuralLayout = (nodes: any[], connections: any[], mode: string) => {
    const d3Nodes = nodes.map(p => ({ id: p.id, person: p }));
    
    // Filter connections to only include people that exist in filteredPeople
    const filteredPersonIds = new Set(nodes.map(p => p.id));
    const validConnections = connections.filter(conn => 
      filteredPersonIds.has(conn.person1Id) && filteredPersonIds.has(conn.person2Id)
    );

    const d3Links = validConnections.map(conn => ({
      source: conn.person1Id,
      target: conn.person2Id,
      strength: conn.meetingCount,
    }));

    switch (mode) {
      case 'hierarchical':
        return getHierarchicalLayout(d3Nodes, d3Links);
      case 'circular':
        return getCircularLayout(d3Nodes, d3Links);
      case 'community':
        return getCommunityLayout(d3Nodes, d3Links);
      default:
        return getForceLayout(d3Nodes, d3Links);
    }
  };

  // Force-directed layout (既存)
  const getForceLayout = (d3Nodes: any[], d3Links: any[]) => {
    const sim = forceSimulation(d3Nodes)
      .force('link', forceLink(d3Links).id(d => (d as any).id).distance(120))
      .force('charge', forceManyBody().strength(-250))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide().radius(90))
      .stop();

    for (let i = 0; i < 200; i++) sim.tick();
    return d3Nodes;
  };

  // 階層レイアウト (中心性に基づく)
  const getHierarchicalLayout = (d3Nodes: any[], d3Links: any[]) => {
    // 各ノードの中心性を計算
    const centrality = new Map<string, number>();
    d3Nodes.forEach(node => centrality.set(node.id, 0));
    
    d3Links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      centrality.set(sourceId, (centrality.get(sourceId) || 0) + link.strength);
      centrality.set(targetId, (centrality.get(targetId) || 0) + link.strength);
    });

    // 中心性でソート
    const sortedNodes = [...d3Nodes].sort((a, b) => 
      (centrality.get(b.id) || 0) - (centrality.get(a.id) || 0)
    );

    // 同心円状に配置
    sortedNodes.forEach((node, index) => {
      const level = Math.floor(index / 6); // 6人ずつの層
      const angleStep = (Math.PI * 2) / Math.min(6, sortedNodes.length - level * 6);
      const radius = level * 150 + (level === 0 ? 0 : 80);
      const angle = (index % 6) * angleStep;
      
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(angle) * radius;
    });

    return d3Nodes;
  };

  // 円形レイアウト (信頼度でソート)
  const getCircularLayout = (d3Nodes: any[], d3Links: any[]) => {
    const sortedNodes = [...d3Nodes].sort((a, b) => 
      (b.person.averageRating || 0) - (a.person.averageRating || 0)
    );

    const radius = Math.max(200, sortedNodes.length * 15);
    const angleStep = (Math.PI * 2) / sortedNodes.length;

    sortedNodes.forEach((node, index) => {
      const angle = index * angleStep;
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(angle) * radius;
    });

    return d3Nodes;
  };

  // コミュニティレイアウト (場所・会社でグループ化)
  const getCommunityLayout = (d3Nodes: any[], d3Links: any[]) => {
    // コミュニティを検出 (場所ベース)
    const communities = new Map<string, any[]>();
    
    d3Nodes.forEach(node => {
      const community = node.person.location || node.person.company || 'その他';
      if (!communities.has(community)) {
        communities.set(community, []);
      }
      communities.get(community)!.push(node);
    });

    // 各コミュニティを配置
    const communityKeys = Array.from(communities.keys());
    const communityRadius = 300;
    const communityAngleStep = (Math.PI * 2) / communityKeys.length;

    communityKeys.forEach((communityKey, communityIndex) => {
      const communityNodes = communities.get(communityKey)!;
      const communityAngle = communityIndex * communityAngleStep;
      const communityX = Math.cos(communityAngle) * communityRadius;
      const communityY = Math.sin(communityAngle) * communityRadius;

      // コミュニティ内でノードを円形配置
      const innerRadius = Math.max(60, communityNodes.length * 8);
      const innerAngleStep = (Math.PI * 2) / communityNodes.length;

      communityNodes.forEach((node, nodeIndex) => {
        const nodeAngle = nodeIndex * innerAngleStep;
        node.x = communityX + Math.cos(nodeAngle) * innerRadius;
        node.y = communityY + Math.sin(nodeAngle) * innerRadius;
      });
    });

    return d3Nodes;
  };

  // Compute force-directed layout positions using d3-force
  const initialNodes: Node[] = useMemo(() => {
    // フォーカスモードの時は対象の人とその関係者のみ表示
    let displayPeople = filteredPeople;
    
    if (focusedPerson) {
      const focusedPersonObj = filteredPeople.find(p => p.id === focusedPerson);
      if (focusedPersonObj) {
        // フォーカスした人の関係者を取得
        const relatedPersonIds = new Set<string>();
        relatedPersonIds.add(focusedPerson);
        
        connections.forEach(conn => {
          if (conn.person1Id === focusedPerson) {
            relatedPersonIds.add(conn.person2Id);
          } else if (conn.person2Id === focusedPerson) {
            relatedPersonIds.add(conn.person1Id);
          }
        });
        
        relationships.forEach(rel => {
          if (rel.person1_id === focusedPerson) {
            relatedPersonIds.add(rel.person2_id);
          } else if (rel.person2_id === focusedPerson) {
            relatedPersonIds.add(rel.person1_id);
          }
        });
        
        displayPeople = filteredPeople.filter(p => relatedPersonIds.has(p.id));
      }
    }
    
    const layoutNodes = getStructuralLayout(displayPeople, connections, layoutMode);

    // Map to React Flow nodes
    return layoutNodes.map(n => {
      const person = n.person;
      
      // 新しい関係性データベースから接続情報を取得
      const allPersonRelationships = relationships.filter(rel => 
        rel.person1_id === person.id || rel.person2_id === person.id
      );
      const isConnected = allPersonRelationships.length > 0;
      const connectionStrength = allPersonRelationships.reduce((sum, rel) => sum + rel.total_meetings, 0);
      
      // 既存のconnectionsデータとの互換性も維持
      const filteredPersonIds = new Set(filteredPeople.map(p => p.id));
      const validConnections = connections.filter(conn => 
        filteredPersonIds.has(conn.person1Id) && filteredPersonIds.has(conn.person2Id)
      );
      const legacyConnections = validConnections.filter(conn => 
        conn.person1Id === person.id || conn.person2Id === person.id
      );
      const legacyIsConnected = legacyConnections.length > 0;
      const legacyConnectionStrength = legacyConnections.reduce((sum, conn) => sum + conn.meetingCount, 0);
      
      // より包括的な接続判定
      const finalIsConnected = isConnected || legacyIsConnected;
      const finalConnectionStrength = Math.max(connectionStrength, legacyConnectionStrength);
      
      return {
        id: person.id,
        type: 'person',
        position: { x: (n.x ?? 0), y: (n.y ?? 0) },
        data: {
          name: person.name,
          averageRating: person.averageRating,
          meetingCount: person.meetingCount,
          location: person.location,
          avatar: person.avatar_url,
          company: person.company,
          position: person.position,
          communities: (person as any).communities || [],
          trustScore: (person as any).trustScore || person.averageRating,
          connectionCount: (person as any).connectionCount || person.meetingCount,
          isConnected: finalIsConnected,
          connectionStrength: finalConnectionStrength,
          isFocused: focusedPerson === person.id,
          isRelated: focusedPerson ? (focusedPerson === person.id || 
            connections.some(conn => 
              (conn.person1Id === focusedPerson && conn.person2Id === person.id) ||
              (conn.person2Id === focusedPerson && conn.person1Id === person.id)
            ) || 
            relationships.some(rel => 
              (rel.person1_id === focusedPerson && rel.person2_id === person.id) ||
              (rel.person2_id === focusedPerson && rel.person1_id === person.id)
            )) : true,
        },
        draggable: false, // ノードを動かせないようにする
      } as Node;
    });
  }, [filteredPeople, connections, layoutMode, focusedPerson, relationships]);

  // Convert connections to edges
  const initialEdges: Edge[] = useMemo(() => {
    // フォーカスモードの時は表示する人のIDセットを計算
    let displayPersonIds = new Set(filteredPeople.map(p => p.id));
    
    if (focusedPerson) {
      const relatedPersonIds = new Set<string>();
      relatedPersonIds.add(focusedPerson);
      
      connections.forEach(conn => {
        if (conn.person1Id === focusedPerson) {
          relatedPersonIds.add(conn.person2Id);
        } else if (conn.person2Id === focusedPerson) {
          relatedPersonIds.add(conn.person1Id);
        }
      });
      
      relationships.forEach(rel => {
        if (rel.person1_id === focusedPerson) {
          relatedPersonIds.add(rel.person2_id);
        } else if (rel.person2_id === focusedPerson) {
          relatedPersonIds.add(rel.person1_id);
        }
      });
      
      displayPersonIds = relatedPersonIds;
    }
    
    return connections
      .filter(conn => 
        displayPersonIds.has(conn.person1Id) && 
        displayPersonIds.has(conn.person2Id)
      )
      .map(connection => ({
        id: `${connection.person1Id}-${connection.person2Id}`,
        source: connection.person1Id,
        target: connection.person2Id,
        type: 'connection',
        data: {
          strength: connection.meetingCount,
          averageRating: connection.averageRating,
          lastMeeting: connection.lastMeeting,
        },
        animated: connection.meetingCount > 3,
        }));
  }, [connections, filteredPeople, focusedPerson, relationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes when layout or data changes
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when data changes  
  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);
  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target) return;
      
      // Find the connected people
      const sourcePerson = people.find(p => p.id === params.source);
      const targetPerson = people.find(p => p.id === params.target);
      
      if (!sourcePerson || !targetPerson) {
        toast({
          title: language === 'ja' ? "エラー" : "Error",
          description: language === 'ja' ? "接続に失敗しました" : "Failed to connect",
          variant: "destructive",
        });
        return;
      }

      try {
        // Create a new meeting record for this connection
        const newMeeting = {
          myName: sourcePerson.name,
          otherName: targetPerson.name,
          location: sourcePerson.location || targetPerson.location || 'Network Connection',
          rating: 5, // Default rating for manual connections
          trustworthiness: 4,
          expertise: 4,
          communication: 4,
          collaboration: 4,
          leadership: 3,
          innovation: 3,
          integrity: 4,
          detailedFeedback: language === 'ja' 
            ? `${sourcePerson.name}と${targetPerson.name}がネットワーク上で接続されました。`
            : `${sourcePerson.name} and ${targetPerson.name} connected through the network.`
        };

        await addMeeting(newMeeting);
        
        // Add the edge to the graph
        setEdges((eds) => addEdge(params, eds));
        
        toast({
          title: language === 'ja' ? "接続完了" : "Connection Created",
          description: language === 'ja' 
            ? `${sourcePerson.name}と${targetPerson.name}が接続されました！` 
            : `${sourcePerson.name} and ${targetPerson.name} are now connected!`,
        });
        
        setIsConnectMode(false);
      } catch (error) {
        console.error('Failed to create connection:', error);
        toast({
          title: language === 'ja' ? "エラー" : "Error",
          description: language === 'ja' ? "接続の保存に失敗しました" : "Failed to save connection",
          variant: "destructive",
        });
      }
    },
    [setEdges, people, addMeeting, toast, language]
  );

  const handleNodeClick = useCallback((event: any, node: Node) => {
    const person = people.find(p => p.id === node.id);
    if (person) {
      // フォーカスモードの切り替え
      if (focusedPerson === person.id) {
        setFocusedPerson(null);
        setZoomLevel(1);
      } else {
        setFocusedPerson(person.id);
        setZoomLevel(2);
      }
      setSelectedPerson(person);
      setShowRelationshipDetail(true);
      onNodeClick?.(person);
    }
  }, [people, onNodeClick, focusedPerson]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        className={`bg-network-bg ${isConnectMode ? 'cursor-crosshair' : ''}`}
        connectionLineType={ConnectionLineType.Straight}
      >
        <Background color="hsl(var(--network-edge))" gap={20} />
        <Controls className="bg-card border border-border" />
        <MiniMap 
          className="bg-card border border-border"
          nodeColor="hsl(var(--network-node))"
          maskColor="hsl(var(--network-bg) / 0.8)"
        />
        
        <Panel position="top-left" className="space-y-2 max-w-sm">
          {/* Focus Mode Info */}
          {focusedPerson && (
            <div className="bg-primary/10 backdrop-blur-sm p-3 rounded-lg border border-primary/20">
              <div className="text-sm font-semibold text-primary mb-1">
                {language === 'ja' ? 'フォーカスモード' : 'Focus Mode'}
              </div>
              <div className="text-xs text-primary/80">
                {language === 'ja' 
                  ? `${selectedPerson?.name || 'Unknown'}の人間関係を表示中`
                  : `Showing ${selectedPerson?.name || 'Unknown'}'s connections`
                }
              </div>
              <Button 
                onClick={() => {setFocusedPerson(null); setZoomLevel(1);}}
                variant="outline"
                size="sm"
                className="mt-2 h-6 text-xs"
              >
                {language === 'ja' ? '全体表示に戻る' : 'Back to Full View'}
              </Button>
            </div>
          )}
          
          {/* LinkedIn Connection Suggestion */}
          {!focusedPerson && (
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 backdrop-blur-sm p-3 rounded-lg border border-blue-500/20">
              <div className="text-sm font-semibold text-blue-600 mb-1">
                {language === 'ja' ? 'ネットワークを拡張' : 'Expand Network'}
              </div>
              <div className="text-xs text-blue-600/80 mb-2">
                {language === 'ja' 
                  ? 'LinkedInと連携して人間関係を一気に可視化'
                  : 'Connect LinkedIn to visualize your network instantly'
                }
              </div>
              <LinkedInConnector />
            </div>
          )}
          {/* Layout Mode Controls */}
          <div className="bg-card/95 backdrop-blur-sm p-2 rounded-lg border border-border space-y-2">
            <div className="text-xs font-semibold text-foreground mb-2">
              {language === 'ja' ? 'レイアウト' : 'Layout'}
            </div>
            <div className="grid grid-cols-2 gap-1">
              <Button
                onClick={() => setLayoutMode('force')}
                variant={layoutMode === 'force' ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
              >
                <Zap className="w-3 h-3 mr-1" />
                {language === 'ja' ? 'フォース' : 'Force'}
              </Button>
              <Button
                onClick={() => setLayoutMode('hierarchical')}
                variant={layoutMode === 'hierarchical' ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
              >
                <Users2 className="w-3 h-3 mr-1" />
                {language === 'ja' ? '階層' : 'Hierarchy'}
              </Button>
              <Button
                onClick={() => setLayoutMode('circular')}
                variant={layoutMode === 'circular' ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
              >
                <Globe className="w-3 h-3 mr-1" />
                {language === 'ja' ? '円形' : 'Circular'}
              </Button>
              <Button
                onClick={() => setLayoutMode('community')}
                variant={layoutMode === 'community' ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
              >
                <Building2 className="w-3 h-3 mr-1" />
                {language === 'ja' ? 'グループ' : 'Groups'}
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('search.people')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/95 backdrop-blur-sm"
            />
          </div>
          
          {/* Connection Mode Toggle */}
          <Button
            onClick={() => setIsConnectMode(!isConnectMode)}
            variant={isConnectMode ? "default" : "outline"}
            size="sm"
            className="w-full"
          >
            {isConnectMode 
              ? (language === 'ja' ? '接続モード終了' : 'Exit Connect Mode')
              : (language === 'ja' ? '手動接続モード' : 'Manual Connect Mode')
            }
          </Button>
          
          {isConnectMode && (
            <div className="bg-primary/10 p-2 rounded text-xs text-primary">
              {language === 'ja' 
                ? 'ノードをドラッグして新しい接続を作成' 
                : 'Drag from one node to another to create a connection'
              }
            </div>
          )}
          
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={locationFilter === '' ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setLocationFilter('')}
              >
                {t('search.all')}
              </Badge>
              {locations.map((location) => (
                <Badge
                  key={location}
                  variant={locationFilter === location ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setLocationFilter(location)}
                >
                  {location}
                </Badge>
              ))}
            </div>
          )}
        </Panel>

        {/* Stats & legend */}
        <Panel position="top-right">
          <div className="bg-card/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-soft space-y-2 text-sm">
            <div className="space-y-1">
              <div className="font-semibold text-foreground">
                {filteredPeople.length} {t('stats.totalPeople')}
              </div>
              <div className="text-muted-foreground">
                {connections.length} {t('search.connections')}
              </div>
            </div>
            <div className="h-px w-full bg-border" />
            <div className="space-y-1">
              <div className="font-semibold">Legend</div>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5 text-xs">
                <li>Node size = connection count</li>
                <li>Node color = trust score</li>
                <li>Edge width = meeting count</li>
                <li>Edge color = average rating</li>
              </ul>
            </div>
          </div>
        </Panel>
      </ReactFlow>

      {/* 関係性詳細パネル */}
      {showRelationshipDetail && selectedPerson && (
        <RelationshipDetailPanel
          person={selectedPerson}
          onClose={() => {
            setShowRelationshipDetail(false);
            setSelectedPerson(null);
          }}
        />
      )}

      {/* 従来の人物プロフィール（PersonProfile）も残す */}
      {selectedPerson && !showRelationshipDetail && (
        <PersonProfile
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
};

export default NetworkGraph;