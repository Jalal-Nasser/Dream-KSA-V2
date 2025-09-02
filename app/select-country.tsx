import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, I18nManager } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { COUNTRIES, type Country } from '@/lib/countries';

const ACCENT = '#800F2F';
const CARD = '#FBE7EF';
const BORDER = '#F2CAD6';

// Popular countries for quick access
const FAVORITES = ['SA', 'AE', 'EG', 'JO', 'KW', 'QA', 'BH', 'OM', 'IQ', 'US', 'GB', 'FR', 'DE'];

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

  const favoriteCountries = useMemo(() => {
    return FAVORITES.map(code => COUNTRIES.find(c => c.code === code)).filter(Boolean) as Country[];
  }, []);

  const onSelectCountry = (countryCode: string) => {
    router.back();
    // Use a small delay to ensure the navigation completes before updating
    setTimeout(() => {
      router.setParams({ selectedCountry: countryCode });
    }, 100);
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <Pressable
      onPress={() => onSelectCountry(item.code)}
      style={[
        styles.countryItem,
        item.code === current && styles.countryItemSelected
      ]}
    >
      <View style={styles.countryContent}>
        <Text style={[
          styles.countryName,
          item.code === current && styles.countryNameSelected
        ]}>
          {item.nameAr}
        </Text>
        <Text style={styles.countryCode}>{item.code}</Text>
      </View>
      {item.code === current && (
        <MCI name="check" size={20} color={ACCENT} />
      )}
    </Pressable>
  );

  const renderFavoriteItem = ({ item }: { item: Country }) => (
    <Pressable
      onPress={() => onSelectCountry(item.code)}
      style={[
        styles.favoriteItem,
        item.code === current && styles.favoriteItemSelected
      ]}
    >
      <Text style={[
        styles.favoriteName,
        item.code === current && styles.favoriteNameSelected
      ]}>
        {item.nameAr}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MCI name="arrow-right" size={24} color={ACCENT} />
        </Pressable>
        <Text style={styles.headerTitle}>اختر البلد</Text>
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

      {/* Favorites (only show when not searching) */}
      {!search && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الدول المفضلة</Text>
          <FlatList
            data={favoriteCountries}
            keyExtractor={(item) => item.code}
            renderItem={renderFavoriteItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favoritesList}
          />
        </View>
      )}

      {/* Countries List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {search ? `نتائج البحث (${filteredCountries.length})` : 'جميع الدول'}
        </Text>
        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.code}
          renderItem={renderCountryItem}
          style={styles.countriesList}
          showsVerticalScrollIndicator={false}
        />
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ACCENT,
    marginHorizontal: 16,
    marginBottom: 8,
    textAlign: 'right',
  },
  favoritesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  favoriteItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  favoriteItemSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  favoriteName: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
    textAlign: 'center',
  },
  favoriteNameSelected: {
    color: '#FFF',
  },
  countriesList: {
    flex: 1,
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
  countryCode: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
