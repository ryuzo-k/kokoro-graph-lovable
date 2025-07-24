import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Plus, ArrowLeft, Network, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useCommunities } from '@/hooks/useCommunities';
import { useToast } from '@/hooks/use-toast';

const Communities = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDescription, setNewCommunityDescription] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    communities,
    userCommunities,
    loading,
    createCommunity,
    joinCommunity,
    leaveCommunity
  } = useCommunities();

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityName.trim()) return;

    const result = await createCommunity({
      name: newCommunityName,
      description: newCommunityDescription,
      is_public: true
    });

    if (result?.success) {
      setNewCommunityName('');
      setNewCommunityDescription('');
      setShowCreateForm(false);
      toast({
        title: "コミュニティを作成しました",
        description: `${newCommunityName}が正常に作成されました。`
      });
    }
  };

  const handleJoinCommunity = async (communityId: string, communityName: string) => {
    const result = await joinCommunity(communityId);
    if (result?.success) {
      toast({
        title: "コミュニティに参加しました",
        description: `${communityName}に参加しました。`
      });
    }
  };

  const handleLeaveCommunity = async (communityId: string, communityName: string) => {
    const result = await leaveCommunity(communityId);
    if (result?.success) {
      toast({
        title: "コミュニティから退出しました",
        description: `${communityName}から退出しました。`
      });
    }
  };

  const handleViewNetwork = (communityId: string) => {
    navigate(`/network/${communityId}`);
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <div className="flex items-center gap-2">
                <Users className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">コミュニティ</h1>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* My Communities */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">参加中のコミュニティ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCommunities.map((community) => (
              <Card key={community.id} className="bg-card/80 backdrop-blur-sm shadow-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {community.description}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Users className="w-3 h-3 mr-1" />
                      {community.member_count}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleViewNetwork(community.id)}
                      className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
                      size="sm"
                    >
                      <Network className="w-4 h-4 mr-2" />
                      ネットワーク
                    </Button>
                    <Button 
                      onClick={() => handleLeaveCommunity(community.id, community.name)}
                      variant="outline"
                      size="sm"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {userCommunities.length === 0 && (
              <div className="col-span-full text-center py-8">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">まだコミュニティに参加していません</p>
              </div>
            )}
          </div>
        </div>

        {/* All Communities */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">すべてのコミュニティ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((community) => {
              const isMember = userCommunities.some(uc => uc.id === community.id);
              return (
                <Card key={community.id} className="bg-card/80 backdrop-blur-sm shadow-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {community.description}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        {community.member_count}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!isMember ? (
                      <Button 
                        onClick={() => handleJoinCommunity(community.id, community.name)}
                        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        参加する
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleViewNetwork(community.id)}
                          className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
                          size="sm"
                        >
                          <Network className="w-4 h-4 mr-2" />
                          ネットワーク
                        </Button>
                        <Button 
                          onClick={() => handleLeaveCommunity(community.id, community.name)}
                          variant="outline"
                          size="sm"
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Create Community Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-card shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>新しいコミュニティ</CardTitle>
                <Button 
                  onClick={() => setShowCreateForm(false)}
                  variant="ghost"
                  size="sm"
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    コミュニティ名
                  </label>
                  <Input
                    value={newCommunityName}
                    onChange={(e) => setNewCommunityName(e.target.value)}
                    placeholder="例: 東京エンジニア会"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    説明（オプション）
                  </label>
                  <Input
                    value={newCommunityDescription}
                    onChange={(e) => setNewCommunityDescription(e.target.value)}
                    placeholder="コミュニティの説明を入力してください"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
                    disabled={!newCommunityName.trim()}
                  >
                    作成
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Communities;