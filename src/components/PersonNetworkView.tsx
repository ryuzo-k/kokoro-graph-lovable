import { useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PersonNode from './PersonNode';
import ConnectionEdge from './ConnectionEdge';
import { Person } from '@/hooks/usePeople';
import { Meeting } from '@/hooks/useMeetings';
import { Community } from '@/hooks/useCommunities';

interface PersonNetworkViewProps {
  centerPerson: Person & {
    averageRating: number;
    meetingCount: number;
    meetings: Meeting[];
  };
  connectedPeople: Array<Person & {
    averageRating: number;
    meetingCount: number;
    meetings: Meeting[];
  }>;
  userCommunities: Community[];
}

const nodeTypes = {
  person: PersonNode,
};

const edgeTypes = {
  connection: ConnectionEdge,
};

const PersonNetworkView = ({ centerPerson, connectedPeople, userCommunities }: PersonNetworkViewProps) => {
  // Create nodes with center person at the center
  const nodes: Node[] = useMemo(() => {
    const centerNode: Node = {
      id: centerPerson.id,
      type: 'person',
      position: { x: 0, y: 0 },
      data: {
        name: centerPerson.name,
        averageRating: centerPerson.averageRating,
        meetingCount: centerPerson.meetingCount,
        location: centerPerson.location,
        avatar: centerPerson.avatar_url,
        company: centerPerson.company,
        position: centerPerson.position,
        communities: centerPerson.meetings
          ?.map(m => m.community_id)
          .filter(Boolean)
          .map(id => userCommunities.find(c => c.id === id)?.name)
          .filter(Boolean) || [],
        trustScore: centerPerson.averageRating,
        connectionCount: centerPerson.meetingCount,
      },
      className: 'center-person',
    };

    const connectedNodes: Node[] = connectedPeople.map((person, index) => {
      const angle = (index / connectedPeople.length) * 2 * Math.PI;
      const radius = 150;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Check if they share communities with the user
      const personCommunities = person.meetings
        ?.map(m => m.community_id)
        .filter(Boolean)
        .map(id => userCommunities.find(c => c.id === id)?.name)
        .filter(Boolean) || [];

      const sharedCommunities = personCommunities.filter(
        pc => userCommunities.some(uc => uc.name === pc)
      );

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
          communities: personCommunities,
          trustScore: person.averageRating,
          connectionCount: person.meetingCount,
          sharedCommunities: sharedCommunities,
        },
        className: sharedCommunities.length > 0 ? 'shared-community' : '',
      };
    });

    return [centerNode, ...connectedNodes];
  }, [centerPerson, connectedPeople, userCommunities]);

  // Create edges from center to all connected people
  const edges: Edge[] = useMemo(() => {
    return connectedPeople.map(person => {
      // Find meetings between center person and this person
      const connectionMeetings = centerPerson.meetings?.filter(
        m => m.other_name === person.name
      ) || [];

      const averageRating = connectionMeetings.length > 0
        ? connectionMeetings.reduce((sum, m) => sum + m.rating, 0) / connectionMeetings.length
        : 3;

      return {
        id: `${centerPerson.id}-${person.id}`,
        source: centerPerson.id,
        target: person.id,
        type: 'connection',
        data: {
          strength: connectionMeetings.length,
          averageRating,
          lastMeeting: connectionMeetings[0]?.created_at,
        },
        animated: connectionMeetings.length > 2,
      };
    });
  }, [centerPerson, connectedPeople]);

  return (
    <div className="w-full h-48 border border-border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="hsl(var(--network-edge))" gap={10} size={0.5} />
        <style>
          {`
            .center-person .react-flow__node {
              border: 2px solid hsl(var(--primary));
              box-shadow: 0 0 10px hsl(var(--primary) / 0.3);
            }
            .shared-community .react-flow__node {
              border: 2px solid hsl(var(--accent));
              background: hsl(var(--accent) / 0.1);
            }
          `}
        </style>
      </ReactFlow>
    </div>
  );
};

export default PersonNetworkView;