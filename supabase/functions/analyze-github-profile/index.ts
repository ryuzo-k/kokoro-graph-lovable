import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GitHubUser {
  login: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  company?: string;
  location?: string;
  bio?: string;
}

interface GitHubRepo {
  name: string;
  stargazers_count: number;
  language: string;
  size: number;
  updated_at: string;
  fork: boolean;
  topics: string[];
}

interface GitHubCommitActivity {
  total: number;
  weeks: Array<{
    w: number;
    a: number;
    d: number;
    c: number;
  }>;
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

    // Initialize Supabase client with the user's auth token
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
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !authUser) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed');
    }

    const { username, userId } = await req.json();
    
    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing GitHub profile: ${username}`);

    // GitHub API calls
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!userResponse.ok) {
      throw new Error(`GitHub user not found: ${username}`);
    }
    const githubUser: GitHubUser = await userResponse.json();

    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`);
    if (!reposResponse.ok) {
      throw new Error('Failed to fetch repositories');
    }
    const repos: GitHubRepo[] = await reposResponse.json();

    // Calculate development score
    const analysisResult = calculateGitHubScore(githubUser, repos);
    
    // Update user profile with GitHub analysis using authenticated client
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        github_username: username,
        github_score: analysisResult.score,
        last_analyzed_at: new Date().toISOString(),
        analysis_details: {
          ...analysisResult.details,
          github_analysis: analysisResult.analysis
        }
      })
      .eq('user_id', authUser.id); // Use authenticated user ID

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('Failed to update profile');
    }

    return new Response(
      JSON.stringify({
        success: true,
        score: analysisResult.score,
        analysis: analysisResult.analysis,
        details: analysisResult.details
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in GitHub analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateGitHubScore(user: GitHubUser, repos: GitHubRepo[]) {
  const accountAge = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365));
  const originalRepos = repos.filter(repo => !repo.fork);
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const languages = [...new Set(repos.map(repo => repo.language).filter(Boolean))];
  const recentActivity = repos.filter(repo => 
    new Date(repo.updated_at) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  ).length;

  // Scoring algorithm
  let score = 0;

  // Account age (max 15 points)
  score += Math.min(accountAge * 3, 15);

  // Repository count (max 20 points)
  score += Math.min(originalRepos.length * 2, 20);

  // Stars received (max 25 points)
  if (totalStars > 0) {
    score += Math.min(Math.log10(totalStars + 1) * 8, 25);
  }

  // Language diversity (max 15 points)
  score += Math.min(languages.length * 2, 15);

  // Recent activity (max 15 points)
  score += Math.min(recentActivity * 1.5, 15);

  // Followers (max 10 points)
  score += Math.min(Math.log10(user.followers + 1) * 3, 10);

  score = Math.round(Math.max(0, Math.min(100, score)));

  const analysis = {
    account_age_years: accountAge,
    total_repos: user.public_repos,
    original_repos: originalRepos.length,
    total_stars: totalStars,
    languages_used: languages.length,
    recent_activity_repos: recentActivity,
    followers: user.followers,
    top_languages: languages.slice(0, 5),
    top_starred_repos: repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3)
      .map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count,
        language: repo.language
      }))
  };

  return {
    score,
    analysis,
    details: {
      breakdown: {
        account_age: Math.min(accountAge * 3, 15),
        repository_count: Math.min(originalRepos.length * 2, 20),
        stars_received: totalStars > 0 ? Math.min(Math.log10(totalStars + 1) * 8, 25) : 0,
        language_diversity: Math.min(languages.length * 2, 15),
        recent_activity: Math.min(recentActivity * 1.5, 15),
        followers: Math.min(Math.log10(user.followers + 1) * 3, 10)
      }
    }
  };
}