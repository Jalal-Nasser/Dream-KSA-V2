import React from 'react';
import { View, Text, Pressable, Modal, FlatList, TextInput } from 'react-native';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { COUNTRIES, countryNameAr, type Country } from '@/lib/countries';

type CountryPickerProps = {
  value: string;
  onChange: (countryCode: string) => void;
  placeholder?: string;
};

export function CountryPicker({ value, onChange, placeholder = "اختر البلد" }: CountryPickerProps) {
  const [show, setShow] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const filteredCountries = React.useMemo(() => {
    if (!search) return COUNTRIES;
    return COUNTRIES.filter(country => 
      country.nameAr.toLowerCase().includes(search.toLowerCase()) ||
      country.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const selectedCountry = COUNTRIES.find(c => c.code === value);

  return (
    <View>
      <Pressable 
        onPress={() => setShow(true)}
        style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#eee',
          backgroundColor: '#fff'
        }}
      >
        <MCI name="chevron-left" size={20} color="#666" />
        <Text style={{ color: selectedCountry ? '#333' : '#999', textAlign: 'right' }}>
          {selectedCountry ? selectedCountry.nameAr : placeholder}
        </Text>
      </Pressable>

      <Modal visible={show} animationType="slide" presentationStyle="pageSheet">
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* Header */}
          <View style={{ 
            flexDirection: 'row-reverse', 
            alignItems: 'center', 
            paddingHorizontal: 16, 
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#eee'
          }}>
            <Pressable onPress={() => setShow(false)} style={{ padding: 8 }}>
              <MCI name="close" size={24} color="#666" />
            </Pressable>
            <Text style={{ flex: 1, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
              اختر البلد
            </Text>
          </View>

          {/* Search */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="البحث عن البلد..."
              style={{
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                textAlign: 'right'
              }}
            />
          </View>

          {/* Countries List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item.code);
                  setShow(false);
                }}
                style={{
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f0f0f0',
                  backgroundColor: item.code === value ? '#FFF0F3' : '#fff'
                }}
              >
                <Text style={{ 
                  flex: 1, 
                  fontSize: 16, 
                  color: '#333',
                  textAlign: 'right'
                }}>
                  {item.nameAr}
                </Text>
                <Text style={{ 
                  fontSize: 12, 
                  color: '#666',
                  marginLeft: 8
                }}>
                  {item.code}
                </Text>
                {item.code === value && (
                  <MCI name="check" size={20} color="#800F2F" style={{ marginLeft: 8 }} />
                )}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
