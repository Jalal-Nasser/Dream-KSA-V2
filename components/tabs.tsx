import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';

const Tabs = ({ children, defaultValue, ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const tabsList = React.Children.toArray(children).find(
    (child) => child.props.isList
  );
  const tabsContent = React.Children.toArray(children).find(
    (child) => child.props.isContent
  );

  return (
    <View {...props}>
      <View style={styles.list}>
        {React.Children.map(tabsList.props.children, (child) =>
          React.cloneElement(child, {
            active: activeTab === child.props.value,
            onPress: () => setActiveTab(child.props.value),
          })
        )}
      </View>
      <View style={styles.content}>
        {React.Children.map(tabsContent.props.children, (child) =>
          activeTab === child.props.value && child
        )}
      </View>
    </View>
  );
};

export function TabsList({ children, ...props }) {
  return React.cloneElement(children, { isList: true, ...props });
}

export function TabsTrigger({ children, active, onPress, ...props }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.trigger, active && styles.triggerActive]}
      {...props}
    >
      <Text style={[styles.triggerText, active && styles.triggerTextActive]}>
        {children}
      </Text>
    </Pressable>
  );
}

export function TabsContent({ children, value, ...props }) {
  return React.cloneElement(children, { isContent: true, value, ...props });
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row-reverse',
    backgroundColor: '#374151',
    borderRadius: 8,
    marginBottom: 16,
  },
  trigger: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  triggerActive: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  triggerText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  triggerTextActive: {
    color: '#e5e7eb',
  },
  content: {
    // Styles for the content container
  },
});

export default Tabs;