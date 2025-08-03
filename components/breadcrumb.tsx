import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

export default function Breadcrumb({ children, ...props }) {
  return (
    <View style={styles.container} {...props}>
      {children}
    </View>
  );
}

export function BreadcrumbItem({ children, ...props }) {
  return <View style={styles.item} {...props}>{children}</View>;
}

export function BreadcrumbLink({ children, ...props }) {
  return <Text style={styles.link} {...props}>{children}</Text>;
}

export function BreadcrumbSeparator({ ...props }) {
  return <ChevronRight size={16} color="#9ca3af" style={styles.separator} {...props} />;
}

export function BreadcrumbPage({ children, ...props }) {
  return <Text style={styles.page} {...props}>{children}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  link: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  separator: {
    marginHorizontal: 8,
  },
  page: {
    color: '#9ca3af',
    fontSize: 14,
  },
});