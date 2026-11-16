import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MainTab } from '../types';

interface BottomNavProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { key: MainTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', label: 'Khám phá', icon: 'compass' },
    { key: 'planner', label: 'Tạo lịch', icon: 'sparkles' },
    { key: 'itinerary', label: 'Lịch trình', icon: 'map' },
    { key: 'vision', label: 'Quét AI', icon: 'camera' },
    { key: 'profile', label: 'Cá nhân', icon: 'person' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? colors.primary : colors.textMuted}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
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
    backgroundColor: '#070D18',
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
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
    padding: 2,
    borderRadius: 12,
  },
  activeIconWrapper: {
    backgroundColor: colors.blueLight,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
});
