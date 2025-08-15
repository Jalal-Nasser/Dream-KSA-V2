import { useState } from 'react';
import { Button } from '../button';
import { Card } from '../card';
import { Badge } from '../badge';
import { ImageWithFallback } from '../ImageWithFallback';
import { 
  Edit3,
  CheckCircle,
  Crown,
  Medal,
  Radio,
  ShoppingBag,
  Building2,
  Gift,
  Clock,
  Headphones,
  Globe,
  Settings,
  Home,
  MessageSquare,
  BookOpen,
  Zap,
  Users,
  ChevronRight,
  Star,
  Coins,
  Trophy,
  Gamepad2
} from 'lucide-react-native';

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const [selectedTab, setSelectedTab] = useState('أنا');

  const stats = [
    { label: 'الأوزار', value: 4, color: 'text-red-500' },
    { label: 'المعجبين', value: 0, color: 'text-gray-500' },
    { label: 'المتابعين', value: 1, color: 'text-gray-700' }
  ];

  const achievements = [
    { name: 'الأوسمة', color: 'from-pink-400 to-rose-400', icon: Medal },
    { name: 'مستوى', color: 'from-yellow-400 to-orange-400', icon: Trophy }
  ];

  const menuItems = [
    { 
      name: 'محطة', 
      icon: Radio, 
      iconColor: 'text-yellow-500', 
      bgColor: 'bg-yellow-50',
      count: 0,
      showArrow: true
    },
    { 
      name: 'متجر', 
      icon: ShoppingBag, 
      iconColor: 'text-green-500', 
      bgColor: 'bg-green-50',
      showArrow: true
    },
    { 
      name: 'وكالة', 
      icon: Building2, 
      iconColor: 'text-blue-500', 
      bgColor: 'bg-blue-50',
      showArrow: true
    },
    { 
      name: 'مهام', 
      icon: Gift, 
      iconColor: 'text-blue-600', 
      bgColor: 'bg-blue-50',
      badge: 'مكافآت',
      badgeColor: 'bg-orange-400 text-white',
      showArrow: true
    },
    { 
      name: 'الزيارات الأخيرة', 
      icon: Clock, 
      iconColor: 'text-gray-500', 
      bgColor: 'bg-gray-50',
      showArrow: true
    },
    { 
      name: 'خدمة العملاء', 
      icon: Headphones, 
      iconColor: 'text-gray-500', 
      bgColor: 'bg-gray-50',
      showArrow: true
    },
    { 
      name: 'اللغة', 
      icon: Globe, 
      iconColor: 'text-purple-500', 
      bgColor: 'bg-purple-50',
      badge: 'أول شجعة',
      badgeColor: 'bg-green-500 text-white',
      showArrow: true
    },
    { 
      name: 'إعدادات', 
      icon: Settings, 
      iconColor: 'text-gray-500', 
      bgColor: 'bg-gray-50',
      showArrow: true
    }
  ];

  const bottomNavItems = [
    { name: 'أنا', icon: Home, isActive: true },
    { name: 'الرسائل', icon: MessageSquare, count: 17 },
    { name: 'المحاضرات', icon: BookOpen },
    { name: 'الاشتراك', icon: Zap },
    { name: 'الترفيه', icon: Gamepad2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between p-4 pt-12">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <Edit3 size={20} className="text-gray-600" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className="flex items-center space-x-2 mb-1">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-lg">Jalal JJ</span>
                <div className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center">
                  🇸🇦
                </div>
              </div>
              <p className="text-gray-500 text-sm">ID: 2373397</p>
            </div>
            
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
              alt="Profile"
              className="w-15 h-15 rounded-full border-3 border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl ${stat.color} mb-1`}>{stat.value}</div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* VIP Section */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center">
                <Crown size={24} className="text-yellow-200" />
              </div>
              <div>
                <h3 className="text-yellow-400 text-lg">VIP</h3>
                <p className="text-gray-300 text-sm">استمتع بامتيازات حصرية</p>
              </div>
            </div>
            
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-gray-900 rounded-xl px-6">
              تفاصيل
            </Button>
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement, index) => (
            <Card key={index} className={`bg-gradient-to-r ${achievement.color} border-0 shadow-md rounded-2xl`}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-2">
                  <achievement.icon size={20} className="text-white" />
                  <span className="text-white">{achievement.name}</span>
                </div>
                <ChevronRight size={16} className="text-white" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white">
        {menuItems.map((item, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${item.bgColor} rounded-xl flex items-center justify-center`}>
                  <item.icon size={20} className={item.iconColor} />
                </div>
                <span className="text-gray-800">{item.name}</span>
                
                {item.count !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Coins size={16} className="text-yellow-500" />
                    <span className="text-yellow-600 text-sm">{item.count}</span>
                  </div>
                )}
                
                {item.badge && (
                  <Badge className={`${item.badgeColor} text-xs px-2 py-1 rounded-full border-0`}>
                    {item.badge}
                  </Badge>
                )}
              </div>
              
              {item.showArrow && (
                <ChevronRight size={16} className="text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="grid grid-cols-5 py-2">
          {bottomNavItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`flex flex-col items-center space-y-1 p-3 relative ${
                item.isActive ? 'text-green-500' : 'text-gray-500'
              }`}
              onClick={() => setSelectedTab(item.name)}
            >
              <div className="relative">
                <item.icon size={20} />
                {item.count && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.count}
                  </div>
                )}
              </div>
              <span className="text-xs">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Safe area for bottom navigation */}
      <div className="h-20"></div>
    </div>
  );
}