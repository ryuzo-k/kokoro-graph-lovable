import { useCallback, useMemo, useState } from 'react';
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PersonNode from './PersonNode';
import ConnectionEdge from './ConnectionEdge';
import PersonProfile from './PersonProfile';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { Person } from '@/hooks/usePeople';
import { Meeting } from '@/hooks/useMeetings';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<PersonWithStats | null>(null);

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

  // Convert people to nodes
  const initialNodes: Node[] = useMemo(() => {
    return filteredPeople.map((person, index) => {
      const angle = (index / filteredPeople.length) * 2 * Math.PI;
      const radius = Math.max(200, filteredPeople.length * 30);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return {
        id: person.id,
        type: 'person',
        position: { x, y },
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
      };
    });
  }, [filteredPeople]);

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
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
        className="bg-network-bg"
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
              placeholder="人を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/95 backdrop-blur-sm"
            />
          </div>
          
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={locationFilter === '' ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setLocationFilter('')}
              >
                All
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

        <Panel position="top-right">
          <div className="bg-card/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-soft">
            <div className="text-sm space-y-1">
              <div className="font-semibold text-foreground">
                {filteredPeople.length} 人
              </div>
              <div className="text-muted-foreground">
                {connections.length} つながり
              </div>
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