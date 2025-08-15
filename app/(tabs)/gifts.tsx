import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput,
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  Gift, 
  Heart, 
  Star, 
  Crown, 
  Flame, 
  Sparkles, 
  TrendingUp,
  Search,
  Filter,
  Send,
  History,
  Wallet,
  Plus,
  Minus,
  Users,
  Mic
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

interface Gift {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  animation?: string;
  isPopular?: boolean;
}

interface GiftCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface GiftHistory {
  id: string;
  gift: Gift;
  sender: string;
  receiver: string;
  room: string;
  timestamp: string;
  message?: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  level: number;
}

export default function GiftsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [giftQuantity, setGiftQuantity] = useState(1);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [giftHistory, setGiftHistory] = useState<GiftHistory[]>([]);

  const giftCategories: GiftCategory[] = [
    { id: 'all', name: 'الكل', icon: '🎁', color: '#8b5cf6' },
    { id: 'love', name: 'حب', icon: '❤️', color: '#ef4444' },
    { id: 'celebration', name: 'احتفال', icon: '🎉', color: '#f59e0b' },
    { id: 'nature', name: 'طبيعة', icon: '🌸', color: '#10b981' },
    { id: 'food', name: 'طعام', icon: '🍕', color: '#f97316' },
    { id: 'animals', name: 'حيوانات', icon: '🐱', color: '#06b6d4' },
    { id: 'sports', name: 'رياضة', icon: '⚽', color: '#84cc16' },
    { id: 'music', name: 'موسيقى', icon: '🎵', color: '#ec4899' }
  ];

  const gifts: Gift[] = [
    {
      id: '1',
      name: 'قلب نابض',
      description: 'قلب نابض مع تأثيرات متحركة جميلة',
      icon: '❤️',
      price: 10,
      category: 'love',
      rarity: 'common',
      isPopular: true
    },
    {
      id: '2',
      name: 'نجمة متلألئة',
      description: 'نجمة متلألئة مع وميض جميل',
      icon: '⭐',
      price: 25,
      category: 'celebration',
      rarity: 'rare'
    },
    {
      id: '3',
      name: 'تاج ملكي',
      description: 'تاج ملكي فاخر مع أحجار كريمة',
      icon: '👑',
      price: 100,
      category: 'celebration',
      rarity: 'legendary',
      isPopular: true
    },
    {
      id: '4',
      name: 'نار متوهجة',
      description: 'نار متوهجة مع تأثيرات ديناميكية',
      icon: '🔥',
      price: 50,
      category: 'celebration',
      rarity: 'epic'
    },
    {
      id: '5',
      name: 'زهرة الربيع',
      description: 'زهرة جميلة مع بتلات متحركة',
      icon: '🌸',
      price: 15,
      category: 'nature',
      rarity: 'common'
    },
    {
      id: '6',
      name: 'بيتزا لذيذة',
      description: 'بيتزا ساخنة مع جبنة ذائبة',
      icon: '🍕',
      price: 20,
      category: 'food',
      rarity: 'common'
    },
    {
      id: '7',
      name: 'قط لطيف',
      description: 'قط لطيف مع ذيل متحرك',
      icon: '🐱',
      price: 30,
      category: 'animals',
      rarity: 'rare'
    },
    {
      id: '8',
      name: 'كرة قدم',
      description: 'كرة قدم مع تأثيرات رياضية',
      icon: '⚽',
      price: 18,
      category: 'sports',
      rarity: 'common'
    },
    {
      id: '9',
      name: 'موسيقى سحرية',
      description: 'ملاحظات موسيقية متحركة',
      icon: '🎵',
      price: 75,
      category: 'music',
      rarity: 'epic'
    },
    {
      id: '10',
      name: 'شعلة سحرية',
      description: 'شعلة سحرية مع ألوان متغيرة',
      icon: '✨',
      price: 200,
      category: 'celebration',
      rarity: 'legendary'
    }
  ];

  // Sample user data
  useEffect(() => {
    const sampleUser: User = {
      id: '1',
      name: 'أحمد محمد',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      coins: 1250,
      level: 15
    };
    setCurrentUser(sampleUser);

    // Sample gift history
    const sampleHistory: GiftHistory[] = [
      {
        id: '1',
        gift: gifts[0],
        sender: 'فاطمة علي',
        receiver: 'أحمد محمد',
        room: 'أحاديث عامة',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        message: 'أتمنى لك يوماً سعيداً!'
      },
      {
        id: '2',
        gift: gifts[2],
        sender: 'محمد حسن',
        receiver: 'أحمد محمد',
        room: 'قعدة أصدقاء',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        message: 'مبروك على الإنجاز!'
      }
    ];
    setGiftHistory(sampleHistory);
  }, []);

  const filteredGifts = gifts.filter(gift => {
    const matchesCategory = selectedCategory === 'all' || gift.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      gift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gift.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#94a3b8';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'عادي';
      case 'rare': return 'نادر';
      case 'epic': return 'ملحمي';
      case 'legendary': return 'أسطوري';
      default: return 'عادي';
    }
  };

  const handleGiftSelect = (gift: Gift) => {
    setSelectedGift(gift);
    setGiftQuantity(1);
    setShowGiftModal(true);
  };

  const handleSendGift = () => {
    if (!selectedGift || !currentUser) return;
    
    const totalCost = selectedGift.price * giftQuantity;
    if (currentUser.coins < totalCost) {
      Alert.alert('نقاط غير كافية', 'ليس لديك نقاط كافية لإرسال هذه الهدية');
      return;
    }

    // Simulate sending gift
    Alert.alert(
      'تم إرسال الهدية!', 
      `تم إرسال ${giftQuantity} ${selectedGift.name} بنجاح!`,
      [
        {
          text: 'حسناً',
          onPress: () => {
            setShowGiftModal(false);
            setSelectedGift(null);
            setGiftQuantity(1);
          }
        }
      ]
    );
  };

  const renderGiftCard = ({ item }: { item: Gift }) => (
    <TouchableOpacity 
      style={styles.giftCard}
      onPress={() => handleGiftSelect(item)}
    >
      <View style={styles.giftIconContainer}>
        <Text style={styles.giftIcon}>{item.icon}</Text>
        {item.isPopular && (
          <View style={styles.popularBadge}>
            <TrendingUp size={12} color="#f59e0b" />
          </View>
        )}
      </View>
      
      <View style={styles.giftInfo}>
        <Text style={styles.giftName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.giftDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.giftMeta}>
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
            <Text style={styles.rarityText}>{getRarityText(item.rarity)}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{item.price}</Text>
            <Text style={styles.coinIcon}>🪙</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGiftHistoryItem = ({ item }: { item: GiftHistory }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyGift}>
        <Text style={styles.historyGiftIcon}>{item.gift.icon}</Text>
      </View>
      
      <View style={styles.historyInfo}>
        <Text style={styles.historyText}>
          <Text style={styles.historySender}>{item.sender}</Text>
          {' أرسل '}
          <Text style={styles.historyGiftName}>{item.gift.name}</Text>
          {' إلى '}
          <Text style={styles.historyReceiver}>{item.receiver}</Text>
        </Text>
        <Text style={styles.historyRoom}>{item.room}</Text>
        {item.message && (
          <Text style={styles.historyMessage}>"{item.message}"</Text>
        )}
        <Text style={styles.historyTime}>
          {new Date(item.timestamp).toLocaleString('ar-SA')}
        </Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>نظام الهدايا</Text>
            <Text style={styles.headerSubtitle}>أرسل هدايا جميلة لأصدقائك</Text>
          </View>
          <TouchableOpacity style={styles.walletButton}>
            <Wallet size={24} color="#8b5cf6" />
            <View style={styles.coinDisplay}>
              <Text style={styles.coinText}>{currentUser?.coins || 0}</Text>
              <Text style={styles.coinIcon}>🪙</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن هدايا..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {giftCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && { backgroundColor: category.color }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Gifts Grid */}
        <View style={styles.giftsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الهدايا المتاحة</Text>
            <Text style={styles.giftsCount}>{filteredGifts.length} هدية</Text>
          </View>
          
          <FlatList
            data={filteredGifts}
            renderItem={renderGiftCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.giftsGrid}
          />
        </View>

        {/* Gift History */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <History size={20} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>سجل الهدايا</Text>
          </View>
          
          <FlatList
            data={giftHistory}
            renderItem={renderGiftHistoryItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.historyList}
          />
        </View>
      </SafeAreaView>

      {/* Gift Modal */}
      {showGiftModal && selectedGift && (
        <View style={styles.modalOverlay}>
          <View style={styles.giftModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إرسال هدية</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowGiftModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalGift}>
              <Text style={styles.modalGiftIcon}>{selectedGift.icon}</Text>
              <Text style={styles.modalGiftName}>{selectedGift.name}</Text>
              <Text style={styles.modalGiftDescription}>{selectedGift.description}</Text>
            </View>

            <View style={styles.quantitySelector}>
              <Text style={styles.quantityLabel}>الكمية:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => setGiftQuantity(Math.max(1, giftQuantity - 1))}
                >
                  <Minus size={20} color="#8b5cf6" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{giftQuantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => setGiftQuantity(giftQuantity + 1)}
                >
                  <Plus size={20} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalCost}>
              <Text style={styles.costLabel}>التكلفة الإجمالية:</Text>
              <View style={styles.costDisplay}>
                <Text style={styles.costText}>{selectedGift.price * giftQuantity}</Text>
                <Text style={styles.coinIcon}>🪙</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendGift}
            >
              <Send size={20} color="#fff" />
              <Text style={styles.sendButtonText}>إرسال الهدية</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 4,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  coinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  coinText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  coinIcon: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  giftsSection: {
    flex: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  giftsCount: {
    color: '#94a3b8',
    fontSize: 14,
  },
  giftsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  giftCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 8,
    width: (width - 60) / 2,
    alignItems: 'center',
  },
  giftIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  giftIcon: {
    fontSize: 48,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    padding: 4,
  },
  giftInfo: {
    alignItems: 'center',
    width: '100%',
  },
  giftName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  giftDescription: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  giftMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
  historySection: {
    marginBottom: 20,
  },
  historyList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyGift: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  historyGiftIcon: {
    fontSize: 24,
  },
  historyInfo: {
    flex: 1,
  },
  historyText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  historySender: {
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
  historyGiftName: {
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  historyReceiver: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  historyRoom: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  historyMessage: {
    color: '#e2e8f0',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  historyTime: {
    color: '#64748b',
    fontSize: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftModal: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    width: width - 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalGift: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalGiftIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalGiftName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalGiftDescription: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quantityLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  modalCost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  costLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  costDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    color: '#fbbf24',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
