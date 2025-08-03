import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const Calendar = ({ ...props }) => {
  return (
    <View style={styles.container} {...props}>
      <View style={styles.header}>
        <Text style={styles.title}>أغسطس ٢٠٢٥</Text>
        <View style={styles.navButtons}>
          <ChevronRight size={24} color="#e5e7eb" style={styles.navButton} />
          <ChevronLeft size={24} color="#e5e7eb" style={styles.navButton} />
        </View>
      </View>
      <View style={styles.weekdays}>
        {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day, index) => (
          <Text key={index} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>
      <View style={styles.days}>
        {/* Placeholder for days */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  navButtons: {
    flexDirection: 'row',
  },
  navButton: {
    padding: 8,
  },
  weekdays: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: 'bold',
    width: '14%',
    textAlign: 'center',
  },
  days: {
    // Placeholder for day grid
  },
});

export default Calendar;