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
  Dimensions,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  Clock, 
  Music, 
  BookOpen, 
  Briefcase,
  Heart,
  Star,
  Settings,
  Copy,
  Edit3,
  Trash2,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface RoomTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  maxParticipants: number;
  defaultDuration: number;
  isPrivate: boolean;
  tags: string[];
  features: string[];
  popularity: number;
  isCustom: boolean;
  createdBy?: string;
  lastUsed?: Date;
}

interface RoomPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  settings: {
    maxParticipants: number;
    duration: number;
    isPrivate: boolean;
    allowGifts: boolean;
    allowChat: boolean;
    allowRecording: boolean;
    autoMute: boolean;
    language: string;
    theme: string;
  };
}

export default function RoomTemplatesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [templates, setTemplates] = useState<RoomTemplate[]>([]);
  const [presets, setPresets] = useState<RoomPreset[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RoomTemplate | null>(null);

  const categories = [
    { id: 'all', name: 'الكل', color: '#94a3b8' },
    { id: 'music', name: 'موسيقى', color: '#ef4444' },
    { id: 'education', name: 'تعليم', color: '#10b981' },
    { id: 'business', name: 'أعمال', color: '#f59e0b' },
    { id: 'entertainment', name: 'ترفيه', color: '#ec4899' },
    { id: 'technology', name: 'تقنية', color: '#8b5cf6' },
    { id: 'social', name: 'اجتماعي', color: '#3b82f6' }
  ];

  // Mock data for templates
  useEffect(() => {
    const mockTemplates: RoomTemplate[] = [
      {
        id: '1',
        name: 'غرفة الموسيقى العربية',
        description: 'غرفة مخصصة للموسيقى العربية التقليدية والمعاصرة',
        category: 'music',
        icon: '🎵',
        color: '#ef4444',
        maxParticipants: 50,
        defaultDuration: 120,
        isPrivate: false,
        tags: ['موسيقى عربية', 'تراثي', 'معاصر'],
        features: ['مشاركة الموسيقى', 'تسجيل الجلسات', 'دعم الهدايا'],
        popularity: 95,
        isCustom: false
      },
      {
        id: '2',
        name: 'محاضرة تعليمية',
        description: 'غرفة للمحاضرات والدروس التعليمية',
        category: 'education',
        icon: '📚',
        color: '#10b981',
        maxParticipants: 100,
        defaultDuration: 90,
        isPrivate: false,
        tags: ['تعليم', 'محاضرات', 'دروس'],
        features: ['عرض الشرائح', 'تسجيل المحاضرة', 'أسئلة وأجوبة'],
        popularity: 88,
        isCustom: false
      },
      {
        id: '3',
        name: 'اجتماع عمل',
        description: 'غرفة للاجتماعات والمؤتمرات التجارية',
        category: 'business',
        icon: '💼',
        color: '#f59e0b',
        maxParticipants: 30,
        defaultDuration: 60,
        isPrivate: true,
        tags: ['عمل', 'اجتماعات', 'مؤتمرات'],
        features: ['عرض الشرائح', 'تسجيل الاجتماع', 'مشاركة الملفات'],
        popularity: 92,
        isCustom: false
      },
      {
        id: '4',
        name: 'غرفة الألعاب',
        description: 'غرفة للعب ومشاركة الألعاب مع الأصدقاء',
        category: 'entertainment',
        icon: '🎮',
        color: '#ec4899',
        maxParticipants: 20,
        defaultDuration: 180,
        isPrivate: false,
        tags: ['ألعاب', 'ترفيه', 'أصدقاء'],
        features: ['مشاركة الشاشة', 'دعم الألعاب', 'دردشة صوتية'],
        popularity: 87,
        isCustom: false
      },
      {
        id: '5',
        name: 'غرفتي المخصصة',
        description: 'غرفة مخصصة حسب احتياجاتي',
        category: 'social',
        icon: '⭐',
        color: '#8b5cf6',
        maxParticipants: 25,
        defaultDuration: 60,
        isPrivate: true,
        tags: ['مخصص', 'اجتماعي', 'خاص'],
        features: ['إعدادات مخصصة', 'خصوصية عالية', 'مرونة كاملة'],
        popularity: 75,
        isCustom: true,
        createdBy: 'أحمد محمد',
        lastUsed: new Date()
      }
    ];

    const mockPresets: RoomPreset[] = [
      {
        id: '1',
        name: 'موسيقى سريعة',
        description: 'إعدادات سريعة لغرفة موسيقية',
        category: 'music',
        icon: '🎵',
        color: '#ef4444',
        settings: {
          maxParticipants: 30,
          duration: 60,
          isPrivate: false,
          allowGifts: true,
          allowChat: true,
          allowRecording: true,
          autoMute: false,
          language: 'ar',
          theme: 'dark'
        }
      },
      {
        id: '2',
        name: 'تعليم متقدم',
        description: 'إعدادات متقدمة للغرف التعليمية',
        category: 'education',
        icon: '📚',
        color: '#10b981',
        settings: {
          maxParticipants: 100,
          duration: 120,
          isPrivate: false,
          allowGifts: false,
          allowChat: true,
          allowRecording: true,
          autoMute: true,
          language: 'ar',
          theme: 'light'
        }
      }
    ];

    setTemplates(mockTemplates);
    setPresets(mockPresets);
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: RoomTemplate) => {
    Alert.alert(
      'استخدام القالب',
      `هل تريد إنشاء غرفة باستخدام قالب "${template.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'استخدام', 
          onPress: () => {
            // Navigate to create room with template settings
            router.push({
              pathname: '/createroom',
              params: { 
                templateId: template.id,
                maxParticipants: template.maxParticipants.toString(),
                duration: template.defaultDuration.toString(),
                isPrivate: template.isPrivate.toString(),
                category: template.category
              }
            });
          }
        }
      ]
    );
  };

  const handleEditTemplate = (template: RoomTemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleDeleteTemplate = (template: RoomTemplate) => {
    Alert.alert(
      'حذف القالب',
      `هل أنت متأكد من حذف قالب "${template.name}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => {
            setTemplates(prev => prev.filter(t => t.id !== template.id));
            Alert.alert('تم الحذف', 'تم حذف القالب بنجاح');
          }
        }
      ]
    );
  };

  const handleDuplicateTemplate = (template: RoomTemplate) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (نسخة)`,
      isCustom: true,
      createdBy: 'أحمد محمد',
      lastUsed: new Date()
    };
    setTemplates(prev => [...prev, newTemplate]);
    Alert.alert('تم النسخ', 'تم نسخ القالب بنجاح');
  };

  const renderTemplateCard = (template: RoomTemplate) => (
    <View key={template.id} style={[styles.templateCard, { borderLeftColor: template.color }]}>
      <View style={styles.templateHeader}>
        <View style={styles.templateIcon}>
          <Text style={styles.templateIconText}>{template.icon}</Text>
        </View>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateDescription} numberOfLines={2}>
            {template.description}
          </Text>
          <View style={styles.templateTags}>
            {template.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        {template.isCustom && (
          <View style={styles.customBadge}>
            <Star size={12} color="#fbbf24" />
            <Text style={styles.customBadgeText}>مخصص</Text>
          </View>
        )}
      </View>

      <View style={styles.templateStats}>
        <View style={styles.statItem}>
          <Users size={14} color="#94a3b8" />
          <Text style={styles.statText}>{template.maxParticipants}</Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={14} color="#94a3b8" />
          <Text style={styles.statText}>{template.defaultDuration}د</Text>
        </View>
        <View style={styles.statItem}>
          <Heart size={14} color="#94a3b8" />
          <Text style={styles.statText}>{template.popularity}%</Text>
        </View>
      </View>

      <View style={styles.templateActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUseTemplate(template)}
        >
          <Text style={styles.actionButtonText}>استخدام</Text>
        </TouchableOpacity>
        
        {template.isCustom && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditTemplate(template)}
            >
              <Edit3 size={16} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.duplicateButton]}
              onPress={() => handleDuplicateTemplate(template)}
            >
              <Copy size={16} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteTemplate(template)}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderPresetCard = (preset: RoomPreset) => (
    <View key={preset.id} style={[styles.presetCard, { borderLeftColor: preset.color }]}>
      <View style={styles.presetHeader}>
        <Text style={styles.presetIcon}>{preset.icon}</Text>
        <View style={styles.presetInfo}>
          <Text style={styles.presetName}>{preset.name}</Text>
          <Text style={styles.presetDescription}>{preset.description}</Text>
        </View>
      </View>
      
      <View style={styles.presetSettings}>
        <Text style={styles.settingsTitle}>الإعدادات:</Text>
        <View style={styles.settingsGrid}>
          <Text style={styles.settingItem}>المشاركين: {preset.settings.maxParticipants}</Text>
          <Text style={styles.settingItem}>المدة: {preset.settings.duration}د</Text>
          <Text style={styles.settingItem}>الخصوصية: {preset.settings.isPrivate ? 'نعم' : 'لا'}</Text>
          <Text style={styles.settingItem}>الهدايا: {preset.settings.allowGifts ? 'نعم' : 'لا'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.usePresetButton}
        onPress={() => {
          router.push({
            pathname: '/createroom',
            params: { 
              presetId: preset.id,
              maxParticipants: preset.settings.maxParticipants.toString(),
              duration: preset.settings.duration.toString(),
              isPrivate: preset.settings.isPrivate.toString()
            }
          });
        }}
      >
        <Text style={styles.usePresetButtonText}>استخدام الإعدادات</Text>
      </TouchableOpacity>
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
          <Text style={styles.headerTitle}>قوالب الغرف</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في القوالب..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.selectedCategoryChipText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.activeViewButton]}
              onPress={() => setViewMode('grid')}
            >
              <Grid size={20} color={viewMode === 'grid' ? '#fff' : '#94a3b8'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.activeViewButton]}
              onPress={() => setViewMode('list')}
            >
              <List size={20} color={viewMode === 'list' ? '#fff' : '#94a3b8'} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Templates Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>قوالب الغرف</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredTemplates.length} قالب متاح
              </Text>
            </View>
            
            {viewMode === 'grid' ? (
              <View style={styles.templatesGrid}>
                {filteredTemplates.map(template => (
                  <View key={template.id} style={styles.gridCard}>
                    <View style={[styles.gridCardHeader, { backgroundColor: template.color }]}>
                      <Text style={styles.gridCardIcon}>{template.icon}</Text>
                    </View>
                    <View style={styles.gridCardContent}>
                      <Text style={styles.gridCardName} numberOfLines={1}>
                        {template.name}
                      </Text>
                      <Text style={styles.gridCardDescription} numberOfLines={2}>
                        {template.description}
                      </Text>
                      <View style={styles.gridCardStats}>
                        <Text style={styles.gridCardStat}>
                          👥 {template.maxParticipants}
                        </Text>
                        <Text style={styles.gridCardStat}>
                          ⏱️ {template.defaultDuration}د
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.gridCardButton}
                      onPress={() => handleUseTemplate(template)}
                    >
                      <Text style={styles.gridCardButtonText}>استخدام</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.templatesList}>
                {filteredTemplates.map(renderTemplateCard)}
              </View>
            )}
          </View>

          {/* Presets Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إعدادات سريعة</Text>
            <Text style={styles.sectionSubtitle}>
              إعدادات جاهزة لإنشاء غرف بسرعة
            </Text>
            
            <View style={styles.presetsList}>
              {presets.map(renderPresetCard)}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/createroom')}
              >
                <Plus size={24} color="#8b5cf6" />
                <Text style={styles.quickActionText}>إنشاء غرفة جديدة</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/roomschedule')}
              >
                <Clock size={24} color="#10b981" />
                <Text style={styles.quickActionText}>جدولة غرفة</Text>
              </TouchableOpacity>
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
  createButton: {
    backgroundColor: '#8b5cf6',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 12,
    textAlign: 'right',
  },
  filterContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#475569',
  },
  selectedCategoryChip: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  categoryChipText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-end',
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: '#8b5cf6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    backgroundColor: '#334155',
    borderRadius: 16,
    width: (width - 64) / 2,
    overflow: 'hidden',
  },
  gridCardHeader: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardIcon: {
    fontSize: 32,
  },
  gridCardContent: {
    padding: 16,
  },
  gridCardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gridCardDescription: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  gridCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridCardStat: {
    color: '#94a3b8',
    fontSize: 12,
  },
  gridCardButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    alignItems: 'center',
  },
  gridCardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  templatesList: {
    gap: 16,
  },
  templateCard: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
  },
  templateHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  templateIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  templateIconText: {
    fontSize: 24,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  templateDescription: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  templateTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  customBadgeText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '500',
  },
  templateStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#475569',
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  templateActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#1e293b',
    flex: 0,
    paddingHorizontal: 16,
  },
  duplicateButton: {
    backgroundColor: '#1e293b',
    flex: 0,
    paddingHorizontal: 16,
  },
  deleteButton: {
    backgroundColor: '#1e293b',
    flex: 0,
    paddingHorizontal: 16,
  },
  presetsList: {
    gap: 16,
  },
  presetCard: {
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  presetIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  presetDescription: {
    color: '#94a3b8',
    fontSize: 14,
  },
  presetSettings: {
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#475569',
    borderBottomWidth: 1,
    borderBottomColor: '#475569',
  },
  settingsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  settingItem: {
    color: '#94a3b8',
    fontSize: 14,
    minWidth: '45%',
  },
  usePresetButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  usePresetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
