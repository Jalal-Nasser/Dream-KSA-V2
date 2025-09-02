import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, I18nManager, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { COUNTRIES, type Country } from '@/lib/countries';

const ACCENT = '#800F2F';
const CARD = '#FBE7EF';
const BORDER = '#F2CAD6';
const HOT_COLOR = '#FF6B35';

// Popular countries for quick access with HOT labels
const HOT_COUNTRIES = ['SA', 'AE', 'EG', 'JO', 'KW', 'QA', 'BH', 'OM', 'IQ', 'US', 'GB', 'FR', 'DE'];

// Country flags mapping (simplified - you can expand this)
const COUNTRY_FLAGS: Record<string, string> = {
  'SA': '🇸🇦', 'AE': '🇦🇪', 'EG': '🇪🇬', 'JO': '🇯🇴', 'KW': '🇰🇼', 'QA': '🇶🇦',
  'BH': '🇧🇭', 'OM': '🇴🇲', 'IQ': '🇮🇶', 'US': '🇺🇸', 'GB': '🇬🇧', 'FR': '🇫🇷',
  'DE': '🇩🇪', 'TR': '🇹🇷', 'MA': '🇲🇦', 'DZ': '🇩🇿', 'TN': '🇹🇳', 'LY': '🇱🇾',
  'SD': '🇸🇩', 'SO': '🇸🇴', 'DJ': '🇩🇯', 'CN': '🇨🇳', 'JP': '🇯🇵', 'IN': '🇮🇳',
  'BR': '🇧🇷', 'CA': '🇨🇦', 'AU': '🇦🇺', 'IT': '🇮🇹', 'ES': '🇪🇸', 'RU': '🇷🇺',
  'IR': '🇮🇷', 'PK': '🇵🇰', 'BD': '🇧🇩', 'ID': '🇮🇩', 'MY': '🇲🇾', 'TH': '🇹🇭',
  'VN': '🇻🇳', 'PH': '🇵🇭', 'KR': '🇰🇷', 'SG': '🇸🇬'
};

// Alphabetical sections
const ALPHABET = ['#', 'A', 'B', 'C', 'E', 'F', 'G', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'Y'];

export default function SelectCountryScreen() {
  const router = useRouter();
  const { current } = useLocalSearchParams<{ current?: string }>();
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const query = search.toLowerCase();
    return COUNTRIES.filter(country => 
      country.nameAr.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query)
    );
  }, [search]);

  const onSelectCountry = (countryCode: string) => {
    router.back();
    setTimeout(() => {
      router.setParams({ selectedCountry: countryCode });
    }, 100);
  };

  const renderCountryItem = ({ item }: { item: Country }) => {
    const isHot = HOT_COUNTRIES.includes(item.code);
    const isSelected = item.code === current;
    const flag = COUNTRY_FLAGS[item.code] || '🏳️';

    return (
      <Pressable
        onPress={() => onSelectCountry(item.code)}
        style={[
          styles.countryItem,
          isSelected && styles.countryItemSelected
        ]}
      >
        <View style={styles.countryContent}>
          <View style={styles.countryInfo}>
            <Text style={styles.countryFlag}>{flag}</Text>
            <Text style={[
              styles.countryName,
              isSelected && styles.countryNameSelected
            ]}>
              {item.nameAr}
            </Text>
          </View>
          {isHot && (
            <View style={styles.hotLabel}>
              <Text style={styles.hotText}>HOT</Text>
            </View>
          )}
        </View>
        {isSelected && (
          <MCI name="check" size={20} color={ACCENT} />
        )}
      </Pressable>
    );
  };

  const renderAlphabetIndex = () => (
    <View style={styles.alphabetIndex}>
      {ALPHABET.map(letter => (
        <Pressable
          key={letter}
          style={styles.alphabetItem}
          onPress={() => {
            // Scroll to section logic could be added here
          }}
        >
          <Text style={styles.alphabetText}>{letter}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MCI name="arrow-right" size={24} color={ACCENT} />
        </Pressable>
        <Text style={styles.headerTitle}>البلد / المنطقة</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MCI name="magnify" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="البحث عن البلد..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          textAlign="right"
        />
      </View>

      {/* Countries List with Alphabet Index */}
      <View style={styles.listContainer}>
        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.code}
          renderItem={renderCountryItem}
          style={styles.countriesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.countriesListContent}
        />
        {renderAlphabetIndex()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: CARD,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: ACCENT,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#3b1b26',
    paddingVertical: 4,
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  countriesList: {
    flex: 1,
  },
  countriesListContent: {
    paddingRight: 8,
  },
  countryItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  countryItemSelected: {
    backgroundColor: CARD,
  },
  countryContent: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  countryFlag: {
    fontSize: 20,
    marginLeft: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#3b1b26',
    textAlign: 'right',
  },
  countryNameSelected: {
    color: ACCENT,
    fontWeight: '600',
  },
  hotLabel: {
    backgroundColor: HOT_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  hotText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  alphabetIndex: {
    width: 30,
    backgroundColor: '#F8F8F8',
    paddingVertical: 8,
    alignItems: 'center',
  },
  alphabetItem: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginVertical: 1,
  },
  alphabetText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});