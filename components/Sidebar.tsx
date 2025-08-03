import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ScrollView,
  ViewProps,
  PressableProps,
  TextProps,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { PanelLeft, X } from 'lucide-react-native';

const SIDEBAR_WIDTH_MOBILE = 288; // 18rem

// --- Context for Sidebar State ---
interface SidebarContextProps {
  isMobile: boolean;
  // For non-mobile layouts, you might manage state here
}

const SidebarContext = createContext<SidebarContextProps | null>(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// --- Main Sidebar Content Component ---
// This is what will be rendered inside the drawer.
const SidebarContent = ({ navigation }: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView style={styles.contentRoot}>
      <SidebarHeader>
        <Text style={styles.headerTitle}>Menu</Text>
        <Pressable onPress={() => navigation.closeDrawer()}>
          <X size={24} color="black" />
        </Pressable>
      </SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem label="Home" onPress={() => { /* Navigate... */ }} />
        <SidebarMenuItem label="Dashboard" onPress={() => { /* Navigate... */ }} isActive />
        <SidebarMenuItem label="Settings" onPress={() => { /* Navigate... */ }} />
      </SidebarMenu>
      <SidebarFooter>
        <Text style={styles.footerText}>© 2025</Text>
      </SidebarFooter>
    </DrawerContentScrollView>
  );
};


// --- Sub-components for building the sidebar UI ---

export const SidebarHeader = ({ children, style, ...props }: ViewProps) => (
  <View style={[styles.header, style]} {...props}>{children}</View>
);

export const SidebarFooter = ({ children, style, ...props }: ViewProps) => (
  <View style={[styles.footer, style]} {...props}>{children}</View>
);

export const SidebarMenu = ({ children, style, ...props }: ViewProps) => (
  <View style={[styles.menu, style]} {...props}>{children}</View>
);

interface SidebarMenuItemProps extends PressableProps {
  label: string;
  isActive?: boolean;
}

export const SidebarMenuItem = ({ label, isActive, style, ...props }: SidebarMenuItemProps) => (
  <Pressable style={[styles.menuItem, isActive && styles.menuItemActive, style]} {...props}>
    <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>{label}</Text>
  </Pressable>
);


// --- Navigator Setup ---
const Drawer = createDrawerNavigator();

const DummyScreen = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Main Content</Text>
      <Pressable onPress={() => navigation.openDrawer()} style={styles.trigger}>
         <PanelLeft size={24} color="white" />
      </Pressable>
    </View>
  );
}

// --- The Main Exportable Sidebar Component ---
export function Sidebar() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // For a tablet/desktop version, you would conditionally render a fixed View
  // instead of using the Drawer navigator.
  if (!isMobile) {
    // Return a tablet/desktop layout here
     return (
        <View style={{flexDirection: 'row', flex: 1}}>
            <View style={{width: 250, backgroundColor: '#f8f8f8', padding: 10}}>
                {/* Simplified Static Sidebar for large screens */}
                <SidebarHeader><Text style={styles.headerTitle}>Menu</Text></SidebarHeader>
                 <SidebarMenu>
                    <SidebarMenuItem label="Home" />
                    <SidebarMenuItem label="Dashboard" isActive/>
                    <SidebarMenuItem label="Settings" />
                </SidebarMenu>
            </View>
            <DummyScreen />
        </View>
     )
  }

  // --- Mobile Drawer Layout ---
  return (
    <SidebarContext.Provider value={{ isMobile }}>
      <Drawer.Navigator
        drawerContent={(props) => <SidebarContent {...props} />}
        screenOptions={{
          drawerStyle: { width: SIDEBAR_WIDTH_MOBILE },
          headerShown: false,
          drawerType: 'front',
        }}
      >
        <Drawer.Screen name="MainContent" component={DummyScreen} />
      </Drawer.Navigator>
    </SidebarContext.Provider>
  );
}


// --- Styles ---

const styles = StyleSheet.create({
  contentRoot: {
    flex: 1,
    backgroundColor: '#F9FAFB', // sidebar background
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // sidebar-border
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
   headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // sidebar-border
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  menu: {
    padding: 8,
    gap: 4,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  menuItemActive: {
    backgroundColor: '#D1FAE5', // sidebar-accent
  },
  menuItemText: {
    fontSize: 16,
    color: '#374151',
  },
  menuItemTextActive: {
    color: '#065F46', // sidebar-accent-foreground
    fontWeight: '600',
  },
   trigger: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 20
  }
});