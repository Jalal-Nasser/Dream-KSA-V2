import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Form = ({ children, ...props }) => {
  return (
    <View style={styles.form} {...props}>
      {children}
    </View>
  );
};

export function FormField({ children, ...props }) {
  return <View style={styles.formField} {...props}>{children}</View>;
}

export function FormLabel({ children, ...props }) {
  return <Text style={styles.formLabel} {...props}>{children}</Text>;
}

export function FormControl({ children, ...props }) {
  return <View style={styles.formControl} {...props}>{children}</View>;
}

export function FormDescription({ children, ...props }) {
  return <Text style={styles.formDescription} {...props}>{children}</Text>;
}

export function FormMessage({ children, ...props }) {
  return <Text style={styles.formMessage} {...props}>{children}</Text>;
}

const styles = StyleSheet.create({
  form: {
    // Styles for the form container
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    color: '#e5e7eb',
    fontSize: 16,
    marginBottom: 8,
  },
  formControl: {
    // Styles for the control container
  },
  formDescription: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
  },
  formMessage: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default Form;