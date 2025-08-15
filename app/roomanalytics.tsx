import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Clock, 
  Heart, 
  Gift, 
  MessageCircle,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Share2,
  Eye,
  Mic,
  MicOff,
  Crown,
  Star
} from 'lucide-react-native';
// import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface RoomAnalytics {
  roomId: string;
  roomName: string;
  totalSessions: number;
  totalDuration: number; // in minutes
  totalParticipants: number;
  averageParticipants: number;
  peakParticipants: number;
  totalGifts: number;
  totalLikes: number;
  totalMessages: number;
  averageSessionDuration: number;
  participantRetention: number; // percentage
  topParticipants: TopParticipant[];
  sessionHistory: SessionData[];
  categoryPerformance: CategoryData[];
  timeDistribution: TimeData[];
}

interface TopParticipant {
  id: string;
  name: string;
  avatar: string;
  totalTime: number;
  sessionsJoined: number;
  giftsSent: number;
  messagesSent: number;
  isHost: boolean;
}

interface SessionData {
  date: string;
  participants: number;
  duration: number;
  gifts: number;
  likes: number;
  messages: number;
}

interface CategoryData {
  category: string;
  sessions: number;
  participants: number;
  duration: number;
  color: string;
}

interface TimeData {
  hour: number;
  participants: number;
  sessions: number;
}

