import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  Repeat, 
  Plus,
  Minus,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ScheduledRoom {
  id: string;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  maxParticipants: number;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  category: string;
  isPrivate: boolean;
}

interface TimeSlot {
  hour: number;
  minute: number;
  isAvailable: boolean;
  isSelected: boolean;
}

export default function RoomScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const roomId = params.roomId as string;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState(60); // minutes
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isPrivate, setIsPrivate] = useState(false);

  const categories = [
    { id: 'general', name: 'عام', color: '#3b82f6' },
    { id: 'entertainment', name: 'ترفيه', color: '#ec4899' },
    { id: 'education', name: 'تعليم', color: '#10b981' },
    { id: 'business', name: 'أعمال', color: '#f59e0b' },
    { id: 'technology', name: 'تقنية', color: '#8b5cf6' },
    { id: 'music', name: 'موسيقى', color: '#ef4444' }
  ];

  const timeSlots: TimeSlot[] = Array.from({ length: 48 }, (_, i) => ({
    hour: Math.floor(i / 2),
    minute: (i % 2) * 30,
    isAvailable: Math.random() > 0.3, // Random availability for demo
    isSelected: false
  }));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'م' : 'ص';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const handleScheduleRoom = () => {
    if (!roomName.trim() || !selectedTimeSlot) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الغرفة واختيار وقت');
      return;
    }

    const startTime = new Date(selectedDate);
    startTime.setHours(selectedTimeSlot.hour, selectedTimeSlot.minute, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    const scheduledRoom: ScheduledRoom = {
      id: Date.now().toString(),
      name: roomName,
      description: roomDescription,
      startTime,
      endTime,
      maxParticipants,
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : undefined,
      category: selectedCategory,
      isPrivate
    };

    // Here you would save to backend
    console.log('Scheduling room:', scheduledRoom);
    
    Alert.alert(
      'تم الجدولة بنجاح',
      `تم جدولة الغرفة "${roomName}" في ${startTime.toLocaleDateString('ar-SA')} الساعة ${formatTime(selectedTimeSlot.hour, selectedTimeSlot.minute)}`,
      [
        {
          text: 'حسناً',
          onPress: () => router.back()
        }
      ]
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
    
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <ChevronRight size={24} color="#94a3b8" />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <ChevronLeft size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekDays}>
          {weekDays.map((day, index) => (
            <Text key={index} style={styles.weekDay}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.daysGrid}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                day && day.toDateString() === selectedDate.toDateString() && styles.selectedDay
              ]}
              onPress={() => day && setSelectedDate(day)}
              disabled={!day}
            >
              {day && (
                <Text style={[
                  styles.dayText,
                  day.toDateString() === selectedDate.toDateString() && styles.selectedDayText
                ]}>
                  {day.getDate()}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderTimeSlots = () => (
    <View style={styles.timeSlotsContainer}>
      <Text style={styles.sectionTitle}>اختر الوقت</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeSlotsRow}>
          {timeSlots.map((slot, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlot,
                !slot.isAvailable && styles.unavailableTimeSlot,
                slot.isSelected && styles.selectedTimeSlot
              ]}
              onPress={() => {
                if (slot.isAvailable) {
                  setSelectedTimeSlot(slot);
                }
              }}
              disabled={!slot.isAvailable}
            >
              <Text style={[
                styles.timeSlotText,
                slot.isSelected && styles.selectedTimeSlotText
              ]}>
                {formatTime(slot.hour, slot.minute)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

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
          <Text style={styles.headerTitle}>جدولة غرفة</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Room Details Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>تفاصيل الغرفة</Text>
            
            <TextInput
              style={styles.input}
              placeholder="اسم الغرفة"
              placeholderTextColor="#64748b"
              value={roomName}
              onChangeText={setRoomName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="وصف الغرفة (اختياري)"
              placeholderTextColor="#64748b"
              value={roomDescription}
              onChangeText={setRoomDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Calendar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اختر التاريخ</Text>
            {renderCalendar()}
          </View>

          {/* Time Slots */}
          {renderTimeSlots()}

          {/* Duration & Participants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المدة والمشاركين</Text>
            
            <View style={styles.durationContainer}>
              <Text style={styles.label}>المدة (دقائق)</Text>
              <View style={styles.durationControls}>
                <TouchableOpacity
                  style={styles.durationButton}
                  onPress={() => setDuration(Math.max(15, duration - 15))}
                >
                  <Minus size={20} color="#94a3b8" />
                </TouchableOpacity>
                <Text style={styles.durationValue}>{duration}</Text>
                <TouchableOpacity
                  style={styles.durationButton}
                  onPress={() => setDuration(Math.min(480, duration + 15))}
                >
                  <Plus size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.participantsContainer}>
              <Text style={styles.label}>الحد الأقصى للمشاركين</Text>
              <View style={styles.participantsControls}>
                <TouchableOpacity
                  style={styles.participantsButton}
                  onPress={() => setMaxParticipants(Math.max(2, maxParticipants - 5))}
                >
                  <Minus size={20} color="#94a3b8" />
                </TouchableOpacity>
                <Text style={styles.participantsValue}>{maxParticipants}</Text>
                <TouchableOpacity
                  style={styles.participantsButton}
                  onPress={() => setMaxParticipants(Math.min(200, maxParticipants + 5))}
                >
                  <Plus size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الفئة</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesRow}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.id && styles.selectedCategoryChip
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.selectedCategoryText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Recurring Options */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.recurringToggle}
              onPress={() => setIsRecurring(!isRecurring)}
            >
              <View style={styles.recurringHeader}>
                <Repeat size={20} color="#94a3b8" />
                <Text style={styles.recurringTitle}>تكرار</Text>
              </View>
              <View style={[
                styles.toggle,
                isRecurring && styles.toggleActive
              ]}>
                {isRecurring && <Check size={16} color="#fff" />}
              </View>
            </TouchableOpacity>

            {isRecurring && (
              <View style={styles.recurringOptions}>
                <Text style={styles.label}>نمط التكرار</Text>
                <View style={styles.recurringPatterns}>
                  {(['daily', 'weekly', 'monthly'] as const).map((pattern) => (
                    <TouchableOpacity
                      key={pattern}
                      style={[
                        styles.patternChip,
                        recurringPattern === pattern && styles.selectedPatternChip
                      ]}
                      onPress={() => setRecurringPattern(pattern)}
                    >
                      <Text style={[
                        styles.patternText,
                        recurringPattern === pattern && styles.selectedPatternText
                      ]}>
                        {pattern === 'daily' ? 'يومياً' : pattern === 'weekly' ? 'أسبوعياً' : 'شهرياً'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Privacy Setting */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.privacyToggle}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <View style={styles.privacyHeader}>
                <Text style={styles.privacyTitle}>غرفة خاصة</Text>
                <Text style={styles.privacySubtitle}>
                  {isPrivate ? 'فقط المدعوون يمكنهم الانضمام' : 'أي شخص يمكنه الانضمام'}
                </Text>
              </View>
              <View style={[
                styles.toggle,
                isPrivate && styles.toggleActive
              ]}>
                {isPrivate && <Check size={16} color="#fff" />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Schedule Button */}
          <TouchableOpacity
            style={styles.scheduleButton}
            onPress={handleScheduleRoom}
          >
            <LinearGradient
              colors={['#8b5cf6', '#3b82f6']}
              style={styles.scheduleButtonGradient}
            >
              <Calendar size={20} color="#fff" />
              <Text style={styles.scheduleButtonText}>جدولة الغرفة</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'right',
  },
  calendarContainer: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 80) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  selectedDay: {
    backgroundColor: '#8b5cf6',
    borderRadius: 20,
  },
  dayText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeSlotsContainer: {
    marginBottom: 24,
  },
  timeSlotsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  timeSlot: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  unavailableTimeSlot: {
    backgroundColor: '#475569',
    opacity: 0.5,
  },
  selectedTimeSlot: {
    backgroundColor: '#8b5cf6',
  },
  timeSlotText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedTimeSlotText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  durationContainer: {
    marginBottom: 20,
  },
  participantsContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  participantsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  durationButton: {
    backgroundColor: '#334155',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantsButton: {
    backgroundColor: '#334155',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  participantsValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  selectedCategoryChip: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  recurringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  recurringHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recurringTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  toggle: {
    width: 48,
    height: 24,
    backgroundColor: '#475569',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#8b5cf6',
  },
  recurringOptions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#475569',
  },
  recurringPatterns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  patternChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#475569',
  },
  selectedPatternChip: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  patternText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPatternText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  privacyHeader: {
    flex: 1,
    marginRight: 16,
  },
  privacyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  privacySubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  scheduleButton: {
    marginTop: 32,
    marginBottom: 40,
  },
  scheduleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  scheduleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
