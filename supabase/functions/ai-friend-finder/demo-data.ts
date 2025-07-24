async function generateDemoConnections(): Promise<LinkedInProfile[]> {
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
}