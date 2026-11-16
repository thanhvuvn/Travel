import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { MainTab } from '../types';

interface BottomNavProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { theme } = useTheme();

  const tabs: { key: MainTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', label: 'Khám phá', icon: 'compass' },
    { key: 'planner', label: 'Tạo lịch', icon: 'sparkles' },
    { key: 'itinerary', label: 'Lịch trình', icon: 'map' },
    { key: 'vision', label: 'Quét AI', icon: 'camera' },
    { key: 'profile', label: 'Cá nhân', icon: 'person' },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.navBg, borderTopColor: theme.border },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive && { backgroundColor: theme.blueLight },
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? theme.primary : theme.textMuted}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? theme.primaryLight : theme.textMuted },
                isActive && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 12,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
});
