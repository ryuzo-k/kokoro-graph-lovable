import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Star, Users } from 'lucide-react';

interface MeetingData {
  myName: string;
  otherName: string;
  location: string;
  rating: number;
}

interface MeetingFormProps {
  onSubmit: (data: MeetingData) => void;
}

const MeetingForm = ({ onSubmit }: MeetingFormProps) => {
  const [formData, setFormData] = useState<MeetingData>({
    myName: '',
    otherName: '',
    location: '',
    rating: 5
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.myName && formData.otherName) {
      onSubmit(formData);
      setFormData(prev => ({
        ...prev,
        otherName: '',
        rating: 5
      }));
    }
  };

  const ratings = [
    { value: 5, label: '5★ 素晴らしい', color: 'trust-high' },
    { value: 4, label: '4★ 良い', color: 'trust-high' },
    { value: 3, label: '3★ 普通', color: 'trust-medium' },
    { value: 2, label: '2★ あまり', color: 'trust-low' },
    { value: 1, label: '1★ 悪い', color: 'trust-low' }
  ];

  return (
    <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm shadow-card border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-primary" />
          出会いを記録
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="myName" className="text-sm font-medium">
              あなたの名前
            </Label>
            <Input
              id="myName"
              value={formData.myName}
              onChange={(e) => setFormData(prev => ({ ...prev, myName: e.target.value }))}
              placeholder="田中太郎"
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherName" className="text-sm font-medium">
              会った相手
            </Label>
            <Input
              id="otherName"
              value={formData.otherName}
              onChange={(e) => setFormData(prev => ({ ...prev, otherName: e.target.value }))}
              placeholder="佐藤花子"
              className="bg-background/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              場所・地域
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Tokyo, Shibuya"
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Star className="w-4 h-4" />
              評価
            </Label>
            <Select
              value={formData.rating.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}
            >
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ratings.map((rating) => (
                  <SelectItem key={rating.value} value={rating.value.toString()}>
                    <span className={`text-${rating.color}`}>
                      {rating.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={!formData.myName || !formData.otherName}
          >
            記録する
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeetingForm;