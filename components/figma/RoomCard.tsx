import { ImageWithFallback } from '../ImageWithFallback';
import { Card } from '../card';
import { Badge } from '../badge';
import { Users, Mic, Volume2, Crown, Flame } from 'lucide-react-native';

interface RoomCardProps {
  id: string;
  name: string;
  topic: string;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  image?: string;
  isHot?: boolean;
  speakers: Array<{
    id: string;
    name: string;
    avatar?: string;
    isSpeaking: boolean;
  }>;
  onClick: () => void;
}

export function RoomCard({ 
  name, 
  topic, 
  participants, 
  maxParticipants, 
  isLive, 
  image, 
  isHot,
  speakers,
  onClick 
}: RoomCardProps) {
  const mainSpeaker = speakers.find(s => s.isSpeaking) || speakers[0];
  
  return (
    <Card 
      className="relative p-0 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-white border-0 shadow-lg rounded-3xl overflow-hidden h-48" 
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src={image || `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop`}
          alt={name}
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
      </div>

      {/* Top badges */}
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        {isHot && (
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <Flame size={12} />
            <span>شائع</span>
          </Badge>
        )}
        {isLive && (
          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-xs px-2 py-1 rounded-full flex items-center space-x-1 animate-pulse">
            <Volume2 size={12} />
            <span>مباشر</span>
          </Badge>
        )}
      </div>

      {/* Main Speaker Avatar */}
      {mainSpeaker && (
        <div className="absolute top-4 left-4">
          <div className="relative">
            <ImageWithFallback
              src={mainSpeaker.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face`}
              alt={mainSpeaker.name}
              className="w-12 h-12 rounded-full border-3 border-white shadow-lg"
            />
            {mainSpeaker.isSpeaking && (
              <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse"></div>
            )}
            {speakers.find(s => s.id === mainSpeaker.id)?.role === 'owner' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Crown size={10} className="text-white" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-5">
        <div className="space-y-3">
          {/* Room Title */}
          <div>
            <h3 className="text-white text-xl leading-tight mb-1">{name}</h3>
            <p className="text-white/80 text-sm leading-relaxed">{topic}</p>
          </div>

          {/* Bottom Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Participants Count */}
              <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Users size={14} className="text-white" />
                <span className="text-white text-sm">{participants}</span>
              </div>
              
              {/* Speaking Count */}
              <div className="flex items-center space-x-1 bg-green-500/80 backdrop-blur-sm rounded-full px-3 py-1">
                <Mic size={14} className="text-white" />
                <span className="text-white text-sm">{speakers.filter(s => s.isSpeaking).length}</span>
              </div>
            </div>

            {/* Additional Speakers */}
            <div className="flex -space-x-2">
              {speakers.slice(1, 4).map((speaker, index) => (
                <ImageWithFallback
                  key={speaker.id}
                  src={speaker.avatar || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face`}
                  alt={speaker.name}
                  className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                  style={{ zIndex: 10 - index }}
                />
              ))}
              {speakers.length > 4 && (
                <div 
                  className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border-2 border-white flex items-center justify-center shadow-sm"
                  style={{ zIndex: 6 }}
                >
                  <span className="text-gray-700 text-xs">+{speakers.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle corner accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
    </Card>
  );
}