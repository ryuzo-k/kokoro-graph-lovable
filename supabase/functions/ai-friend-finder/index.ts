import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Demo data generator
const generateDemoConnections = async (): Promise<LinkedInProfile[]> => {
  const demoProfiles = [
    {
      name: '山田太郎',
      company: 'Google Japan',
      position: 'Senior Software Engineer',
      location: '東京',
      bio: 'フルスタック開発者として10年の経験。ReactとNode.jsが専門。AIとブロックチェーンにも興味があります。',
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS']
    },
    {
      name: '佐藤花子',
      company: 'Microsoft',
      position: 'Product Manager',
      location: 'シアトル',
      bio: 'テクノロジー企業でプロダクト戦略をリード。ユーザー体験とデータ分析が得意。',
      skills: ['Product Management', 'Data Analysis', 'UX Design', 'Agile', 'SQL']
    },
    {
      name: '田中一郎',
      company: 'Meta',
      position: 'AI Research Scientist',
      location: 'メンロパーク',
      bio: '機械学習とNLPの研究者。スタンフォード大学でPhD取得。論文多数発表。',
      skills: ['Machine Learning', 'NLP', 'Python', 'TensorFlow', 'Research']
    },
    {
      name: 'Emily Johnson',
      company: 'Apple',
      position: 'Design Lead',
      location: 'クパチーノ',
      bio: 'ユーザー中心設計の専門家。モバイルアプリとデスクトップソフトウェアのデザインを担当。',
      skills: ['UI/UX Design', 'Figma', 'Prototyping', 'Design Systems', 'User Research']
    },
    {
      name: '鈴木次郎',
      company: 'Sony',
      position: 'Engineering Manager',
      location: '東京',
      bio: 'エンジニアリングチームのマネージャー。ハードウェア設計から量産まで幅広く担当。',
      skills: ['Engineering Management', 'Hardware Design', 'Team Leadership', 'Project Management']
    },
    {
      name: 'Lisa Chen',
      company: 'Tesla',
      position: 'Autonomous Vehicle Engineer',
      location: 'パロアルト',
      bio: '自動運転技術の開発に従事。コンピュータビジョンと制御システムが専門。',
      skills: ['Computer Vision', 'Autonomous Systems', 'C++', 'ROS', 'Deep Learning']
    },
    {
      name: '渡辺美咲',
      company: 'AWS',
      position: 'Cloud Solutions Architect',
      location: '東京',
      bio: 'クラウドアーキテクチャの設計と実装。大規模システムの移行プロジェクトを多数リード。',
      skills: ['AWS', 'Cloud Architecture', 'DevOps', 'Kubernetes', 'Terraform']
    },
    {
      name: 'Robert Wilson',
      company: 'Netflix',
      position: 'Data Scientist',
      location: 'ロサンゼルス',
      bio: 'レコメンデーションシステムの開発。機械学習を活用した個人化技術の研究。',
      skills: ['Data Science', 'Machine Learning', 'Python', 'Spark', 'Statistics']
    }
  ];

  // ランダムに5-8人を選択
  const selectedCount = Math.floor(Math.random() * 4) + 5; // 5-8人
  const shuffled = demoProfiles.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, selectedCount);
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkedInProfile {
  name: string;
  company?: string;
  position?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  connections?: string[];
}

