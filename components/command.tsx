import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Search } from 'lucide-react-native';

const Command = ({ children, ...props }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChildren = React.Children.toArray(children).filter((child) => {
    if (React.isValidElement(child) && child.props.label) {
      return child.props.label.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  return (
    <View style={styles.container} {...props}>
      <View style={styles.inputContainer}>
        <Search size={20} color="#6b7280" />
        <TextInput
          style={styles.input}
          placeholder="Type a command or search..."
          placeholderTextColor="#6b7280"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <ScrollView style={styles.list}>
        {filteredChildren.length > 0 ? (
          filteredChildren
        ) : (
          <Text style={styles.noResultsText}>No results found.</Text>
        )}
      </ScrollView>
    </View>
  );
};

export function CommandItem({ children, onSelect, label, ...props }) {
  return (
    <Pressable
      style={styles.item}
      onPress={() => onSelect && onSelect()}
      {...props}
    >
      <Text style={styles.itemText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    overflow: 'hidden',
    width: '90%',
    maxHeight: '80%',
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  input: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 16,
    paddingHorizontal: 8,
  },
  list: {
    maxHeight: 250,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  itemText: {
    color: '#e5e7eb',
    fontSize: 16,
  },
  noResultsText: {
    color: '#9ca3af',
    padding: 16,
    textAlign: 'center',
  },
});