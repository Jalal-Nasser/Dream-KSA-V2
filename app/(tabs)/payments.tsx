import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  WebView,
  Modal,
  SafeAreaView,
  I18nManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getSupabase } from '../../lib/supabase';
import { PALETTE } from '../../lib/theme';

const ACCENT = '#800F2F';
const CARD = '#FBE7EF';

interface PaymentPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  description: string;
  popular?: boolean;
}

const PAYMENT_PACKAGES: PaymentPackage[] = [
  {
    id: 'package_1',
    name: 'حزمة البداية',
    coins: 50,
    price: 5,
    currency: 'SAR',
    description: '50 عملة ذهبية',
  },
  {
    id: 'package_2',
    name: 'حزمة المتوسط',
    coins: 120,
    price: 10,
    currency: 'SAR',
    description: '120 عملة ذهبية + 20 مجاناً',
    popular: true,
  },
  {
    id: 'package_3',
    name: 'حزمة الكبيرة',
    coins: 300,
    price: 25,
    currency: 'SAR',
    description: '300 عملة ذهبية + 100 مجاناً',
  },
  {
    id: 'package_4',
    name: 'حزمة المميزة',
    coins: 650,
    price: 50,
    currency: 'SAR',
    description: '650 عملة ذهبية + 300 مجاناً',
  },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const supabase = getSupabase();
  const [user, setUser] = useState<any>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Load user's coin balance from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('coins')
          .eq('id', user.id)
          .single();
        
        setUserCoins(profile?.coins || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg: PaymentPackage) => {
    setSelectedPackage(pkg);
    setPaymentModalVisible(true);
  };

  const createPayment = async () => {
    if (!selectedPackage || !user) return;

    setPaymentLoading(true);
    try {
      const response = await fetch('https://api.dreamsksa.online/api/payments/paytabs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          amount_major: selectedPackage.price,
          currency: selectedPackage.currency,
          email: user.email || `${user.id}@user.local`,
          first_name: user.user_metadata?.first_name || 'User',
          last_name: user.user_metadata?.last_name || '',
          product_title: `شراء ${selectedPackage.coins} عملة ذهبية`,
          coins_amount: selectedPackage.coins,
          metadata: { client: 'expo' }
        }),
      });

      const data = await response.json();

      if (data.ok && data.paypage) {
        setPaymentUrl(data.paypage);
      } else {
        Alert.alert('خطأ', data.error || 'فشل في إنشاء الدفع');
        setPaymentModalVisible(false);
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      Alert.alert('خطأ', 'حدث خطأ في الاتصال');
      setPaymentModalVisible(false);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentModalVisible(false);
    setPaymentUrl('');
    setSelectedPackage(null);
    loadUserData(); // Refresh user data
    Alert.alert('نجح الدفع!', 'تم إضافة العملات إلى حسابك بنجاح');
  };

  const handlePaymentError = () => {
    setPaymentModalVisible(false);
    setPaymentUrl('');
    setSelectedPackage(null);
    Alert.alert('فشل الدفع', 'لم يتم إتمام عملية الدفع');
  };

  const verifyPayment = async (payment_reference: string, merchant_order_id: string) => {
    try {
      const response = await fetch('https://api.dreamsksa.online/api/payments/paytabs/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_reference,
          merchant_order_id
        }),
      });

      const data = await response.json();
      
      if (data.ok && data.success) {
        handlePaymentSuccess();
      } else {
        handlePaymentError();
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      handlePaymentError();
    }
  };

  const renderPackageCard = (pkg: PaymentPackage) => (
    <TouchableOpacity
      key={pkg.id}
      style={[styles.packageCard, pkg.popular && styles.popularCard]}
      onPress={() => handlePackageSelect(pkg)}
    >
      {pkg.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>الأكثر شعبية</Text>
        </View>
      )}
      
      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{pkg.name}</Text>
        <View style={styles.coinContainer}>
          <MaterialCommunityIcons name="coin" size={24} color="#FFD700" />
          <Text style={styles.coinAmount}>{pkg.coins}</Text>
        </View>
      </View>
      
      <Text style={styles.packageDescription}>{pkg.description}</Text>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{pkg.price} {pkg.currency}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#FFF0F3', '#FFFFFF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="arrow-right" size={24} color={ACCENT} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>المحفظة</Text>
            <View style={styles.placeholder} />
          </View>

          {/* User Coins Display */}
          <View style={styles.coinsCard}>
            <View style={styles.coinsHeader}>
              <MaterialCommunityIcons name="wallet" size={32} color={ACCENT} />
              <Text style={styles.coinsTitle}>رصيدك الحالي</Text>
            </View>
            <View style={styles.coinsAmount}>
              <MaterialCommunityIcons name="coin" size={40} color="#FFD700" />
              <Text style={styles.coinsValue}>{userCoins}</Text>
              <Text style={styles.coinsLabel}>عملة ذهبية</Text>
            </View>
          </View>

          {/* Packages Section */}
          <View style={styles.packagesSection}>
            <Text style={styles.sectionTitle}>اختر حزمة العملات</Text>
            <Text style={styles.sectionSubtitle}>اشتر العملات الذهبية واستمتع بالمميزات الحصرية</Text>
            
            <View style={styles.packagesGrid}>
              {PAYMENT_PACKAGES.map(renderPackageCard)}
            </View>
          </View>

          {/* Info Section */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information" size={24} color={ACCENT} />
            <Text style={styles.infoText}>
              العملات الذهبية تستخدم لإرسال الهدايا والمميزات الحصرية في التطبيق
            </Text>
          </View>
        </ScrollView>

        {/* Payment Modal */}
        <Modal
          visible={paymentModalVisible}
          animationType="slide"
          onRequestClose={() => setPaymentModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPaymentModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>إتمام الدفع</Text>
            </View>

            {paymentLoading ? (
              <View style={styles.paymentLoading}>
                <ActivityIndicator size="large" color={ACCENT} />
                <Text style={styles.paymentLoadingText}>جاري إعداد الدفع...</Text>
              </View>
            ) : paymentUrl ? (
              <WebView
                source={{ uri: paymentUrl }}
                style={styles.webView}
                onNavigationStateChange={(navState) => {
                  const url = navState.url || '';
                  
                  // Detect PayTabs return URL
                  if (url.includes('/api/payments/paytabs/verify-callback') || url.includes('payment_reference=')) {
                    const refMatch = url.match(/payment_reference=([^&]+)/);
                    const moMatch = url.match(/merchant_order_id=([^&]+)/);
                    const payment_reference = refMatch?.[1] ? decodeURIComponent(refMatch[1]) : null;
                    const merchant_order_id = moMatch?.[1] ? decodeURIComponent(moMatch[1]) : null;
                    
                    if (payment_reference && merchant_order_id) {
                      verifyPayment(payment_reference, merchant_order_id);
                    } else {
                      handlePaymentError();
                    }
                  } else if (url.includes('error') || url.includes('cancel')) {
                    handlePaymentError();
                  }
                }}
              />
            ) : (
              <View style={styles.paymentInit}>
                <Text style={styles.paymentInitText}>
                  هل تريد شراء {selectedPackage?.coins} عملة ذهبية مقابل {selectedPackage?.price} ريال؟
                </Text>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={createPayment}
                >
                  <Text style={styles.confirmButtonText}>تأكيد الدفع</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Modal>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: ACCENT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ACCENT,
  },
  placeholder: {
    width: 40,
  },
  coinsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coinsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coinsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ACCENT,
    marginLeft: 12,
  },
  coinsAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    marginHorizontal: 12,
  },
  coinsLabel: {
    fontSize: 16,
    color: '#666',
  },
  packagesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: ACCENT,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  packagesGrid: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: ACCENT,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 20,
    backgroundColor: ACCENT,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  packageName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ACCENT,
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ACCENT,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    marginLeft: 12,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ACCENT,
  },
  paymentLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: ACCENT,
  },
  webView: {
    flex: 1,
  },
  paymentInit: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  paymentInitText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#374151',
    marginBottom: 32,
  },
  confirmButton: {
    backgroundColor: ACCENT,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
