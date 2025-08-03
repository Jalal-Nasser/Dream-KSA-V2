import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const Table = ({ children, ...props }) => {
  return <View style={styles.table} {...props}>{children}</View>;
};

export function TableHeader({ children, ...props }) {
  return <View style={styles.header} {...props}>{children}</View>;
}

export function TableBody({ children, ...props }) {
  return <View style={styles.body} {...props}>{children}</View>;
}

export function TableFooter({ children, ...props }) {
  return <View style={styles.footer} {...props}>{children}</View>;
}

export function TableRow({ children, ...props }) {
  return <View style={styles.row} {...props}>{children}</View>;
}

export function TableHead({ children, ...props }) {
  return <View style={styles.head} {...props}><Text style={styles.headText}>{children}</Text></View>;
}

export function TableCell({ children, ...props }) {
  return <View style={styles.cell} {...props}><Text style={styles.cellText}>{children}</Text></View>;
}

export function TableCaption({ children, ...props }) {
  return <Text style={styles.caption} {...props}>{children}</Text>;
}

const styles = StyleSheet.create({
  table: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    backgroundColor: '#374151',
  },
  body: {
    // Styles for the table body
  },
  footer: {
    flexDirection: 'row-reverse',
    borderTopWidth: 1,
    borderTopColor: '#374151',
    backgroundColor: '#374151',
  },
  row: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  head: {
    flex: 1,
    padding: 16,
  },
  headText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cell: {
    flex: 1,
    padding: 16,
  },
  cellText: {
    color: '#e5e7eb',
    fontSize: 14,
  },
  caption: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    padding: 8,
  },
});

export default Table;