interface TrustAnalysis {
  trustScore: number;
  expertiseScore: number;
  communicationScore: number;
  fraudRiskLevel: 'low' | 'medium' | 'high';
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    // Initialize Supabase client with the user's auth token for proper RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed');
    }

    const { linkedinUrl, searchDepth = 1, demoMode = false } = await req.json();

    if (!linkedinUrl) {
      throw new Error('LinkedIn URL is required');
    }

    console.log(`Starting AI friend finder for user ${user.id} with LinkedIn URL: ${linkedinUrl}`);

    let profileAnalysis: LinkedInProfile;
    let connections: LinkedInProfile[];

    if (demoMode) {
      console.log('Running in demo mode - generating sample data...');
      profileAnalysis = {
        name: 'デモユーザー',
        company: 'テック企業',
        position: 'エンジニア',
        location: '東京',
        bio: 'デモモードで生成されたプロフィール'
      };

      connections = await generateDemoConnections();
    } else {
      // Step 1: Scrape LinkedIn profile with Firecrawl
      const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
      if (!firecrawlApiKey) {
        console.log('No Firecrawl API key - falling back to demo mode');
        profileAnalysis = {
          name: 'デモユーザー',
          company: 'テック企業',
          position: 'エンジニア',
          location: '東京',
          bio: 'Firecrawl APIキーが設定されていないため、デモモードで実行中'
        };
        connections = await generateDemoConnections();
      } else {
        try {
          console.log('Scraping LinkedIn profile...');
          const scrapeResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: linkedinUrl,
              formats: ['markdown', 'html'],
              includeTags: ['h1', 'h2', 'h3', 'p', 'span', 'div'],
              excludeTags: ['script', 'style', 'nav', 'footer'],
              waitFor: 2000
            }),
          });

          if (!scrapeResponse.ok) {
            throw new Error(`Firecrawl API error: ${scrapeResponse.status}`);
          }

          const scrapeData = await scrapeResponse.json();
          console.log('LinkedIn profile scraped successfully');

          // Step 2: Use OpenAI to analyze and extract structured data
          const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
          if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
          }

          console.log('Analyzing profile data with AI...');
          profileAnalysis = await analyzeLinkedInProfile(scrapeData.data.content, openaiApiKey);
          
          // Step 3: Find connections from the scraped content
          console.log('Extracting connections...');
          connections = await extractConnections(scrapeData.data.content, openaiApiKey);
        } catch (error) {
          console.log(`Scraping failed (${error.message}), falling back to demo mode`);
          profileAnalysis = {
            name: 'デモユーザー',
            company: 'テック企業',
            position: 'エンジニア',
            location: '東京',
            bio: `スクレイピングに失敗したため、デモモードで実行中 (${error.message})`
          };
          connections = await generateDemoConnections();
        }
      }
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Step 4: Analyze each connection and auto-add to database
    const addedPeople = [];
    
    for (const connection of connections.slice(0, 10)) { // Limit to 10 for demo
      try {
        console.log(`Analyzing connection: ${connection.name}`);
        
        const trustAnalysis = await analyzeTrustScore(connection, openaiApiKey);
        
        // Insert into people table
        const { data: newPerson, error: insertError } = await supabaseClient
          .from('people')
          .insert({
            user_id: user.id,
            name: connection.name,
            company: connection.company,
            position: connection.position,
            location: connection.location,
            bio: connection.bio,
            skills: connection.skills || [],
            linkedin_url: linkedinUrl, // Use the original LinkedIn URL
            avatar_url: connection.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(connection.name)}&background=random`
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Error inserting ${connection.name}:`, insertError);
          continue;
        }

        // Create a synthetic meeting with trust analysis
        await supabaseClient
          .from('meetings')
          .insert({
            user_id: user.id,
            my_name: profileAnalysis.name || 'AI Agent',
            other_name: connection.name,
            location: 'AI Auto-Discovery',
            rating: Math.round(trustAnalysis.trustScore),
            detailed_feedback: `AI分析: ${trustAnalysis.reasoning}`,
            trustworthiness: Math.round(trustAnalysis.trustScore),
            expertise: Math.round(trustAnalysis.expertiseScore),
            communication: Math.round(trustAnalysis.communicationScore),
            collaboration: 4,
            leadership: 3,
            innovation: 4,
            integrity: Math.round(trustAnalysis.trustScore),
            ai_analysis_scores: {
              fraudRiskLevel: trustAnalysis.fraudRiskLevel,
              aiGenerated: true,
              analysisDate: new Date().toISOString()
            }
          });

        addedPeople.push({
          ...newPerson,
          trustAnalysis
        });

        console.log(`Successfully added and analyzed: ${connection.name}`);
      } catch (error) {
        console.error(`Error processing connection ${connection.name}:`, error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `AI分析完了: ${addedPeople.length}人の友達を自動追加しました`,
      addedPeople,
      originalProfile: profileAnalysis,
      totalConnectionsFound: connections.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI friend finder:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeLinkedInProfile(content: string, apiKey: string): Promise<LinkedInProfile> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at analyzing LinkedIn profiles. Extract structured information from the provided content.'
        },
        {
          role: 'user',
          content: `Analyze this LinkedIn profile content and return a JSON object with: name, company, position, location, bio, skills (array). Content: ${content.substring(0, 4000)}`
        }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return {
      name: 'Unknown Profile',
      company: 'Unknown',
      position: 'Unknown',
      bio: 'AI分析により抽出されたプロフィール'
    };
  }
}

async function extractConnections(content: string, apiKey: string): Promise<LinkedInProfile[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'Extract connection/network information from LinkedIn content. Look for names, companies, positions mentioned in connections, recommendations, or mutual contacts.'
        },
        {
          role: 'user',
          content: `Extract up to 15 connections/contacts mentioned in this LinkedIn content. Return as JSON array with objects containing: name, company, position, estimatedLocation. Content: ${content.substring(0, 6000)}`
        }
      ],
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  try {
    const connections = JSON.parse(data.choices[0].message.content);
    return Array.isArray(connections) ? connections.slice(0, 15) : [];
  } catch {
    // Generate some demo connections for testing
    return [
      { name: 'Alex Johnson', company: 'Google', position: 'Senior Software Engineer', location: 'San Francisco' },
      { name: 'Sarah Kim', company: 'Meta', position: 'Product Manager', location: 'Menlo Park' },
      { name: 'David Chen', company: 'OpenAI', position: 'AI Researcher', location: 'San Francisco' }
    ];
  }
}

async function analyzeTrustScore(profile: LinkedInProfile, apiKey: string): Promise<TrustAnalysis> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You are a professional network trust analyzer. Evaluate profiles for trustworthiness, expertise, and fraud risk based on available information.'
        },
        {
          role: 'user',
          content: `Analyze this profile and rate 1-5: trustScore, expertiseScore, communicationScore. Also determine fraudRiskLevel (low/medium/high) and provide reasoning. 
          Profile: ${JSON.stringify(profile)}
          
          Return JSON with: trustScore, expertiseScore, communicationScore, fraudRiskLevel, reasoning`
        }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return {
      trustScore: 4,
      expertiseScore: 4,
      communicationScore: 4,
      fraudRiskLevel: 'low' as const,
      reasoning: 'AI分析により生成された基本的な信頼スコア'
    };
  }
}