export default function RoomAnalyticsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const roomId = params.roomId as string;
  
  const [analytics, setAnalytics] = useState<RoomAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'participants' | 'duration' | 'engagement'>('participants');
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockAnalytics: RoomAnalytics = {
      roomId,
      roomName: 'غرفة الموسيقى العربية',
      totalSessions: 47,
      totalDuration: 2840,
      totalParticipants: 1247,
      averageParticipants: 26.5,
      peakParticipants: 89,
      totalGifts: 342,
      totalLikes: 1256,
      totalMessages: 3891,
      averageSessionDuration: 60.4,
      participantRetention: 78.5,
      topParticipants: [
        {
          id: '1',
          name: 'أحمد محمد',
          avatar: '👨‍💼',
          totalTime: 1240,
          sessionsJoined: 23,
          giftsSent: 45,
          messagesSent: 234,
          isHost: true
        },
        {
          id: '2',
          name: 'فاطمة علي',
          avatar: '👩‍🎤',
          totalTime: 890,
          sessionsJoined: 18,
          giftsSent: 32,
          messagesSent: 189,
          isHost: false
        },
        {
          id: '3',
          name: 'محمد حسن',
          avatar: '👨‍🎵',
          totalTime: 756,
          sessionsJoined: 15,
          giftsSent: 28,
          messagesSent: 156,
          isHost: false
        }
      ],
      sessionHistory: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA'),
        participants: Math.floor(Math.random() * 50) + 10,
        duration: Math.floor(Math.random() * 120) + 30,
        gifts: Math.floor(Math.random() * 15) + 2,
        likes: Math.floor(Math.random() * 40) + 10,
        messages: Math.floor(Math.random() * 100) + 20
      })),
      categoryPerformance: [
        { category: 'موسيقى', sessions: 25, participants: 680, duration: 1500, color: '#ef4444' },
        { category: 'ترفيه', sessions: 12, participants: 320, duration: 720, color: '#ec4899' },
        { category: 'تعليم', sessions: 8, participants: 180, duration: 480, color: '#10b981' },
        { category: 'أعمال', sessions: 2, participants: 67, duration: 140, color: '#f59e0b' }
      ],
      timeDistribution: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        participants: Math.floor(Math.random() * 30) + 5,
        sessions: Math.floor(Math.random() * 5) + 1
      }))
    };
    
    setAnalytics(mockAnalytics);
  }, [roomId]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Here you would fetch fresh data from the backend
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  const renderChart = () => {
    if (!analytics) return null;

    const chartData = {
      labels: analytics.sessionHistory.slice(-7).map(s => s.date.split('/')[0]),
      datasets: [{
        data: analytics.sessionHistory.slice(-7).map(s => 
          selectedMetric === 'participants' ? s.participants :
          selectedMetric === 'duration' ? s.duration :
          s.gifts + s.likes + s.messages
        )
      }]
    };

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>أداء الغرفة</Text>
          <View style={styles.metricSelector}>
            {(['participants', 'duration', 'engagement'] as const).map((metric) => (
              <TouchableOpacity
                key={metric}
                style={[
                  styles.metricButton,
                  selectedMetric === metric && styles.selectedMetricButton
                ]}
                onPress={() => setSelectedMetric(metric)}
              >
                <Text style={[
                  styles.metricButtonText,
                  selectedMetric === metric && styles.selectedMetricButtonText
                ]}>
                  {metric === 'participants' ? 'المشاركين' : 
                   metric === 'duration' ? 'المدة' : 'التفاعل'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={[styles.chart, { backgroundColor: '#334155', borderRadius: 16, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
            📊 مخطط البيانات
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            سيتم عرض المخطط هنا
          </Text>
        </View>
      </View>
    );
  };

  const renderTopParticipants = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>أفضل المشاركين</Text>
      {analytics?.topParticipants.map((participant, index) => (
        <View key={participant.id} style={styles.participantCard}>
          <View style={styles.participantRank}>
            <Text style={styles.rankNumber}>{index + 1}</Text>
            {index === 0 && <Crown size={16} color="#fbbf24" />}
          </View>
          
          <View style={styles.participantInfo}>
            <Text style={styles.participantAvatar}>{participant.avatar}</Text>
            <View style={styles.participantDetails}>
              <View style={styles.participantNameRow}>
                <Text style={styles.participantName}>{participant.name}</Text>
                {participant.isHost && <Star size={14} color="#fbbf24" />}
              </View>
              <Text style={styles.participantStats}>
                {formatDuration(participant.totalTime)} • {participant.sessionsJoined} جلسة
              </Text>
            </View>
          </View>
          
          <View style={styles.participantMetrics}>
            <View style={styles.metricItem}>
              <Gift size={14} color="#ec4899" />
              <Text style={styles.metricText}>{participant.giftsSent}</Text>
            </View>
            <View style={styles.metricItem}>
              <MessageCircle size={14} color="#3b82f6" />
              <Text style={styles.metricText}>{participant.messagesSent}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCategoryBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>أداء الفئات</Text>
      <View style={styles.categoryChart}>
        <View style={[styles.chart, { backgroundColor: '#334155', borderRadius: 16, justifyContent: 'center', alignItems: 'center', height: 200 }]}>
          <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
            🥧 مخطط الفئات
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            سيتم عرض المخطط هنا
          </Text>
        </View>
      </View>
      
      <View style={styles.categoryList}>
        {analytics?.categoryPerformance.map((category) => (
          <View key={category.category} style={styles.categoryItem}>
            <View style={[styles.categoryColor, { backgroundColor: category.color }]} />
            <Text style={styles.categoryName}>{category.category}</Text>
            <Text style={styles.categoryStats}>
              {category.sessions} جلسة • {formatDuration(category.duration)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTimeDistribution = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>توزيع الوقت</Text>
      <View style={[styles.chart, { backgroundColor: '#334155', borderRadius: 16, justifyContent: 'center', alignItems: 'center', height: 200 }]}>
        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
          📊 مخطط الوقت
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
          سيتم عرض المخطط هنا
        </Text>
      </View>
      <Text style={styles.chartSubtitle}>عدد المشاركين حسب الوقت (24 ساعة)</Text>
    </View>
  );

  if (!analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تحليلات الغرفة</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Download size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Share2 size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Room Info */}
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>{analytics.roomName}</Text>
            <Text style={styles.roomStats}>
              {analytics.totalSessions} جلسة • {formatDuration(analytics.totalDuration)} • {analytics.totalParticipants} مشارك
            </Text>
          </View>

          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {(['7d', '30d', '90d', '1y'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.selectedPeriodButton
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.selectedPeriodButtonText
                ]}>
                  {period === '7d' ? '7 أيام' : 
                   period === '30d' ? '30 يوم' : 
                   period === '90d' ? '90 يوم' : 'سنة'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            {renderMetricCard('إجمالي الجلسات', analytics.totalSessions, <Clock size={20} color="#3b82f6" />, '#3b82f6')}
            {renderMetricCard('إجمالي المشاركين', formatNumber(analytics.totalParticipants), <Users size={20} color="#10b981" />, '#10b981')}
            {renderMetricCard('متوسط المشاركين', analytics.averageParticipants.toFixed(1), <TrendingUp size={20} color="#8b5cf6" />, '#8b5cf6')}
            {renderMetricCard('الذروة', analytics.peakParticipants, <BarChart3 size={20} color="#f59e0b" />, '#f59e0b')}
            {renderMetricCard('إجمالي الهدايا', analytics.totalGifts, <Gift size={20} color="#ec4899" />, '#ec4899')}
            {renderMetricCard('معدل الاحتفاظ', `${analytics.participantRetention}%`, <Heart size={20} color="#ef4444" />, '#ef4444')}
          </View>

          {/* Chart */}
          {renderChart()}

          {/* Top Participants */}
          {renderTopParticipants()}

          {/* Category Breakdown */}
          {renderCategoryBreakdown()}

          {/* Time Distribution */}
          {renderTimeDistribution()}

          {/* Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>رؤى وتحليلات</Text>
            <View style={styles.insightsContainer}>
              <View style={styles.insightCard}>
                <TrendingUp size={20} color="#10b981" />
                <Text style={styles.insightTitle}>أفضل وقت للنشاط</Text>
                <Text style={styles.insightText}>الجمعة والسبت من 8-11 مساءً</Text>
              </View>
              
              <View style={styles.insightCard}>
                <Users size={20} color="#3b82f6" />
                <Text style={styles.insightTitle}>معدل النمو</Text>
                <Text style={styles.insightText}>+15% شهرياً في عدد المشاركين</Text>
              </View>
              
              <View style={styles.insightCard}>
                <Clock size={20} color="#f59e0b" />
                <Text style={styles.insightTitle}>مدة الجلسة المثالية</Text>
                <Text style={styles.insightText}>60-90 دقيقة للحصول على أفضل تفاعل</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  roomInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  roomStats: {
    color: '#94a3b8',
    fontSize: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPeriodButton: {
    backgroundColor: '#8b5cf6',
  },
  periodButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    width: (width - 64) / 2,
    borderLeftWidth: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metricTitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  metricValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  metricButton: {
    backgroundColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedMetricButton: {
    backgroundColor: '#8b5cf6',
  },
  metricButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedMetricButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  participantCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  rankNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  participantDetails: {
    flex: 1,
  },
  participantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  participantStats: {
    color: '#94a3b8',
    fontSize: 14,
  },
  participantMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChart: {
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryStats: {
    color: '#94a3b8',
    fontSize: 14,
  },
  chartSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});
