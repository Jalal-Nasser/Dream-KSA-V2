import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function Pagination({ children, ...props }) {
  return <View style={styles.container} {...props}>{children}</View>;
}

export function PaginationContent({ children, ...props }) {
  return <View style={styles.content} {...props}>{children}</View>;
}

export function PaginationItem({ children, ...props }) {
  return <View style={styles.item} {...props}>{children}</View>;
}

export function PaginationLink({ children, ...props }) {
  return (
    <Pressable style={styles.link} {...props}>
      <Text style={styles.linkText}>{children}</Text>
    </Pressable>
  );
}

export function PaginationPrevious({ ...props }) {
  return (
    <Pressable style={styles.navButton} {...props}>
      <ChevronRight size={20} color="#e5e7eb" />
    </Pressable>
  );
}

export function PaginationNext({ ...props }) {
  return (
    <Pressable style={styles.navButton} {...props}>
      <ChevronLeft size={20} color="#e5e7eb" />
    </Pressable>
  );
}

export function PaginationEllipsis({ ...props }) {
  return (
    <Text style={styles.ellipsis} {...props}>...</Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  content: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  item: {
    marginHorizontal: 4,
  },
  link: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  linkText: {
    color: '#e5e7eb',
    fontSize: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  ellipsis: {
    color: '#e5e7eb',
    paddingHorizontal: 8,
  },
});

export default Pagination;