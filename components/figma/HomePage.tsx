import { useState } from 'react';
import { RoomCard } from './RoomCard';
import { Button } from '../button';
import { Input } from '../input';
import { Badge } from '../badge';
import { Card } from '../card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../dialog';
import { Textarea } from '../textarea';
import { Label } from '../label';
import { ImageWithFallback } from '../ImageWithFallback';
import { 
  Plus, 
  Search, 
  Mic, 
  Users, 
  Settings, 
  Bell,
  TrendingUp,
  Music,
  BookOpen,
  Coffee,
  Gamepad2,
  Gift,
  Crown,
  Sparkles,
  Flame,
  Filter
} from 'lucide-react-native';

interface Room {
  id: string;
  name: string;
  topic: string;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  image?: string;
  category: string;
  isHot?: boolean;
  speakers: Array<{
    id: string;
    name: string;
    avatar?: string;
    isSpeaking: boolean;
    role?: 'owner' | 'speaker' | 'listener';
  }>;
}

interface HomePageProps {
  onRoomJoin: (roomId: string) => void;
  onProfileOpen: () => void;
}

export function HomePage({ onRoomJoin, onProfileOpen }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const categories = [
    { name: 'الكل', icon: null, color: 'from-purple-500 to-pink-500' },
    { name: 'مشهور', icon: Flame, color: 'from-orange-500 to-red-500' },
    { name: 'تقنية', icon: Settings, color: 'from-blue-500 to-cyan-500' },
    { name: 'موسيقى', icon: Music, color: 'from-pink-500 to-rose-500' },
    { name: 'تعليم', icon: BookOpen, color: 'from-green-500 to-emerald-500' },
    { name: 'اجتماعي', icon: Coffee, color: 'from-orange-500 to-yellow-500' }
  ];

  const rooms: Room[] = [
    {
      id: '1',
      name: 'وحكايةُ صُحبةٍ وحلاوةُ',
      topic: 'غرفة قهوة الشباب و الأنبساط',
      participants: 457,
      maxParticipants: 500,
      isLive: true,
      isHot: true,
      category: 'اجتماعي',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
      speakers: [
        {
          id: '1',
          name: 'أحمد محمد',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
          isSpeaking: true,
          role: 'owner'
        },
        {
          id: '2',
          name: 'سارة أحمد',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c58c?w=50&h=50&fit=crop&crop=face',
          isSpeaking: false,
          role: 'speaker'
        },
        {
          id: '3',
          name: 'محمد',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
          isSpeaking: false,
          role: 'speaker'
        }
      ]
    },
    {
      id: '2',
      name: 'قهوة صباحية و إهداءات',
      topic: 'غاية ذوكل وكالة المائة الراقية',
      participants: 430,
      maxParticipants: 500,
      isLive: true,
      isHot: true,
      category: 'موسيقى',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
      speakers: [
        {
          id: '4',
          name: 'ديانا',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
          isSpeaking: true,
          role: 'owner'
        },
        {
          id: '5',
          name: 'محمد',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face',
          isSpeaking: false,
          role: 'speaker'
        }
      ]
    },
    {
      id: '3',
      name: 'مقرات منوعة 🌹 وكالة',
      topic: 'أحلى الأوقات مع الأصدقاء',
      participants: 408,
      maxParticipants: 500,
      isLive: true,
      category: 'اجتماعي',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
      speakers: [
        {
          id: '6',
          name: 'نور',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face',
          isSpeaking: true,
          role: 'owner'
        }
      ]
    },
    {
      id: '4',
      name: 'وقت الة مدهشة 👑',
      topic: 'لحظات جميلة وذكريات رائعة',
      participants: 354,
      maxParticipants: 400,
      isLive: true,
      category: 'تعليم',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      speakers: [
        {
          id: '7',
          name: 'عبدالله',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
          isSpeaking: true,
          role: 'owner'
        }
      ]
    },
    {
      id: '5',
      name: 'ديك مسابقات',
      topic: 'مسابقات وألعاب ترفيهية',
      participants: 289,
      maxParticipants: 300,
      isLive: false,
      category: 'ألعاب',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
      speakers: [
        {
          id: '8',
          name: 'سلمى',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
          isSpeaking: false,
          role: 'owner'
        }
      ]
    },
    {
      id: '6',
      name: 'غرفة مزاج الخليج',
      topic: 'تراث وثقافة الخليج العربي',
      participants: 201,
      maxParticipants: 300,
      isLive: true,
      isHot: true,
      category: 'تعليم',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73300?w=400&h=400&fit=crop',
      speakers: [
        {
          id: '9',
          name: 'خالد',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
          isSpeaking: true,
          role: 'owner'
        }
      ]
    }
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'الكل' || 
                          (selectedCategory === 'مشهور' && room.isHot) ||
                          room.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const createRoom = () => {
    if (newRoomName && newRoomTopic) {
      console.log('إنشاء غرفة جديدة:', { name: newRoomName, topic: newRoomTopic });
      setNewRoomName('');
      setNewRoomTopic('');
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 shadow-lg">
        <div className="px-4 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-white text-xs mb-1">🇸🇦</div>
                    <Mic className="text-white mx-auto" size={16} />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles size={8} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-white text-2xl">Dream KSA</h1>
                <p className="text-white/80 text-sm">غرف الدردشة الصوتية</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-xl">
                <Gift size={20} />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-xl">
                <Bell size={20} />
              </Button>
              <div className="relative cursor-pointer" onClick={onProfileOpen}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt="Profile"
                  className="w-10 h-10 rounded-xl border-2 border-white/30"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="ابحث عن غرفة أو موضوع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-12 h-12 rounded-2xl bg-white/90 backdrop-blur-sm border-0 text-gray-700 placeholder:text-gray-500"
            />
          </div>

          {/* Categories */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.name;
              return (
                <Button
                  key={category.name}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex-shrink-0 rounded-xl h-9 px-3 text-sm ${
                    isSelected 
                      ? `bg-white text-purple-600 hover:bg-white/90` 
                      : `bg-white/20 text-white border-white/30 hover:bg-white/30`
                  }`}
                >
                  {IconComponent && <IconComponent size={14} className="ml-1" />}
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg text-gray-800">
              {selectedCategory === 'الكل' ? 'جميع الغرف' : 
               selectedCategory === 'مشهور' ? 'الغرف الشائعة' : 
               `غرف ${selectedCategory}`}
            </h2>
            <Badge className="bg-purple-100 text-purple-600 rounded-full">
              {filteredRooms.length} غرفة
            </Badge>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl shadow-lg">
                <Plus size={16} className="ml-1" />
                إنشاء غرفة
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">إنشاء غرفة جديدة</DialogTitle>
                <DialogDescription className="text-center text-gray-600">
                  أنشئ غرفة دردشة صوتية جديدة واختر موضوع المناقشة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div>
                  <Label htmlFor="roomName" className="text-gray-700">اسم الغرفة</Label>
                  <Input
                    id="roomName"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="أدخل اسم الغرفة"
                    className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-purple-400"
                  />
                </div>
                <div>
                  <Label htmlFor="roomTopic" className="text-gray-700">موضوع الغرفة</Label>
                  <Textarea
                    id="roomTopic"
                    value={newRoomTopic}
                    onChange={(e) => setNewRoomTopic(e.target.value)}
                    placeholder="اكتب وصف الغرفة..."
                    rows={3}
                    className="mt-2 rounded-xl border-2 border-gray-200 focus:border-purple-400"
                  />
                </div>
                <Button 
                  onClick={createRoom} 
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl shadow-lg"
                >
                  إنشاء الغرفة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-2 gap-4 pb-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              {...room}
              onClick={() => onRoomJoin(room.id)}
            />
          ))}
        </div>

        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500 text-lg">لا توجد غرف متاحة</p>
            <p className="text-gray-400 text-sm">جرب البحث عن شيء آخر أو فئة مختلفة</p>
          </div>
        )}
      </div>
    </div>
  );
}