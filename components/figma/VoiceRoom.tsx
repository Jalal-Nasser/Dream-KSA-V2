import { useState } from 'react';
import { ImageWithFallback } from '../ImageWithFallback';
import { Button } from '../button';
import { Card } from '../card';
import { Badge } from '../badge';
import { Input } from '../input';
import { Sheet, SheetContent, SheetTrigger } from '../sheet';
import { 
  Mic, 
  MicOff, 
  Hand, 
  MessageCircle, 
  Users, 
  Settings, 
  ArrowLeft,
  Send,
  Crown,
  MoreVertical,
  Volume2,
  Gift,
  Sparkles
} from 'lucide-react-native';

interface User {
  id: string;
  name: string;
  avatar?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  role: 'owner' | 'speaker' | 'listener';
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface VoiceRoomProps {
  roomName: string;
  roomTopic: string;
  onBack: () => void;
}

export function VoiceRoom({ roomName, roomTopic, onBack }: VoiceRoomProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: '1',
      userName: 'أحمد',
      message: 'مرحباً بالجميع في الغرفة 👋',
      timestamp: new Date()
    },
    {
      id: '2',
      userId: '2',
      userName: 'فاطمة',
      message: 'أهلاً وسهلاً بكم جميعاً 🌸',
      timestamp: new Date()
    }
  ]);

  const speakers: User[] = [
    {
      id: '1',
      name: 'محمد أحمد',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      isSpeaking: true,
      isMuted: false,
      isHandRaised: false,
      role: 'owner'
    },
    {
      id: '2',
      name: 'سارة محمد',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c58c?w=80&h=80&fit=crop&crop=face',
      isSpeaking: false,
      isMuted: false,
      isHandRaised: false,
      role: 'speaker'
    },
    {
      id: '3',
      name: 'علي حسن',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      isSpeaking: false,
      isMuted: true,
      isHandRaised: false,
      role: 'speaker'
    }
  ];

  const listeners: User[] = [
    {
      id: '4',
      name: 'نور أحمد',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      isSpeaking: false,
      isMuted: true,
      isHandRaised: true,
      role: 'listener'
    },
    {
      id: '5',
      name: 'يوسف محمد',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      isSpeaking: false,
      isMuted: true,
      isHandRaised: false,
      role: 'listener'
    },
    {
      id: '6',
      name: 'ليلى',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face',
      isSpeaking: false,
      isMuted: true,
      isHandRaised: false,
      role: 'listener'
    }
  ];

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        userId: 'current-user',
        userName: 'أنت',
        message: message.trim(),
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 shadow-lg">
        <div className="flex items-center justify-between p-4 pt-12">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/20 rounded-xl">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-white text-lg">{roomName}</h2>
              <p className="text-white/80 text-sm">{roomTopic}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm rounded-xl">
              <Users size={12} className="ml-1" />
              {speakers.length + listeners.length}
            </Badge>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-xl">
              <Gift size={20} />
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-xl">
              <MoreVertical size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Room Content */}
      <div className="flex-1 overflow-hidden p-4">
        {/* Stage Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Mic size={12} className="text-white" />
            </div>
            <span className="text-gray-700">المنصة</span>
            <div className="flex-1"></div>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs rounded-full">
              <Volume2 size={10} className="ml-1" />
              مفتوح
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {speakers.map((speaker) => (
              <Card key={speaker.id} className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-3xl relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>
                
                <div className="relative flex flex-col items-center space-y-3">
                  <div className="relative">
                    <ImageWithFallback
                      src={speaker.avatar!}
                      alt={speaker.name}
                      className="w-20 h-20 rounded-2xl shadow-md"
                    />
                    
                    {speaker.role === 'owner' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                        <Crown size={12} className="text-white" />
                      </div>
                    )}
                    
                    {speaker.isSpeaking && (
                      <div className="absolute inset-0 rounded-2xl border-4 border-green-400 animate-pulse"></div>
                    )}
                    
                    {!speaker.isSpeaking && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-gray-200"></div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-800 text-sm truncate w-20 mb-1">{speaker.name}</p>
                    <div className="flex items-center justify-center">
                      {speaker.isMuted ? (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <MicOff size={12} className="text-white" />
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          speaker.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`}>
                          <Mic size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Audience Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Users size={12} className="text-white" />
            </div>
            <span className="text-gray-700">الجمهور</span>
            <Badge className="bg-gray-100 text-gray-600 text-xs rounded-full">
              {listeners.length} مستمع
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {listeners.map((listener) => (
              <div key={listener.id} className="relative">
                <ImageWithFallback
                  src={listener.avatar!}
                  alt={listener.name}
                  className="w-12 h-12 rounded-2xl shadow-md"
                />
                {listener.isHandRaised && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                    <Hand size={10} className="text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 p-4">
        <div className="flex items-center justify-center space-x-6">
          <Button
            variant={isHandRaised ? "default" : "outline"}
            size="lg"
            className={`rounded-full w-16 h-16 shadow-lg ${
              isHandRaised 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0' 
                : 'bg-white hover:bg-gray-50 border-2 border-gray-200'
            }`}
            onClick={() => setIsHandRaised(!isHandRaised)}
          >
            <Hand size={24} />
          </Button>
          
          <Button
            variant={isMuted ? "destructive" : "default"}
            size="lg"
            className={`rounded-full w-20 h-20 shadow-xl ${
              isMuted 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
            } text-white border-0`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full w-16 h-16 bg-white hover:bg-gray-50 border-2 border-gray-200 shadow-lg"
              >
                <MessageCircle size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-96 rounded-t-3xl border-0 shadow-2xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageCircle className="text-purple-600" size={20} />
                  <h3 className="text-lg text-gray-800">الدردشة</h3>
                  <div className="flex-1"></div>
                  <Badge className="bg-purple-100 text-purple-600 rounded-full">
                    {messages.length} رسالة
                  </Badge>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-purple-600">{msg.userName}</span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString('ar', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{msg.message}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="اكتب رسالة..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="h-12 rounded-2xl border-2 border-gray-200 focus:border-purple-400"
                  />
                  <Button 
                    onClick={sendMessage}
                    className="h-12 w-12 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg"
                  >
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}