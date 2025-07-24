import { useCallback, useMemo, useState } from 'react';
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
import { Search, Filter } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Person } from '@/hooks/usePeople';
import { Meeting, useMeetings } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<PersonWithStats | null>(null);
  const [isConnectMode, setIsConnectMode] = useState(false);

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

  // Compute force-directed layout positions using d3-force
  const initialNodes: Node[] = useMemo(() => {
    // Prepare d3 simulation nodes & links
    const d3Nodes: (SimulationNodeDatum & { id: string; person: PersonWithStats })[] =
      filteredPeople.map(p => ({ id: p.id, person: p }));

    // Filter connections to only include people that exist in filteredPeople
    const filteredPersonIds = new Set(filteredPeople.map(p => p.id));
    const validConnections = connections.filter(conn => 
      filteredPersonIds.has(conn.person1Id) && filteredPersonIds.has(conn.person2Id)
    );

    const d3Links: SimulationLinkDatum<(typeof d3Nodes)[number]>[] = validConnections.map(conn => ({
      source: conn.person1Id,
      target: conn.person2Id,
      strength: conn.meetingCount,
    }));

    // Create simulation
    const sim = forceSimulation(d3Nodes)
      .force('link', forceLink(d3Links).id(d => (d as any).id).distance(120))
      .force('charge', forceManyBody().strength(-250))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide().radius(90))
      .stop();

    // Run a fixed number of iterations synchronously
    for (let i = 0; i < 200; i++) sim.tick();

    // Map to React Flow nodes
    return d3Nodes.map(n => {
      const person = n.person;
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
        },
        draggable: true,
      } as Node;
    });
  }, [filteredPeople, connections]);

  // Convert connections to edges
  const initialEdges: Edge[] = useMemo(() => {
    const filteredPersonIds = new Set(filteredPeople.map(p => p.id));
    
    return connections
      .filter(conn => 
        filteredPersonIds.has(conn.person1Id) && 
        filteredPersonIds.has(conn.person2Id)
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
  }, [connections, filteredPeople]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
      setSelectedPerson(person);
      onNodeClick?.(person);
    }
  }, [people, onNodeClick]);

  // Update nodes when data changes
  useMemo(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useMemo(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

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

      {selectedPerson && (
        <PersonProfile
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
};

export default NetworkGraph;