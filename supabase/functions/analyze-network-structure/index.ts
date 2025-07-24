import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NetworkNode {
  id: string
  name: string
  connections: string[]
  trustScore: number
  meetingCount: number
}

interface NetworkAnalysisResult {
  centrality: { [personId: string]: number }
  influence: { [personId: string]: number }
  bridges: { [personId: string]: number }
  communities: { [personId: string]: string }
  recommendations: Array<{
    personId: string
    suggestedConnections: string[]
    reason: string
  }>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user authentication
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Analyzing network structure for user: ${user.id}`)

    // Fetch network data
    const { data: relationships, error: relationshipsError } = await supabaseClient
      .from('relationships')
      .select('*')

    if (relationshipsError) {
      throw relationshipsError
    }

    const { data: people, error: peopleError } = await supabaseClient
      .from('people')
      .select('*')

    if (peopleError) {
      throw peopleError
    }

    console.log(`Found ${relationships?.length || 0} relationships and ${people?.length || 0} people`)

    // Build network graph
    const nodes = new Map<string, NetworkNode>()
    
    // Initialize nodes
    people?.forEach(person => {
      nodes.set(person.id, {
        id: person.id,
        name: person.name,
        connections: [],
        trustScore: 0,
        meetingCount: 0
      })
    })

    // Build connections and calculate basic metrics
    relationships?.forEach(rel => {
      const node1 = nodes.get(rel.person1_id)
      const node2 = nodes.get(rel.person2_id)
      
      if (node1 && node2) {
        node1.connections.push(rel.person2_id)
        node2.connections.push(rel.person1_id)
        node1.trustScore += rel.trust_score
        node2.trustScore += rel.trust_score
        node1.meetingCount += rel.total_meetings
        node2.meetingCount += rel.total_meetings
      }
    })

    // Normalize trust scores
    nodes.forEach(node => {
      if (node.connections.length > 0) {
        node.trustScore = node.trustScore / node.connections.length
      }
    })

    // Calculate centrality measures
    const centrality: { [personId: string]: number } = {}
    const influence: { [personId: string]: number } = {}
    const bridges: { [personId: string]: number } = {}

    nodes.forEach((node, personId) => {
      // Degree centrality (normalized)
      centrality[personId] = node.connections.length / Math.max(nodes.size - 1, 1)
      
      // Influence score (combination of connections, trust, and meetings)
      influence[personId] = (
        node.connections.length * 0.4 +
        node.trustScore * 0.3 +
        Math.min(node.meetingCount / 10, 1) * 0.3
      )
      
      // Bridge score (connections to different communities)
      const connectedCommunities = new Set<string>()
      node.connections.forEach(connId => {
        const connectedNode = nodes.get(connId)
        if (connectedNode) {
          // Simple community detection based on shared connections
          const sharedConnections = node.connections.filter(c => 
            connectedNode.connections.includes(c)
          ).length
          connectedCommunities.add(sharedConnections > 0 ? 'core' : 'peripheral')
        }
      })
      bridges[personId] = connectedCommunities.size > 1 ? 1 : 0
    })

    // Simple community detection (based on shared connections)
    const communities: { [personId: string]: string } = {}
    const processedNodes = new Set<string>()

    let communityId = 0
    nodes.forEach((node, personId) => {
      if (processedNodes.has(personId)) return

      const community = `community_${communityId++}`
      const queue = [personId]
      
      while (queue.length > 0) {
        const currentId = queue.shift()!
        if (processedNodes.has(currentId)) continue
        
        processedNodes.add(currentId)
        communities[currentId] = community
        
        const currentNode = nodes.get(currentId)
        if (currentNode) {
          // Add highly connected neighbors to same community
          currentNode.connections.forEach(connId => {
            const connectedNode = nodes.get(connId)
            if (connectedNode && !processedNodes.has(connId)) {
              const sharedConnections = currentNode.connections.filter(c => 
                connectedNode.connections.includes(c)
              ).length
              
              // If they share many connections, they're in the same community
              if (sharedConnections >= 2) {
                queue.push(connId)
              }
            }
          })
        }
      }
    })

    // Generate connection recommendations
    const recommendations: Array<{
      personId: string
      suggestedConnections: string[]
      reason: string
    }> = []

    nodes.forEach((node, personId) => {
      const suggestedConnections: string[] = []
      const reasonParts: string[] = []

      // Find people in same community who aren't connected
      const sameCommunity = Object.entries(communities)
        .filter(([id, comm]) => comm === communities[personId] && id !== personId)
        .map(([id]) => id)
        .filter(id => !node.connections.includes(id))

      if (sameCommunity.length > 0) {
        suggestedConnections.push(...sameCommunity.slice(0, 3))
        reasonParts.push('same community')
      }

      // Find highly influential people not yet connected
      const highInfluencePeople = Object.entries(influence)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id)
        .filter(id => id !== personId && !node.connections.includes(id))

      if (highInfluencePeople.length > 0) {
        suggestedConnections.push(...highInfluencePeople.slice(0, 2))
        reasonParts.push('high influence')
      }

      // Find bridge people (good for expanding network reach)
      const bridgePeople = Object.entries(bridges)
        .filter(([id, score]) => score > 0 && id !== personId && !node.connections.includes(id))
        .map(([id]) => id)

      if (bridgePeople.length > 0) {
        suggestedConnections.push(...bridgePeople.slice(0, 2))
        reasonParts.push('network bridges')
      }

      if (suggestedConnections.length > 0) {
        recommendations.push({
          personId,
          suggestedConnections: [...new Set(suggestedConnections)].slice(0, 5),
          reason: reasonParts.join(', ')
        })
      }
    })

    // Store analysis results in database
    for (const [personId, centralityScore] of Object.entries(centrality)) {
      await supabaseClient
        .from('network_analysis')
        .upsert({
          person_id: personId,
          centrality_score: centralityScore,
          influence_score: influence[personId] || 0,
          community_cluster: communities[personId] || 'isolated',
          network_reach: nodes.get(personId)?.connections.length || 0,
          bridge_score: bridges[personId] || 0,
          analyzed_at: new Date().toISOString()
        })
    }

    const analysisResult: NetworkAnalysisResult = {
      centrality,
      influence,
      bridges,
      communities,
      recommendations
    }

    console.log(`Analysis completed. Found ${recommendations.length} recommendations`)

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        summary: {
          totalNodes: nodes.size,
          totalEdges: relationships?.length || 0,
          communities: [...new Set(Object.values(communities))].length,
          recommendations: recommendations.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in network analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})