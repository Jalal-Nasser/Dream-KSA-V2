import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const giftData = [
  { id: 1, name: 'وردة حمراء', price: 50, icon: 'rose', color: '#ff6b6b' },
  { id: 2, name: 'تاج ذهبي', price: 200, icon: 'diamond', color: '#ffd93d' },
  { id: 3, name: 'قلب محبة', price: 100, icon: 'heart', color: '#ff69b4' },
  { id: 4, name: 'نجمة مضيئة', price: 150, icon: 'star', color: '#4ecdc4' },
  { id: 5, name: 'صاروخ سريع', price: 300, icon: 'rocket', color: '#45b7d1' },
  { id: 6, name: 'كأس الفوز', price: 250, icon: 'trophy', color: '#96ceb4' },
  { id: 7, name: 'هدية مفاجئة', price: 500, icon: 'gift', color: '#ffeaa7' },
  { id: 8, name: 'عين التقدير', price: 75, icon: 'eye', color: '#a29bfe' },
];

export default function GiftsScreen() {
  const renderGiftCard = (gift: any) => (
    <TouchableOpacity key={gift.id} style={styles.giftCard}>
      <LinearGradient
        colors={[gift.color + '20', gift.color + '10']}
        style={styles.giftCardGradient}
      >
        <View style={[styles.giftIconContainer, { backgroundColor: gift.color }]}>
          <Ionicons name={gift.icon as any} size={24} color="#fff" />
        </View>
        
        <Text style={styles.giftName}>{gift.name}</Text>
        <Text style={styles.giftPrice}>{gift.price} نقطة</Text>
        
        <TouchableOpacity style={[styles.sendButton, { backgroundColor: gift.color }]}>
          <Text style={styles.sendButtonText}>إرسال</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>متجر الهدايا</Text>
          <Text style={styles.headerSubtitle}>أرسل هدايا مميزة لأصدقائك</Text>
          
          <View style={styles.balanceContainer}>
            <Ionicons name="diamond" size={20} color="#ffd93d" />
            <Text style={styles.balanceText}>رصيدك: 1,250 نقطة</Text>
          </View>
        </View>

        {/* Gifts Grid */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.giftsGrid}>
            {giftData.map(renderGiftCard)}
          </View>
          
          {/* Popular Combos Section */}
          <View style={styles.comboSection}>
            <Text style={styles.sectionTitle}>باقات مميزة</Text>
            
            <TouchableOpacity style={styles.comboCard}>
              <LinearGradient colors={['#ff6b6b', '#ee5a52']} style={styles.comboGradient}>
                <Text style={styles.comboTitle}>باقة الحب</Text>
                <Text style={styles.comboDescription}>
                  وردة حمراء + قلب محبة + نجمة مضيئة
                </Text>
                <View style={styles.comboPrice}>
                  <Text style={styles.comboOriginalPrice}>300 نقطة</Text>
                  <Text style={styles.comboDiscountPrice}>250 نقطة</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.comboCard}>
              <LinearGradient colors={['#ffd93d', '#ffb74d']} style={styles.comboGradient}>
                <Text style={styles.comboTitle}>باقة النجومية</Text>
                <Text style={styles.comboDescription}>
                  تاج ذهبي + كأس الفوز + صاروخ سريع
                </Text>
                <View style={styles.comboPrice}>
                  <Text style={styles.comboOriginalPrice}>750 نقطة</Text>
                  <Text style={styles.comboDiscountPrice}>600 نقطة</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#e8eaf6',
    fontSize: 16,
    marginBottom: 20,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  balanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  giftCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  giftCardGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  giftIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  giftName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  giftPrice: {
    color: '#e8eaf6',
    fontSize: 14,
    marginBottom: 12,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  comboSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  comboCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  comboGradient: {
    padding: 20,
    borderRadius: 20,
  },
  comboTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comboDescription: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 12,
  },
  comboPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comboOriginalPrice: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'line-through',
    opacity: 0.7,
    marginRight: 10,
  },
  comboDiscountPrice: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
