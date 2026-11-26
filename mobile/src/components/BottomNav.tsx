import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { MainTab } from '../types';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface BottomNavProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
}

const NavTabItem: React.FC<{
  tab: { key: MainTab; label: string; icon: keyof typeof Ionicons.glyphMap };
  isActive: boolean;
  onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 130,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 140,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    }
  }, [isActive, scaleAnim]);

  return (
    <Pressable
      style={styles.tabButton}
      onPress={onPress}
      onPressIn={() => {
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: USE_NATIVE_DRIVER,
          speed: 35,
        }).start();
      }}
      onPressOut={() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 130,
          useNativeDriver: USE_NATIVE_DRIVER,
        }).start();
      }}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          isActive && { backgroundColor: theme.blueLight },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name={tab.icon}
          size={22}
          color={isActive ? theme.primary : theme.textMuted}
        />
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          { color: isActive ? theme.primaryLight : theme.textMuted },
          isActive && styles.activeTabLabel,
        ]}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  // Dành riêng cho người dùng du khách & khách vãng lai
  const tabs: { key: MainTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'home', label: t('tab_home'), icon: 'compass' },
    { key: 'planner', label: t('tab_planner'), icon: 'sparkles' },
    { key: 'itinerary', label: t('tab_itinerary'), icon: 'map' },
    { key: 'vision', label: t('tab_vision'), icon: 'camera' },
    { key: 'profile', label: t('tab_profile'), icon: 'person' },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.navBg, borderTopColor: theme.border },
      ]}
    >
      {tabs.map((tab) => (
        <NavTabItem
          key={tab.key}
          tab={tab}
          isActive={currentTab === tab.key}
          onPress={() => onSelectTab(tab.key)}
        />
      ))}
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
