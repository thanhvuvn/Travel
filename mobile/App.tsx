import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { AppDataProvider } from './src/context/AppDataContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PlacesProvider } from './src/context/PlacesContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { BottomNav } from './src/components/BottomNav';
import { FadeInView } from './src/components/AnimatedUI';
import { AdminScreen } from './src/screens/AdminScreen';
import { AuthModal } from './src/screens/AuthModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { ItineraryScreen } from './src/screens/ItineraryScreen';
import { Onboarding } from './src/screens/Onboarding';
import { PlaceDetailScreen } from './src/screens/PlaceDetailScreen';
import { PlannerScreen } from './src/screens/PlannerScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { VisionScreen } from './src/screens/VisionScreen';
import { MainTab, Place } from './src/types';

const ONBOARDING_KEY = 'vivu_onboarded_v1';

function MainApp() {
  const { isDark, theme } = useTheme();
  const { role, logout } = useAuth();

  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);
  const [adminPreviewCustomerApp, setAdminPreviewCustomerApp] = useState(false);

  // null = đang đọc bộ nhớ, true = hiện onboarding, false = bỏ qua
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((v) => setShowOnboarding(v !== 'done'))
      .catch(() => setShowOnboarding(false));
  }, []);

  const finishOnboarding = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'done').catch(() => {});
    setShowOnboarding(false);
  };

  const isAdmin = role === 'admin';
  const adminView = isAdmin && !adminPreviewCustomerApp;

  const goTab = (tab: MainTab) => {
    setDetailPlace(null);
    setCurrentTab(tab);
  };

  const renderBody = () => {
    if (showOnboarding === null) return <View style={{ flex: 1 }} />;
    if (showOnboarding) return <Onboarding onFinish={finishOnboarding} />;

    if (adminView) {
      return (
        <View style={styles.contentContainer}>
          <AdminScreen onLogout={logout} onPreviewUserApp={() => setAdminPreviewCustomerApp(true)} />
        </View>
      );
    }

    return (
      <>
        {isAdmin && adminPreviewCustomerApp && (
          <View style={[styles.adminBanner, { backgroundColor: theme.rose }]}>
            <View style={styles.adminBannerInfo}>
              <Ionicons name="eye" size={14} color="#fff" />
              <Text style={styles.adminBannerText}>Chế độ xem trước App Khách (Admin Preview)</Text>
            </View>
            <TouchableOpacity style={styles.adminReturnBtn} onPress={() => setAdminPreviewCustomerApp(false)}>
              <Ionicons name="arrow-back" size={12} color="#fff" />
              <Text style={styles.adminReturnBtnText}>Về Admin</Text>
            </TouchableOpacity>
          </View>
        )}

        {detailPlace ? (
          <FadeInView
            triggerKey={`detail-${detailPlace.id}`}
            duration={260}
            slideOffset={14}
            style={styles.contentContainer}
          >
            <PlaceDetailScreen
              place={detailPlace}
              onBack={() => setDetailPlace(null)}
              onGoPlanner={() => goTab('planner')}
              onGoItinerary={() => goTab('itinerary')}
            />
          </FadeInView>
        ) : (
          <>
            <FadeInView
              triggerKey={`tab-${currentTab}`}
              duration={240}
              slideOffset={10}
              style={styles.contentContainer}
            >
              {currentTab === 'home' && (
                <HomeScreen
                  onNavigateToPlanner={() => goTab('planner')}
                  onNavigateToVision={() => goTab('vision')}
                  onOpenPlace={setDetailPlace}
                />
              )}
              {currentTab === 'planner' && <PlannerScreen onPlanGenerated={() => goTab('itinerary')} />}
              {currentTab === 'itinerary' && (
                <ItineraryScreen onNavigateToPlanner={() => goTab('planner')} onOpenPlace={setDetailPlace} />
              )}
              {currentTab === 'vision' && (
                <VisionScreen onAddToItinerary={() => goTab('itinerary')} onGoPlanner={() => goTab('planner')} />
              )}
              {currentTab === 'profile' && (
                <ProfileScreen
                  onNavigateToAdmin={() => setAdminPreviewCustomerApp(false)}
                  onOpenPlace={setDetailPlace}
                  onShowOnboarding={() => setShowOnboarding(true)}
                />
              )}
            </FadeInView>
            <BottomNav currentTab={currentTab} onSelectTab={goTab} />
          </>
        )}
      </>
    );
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: isDark ? '#050B14' : '#E2E8F0' }]}>
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: theme.bg,
            maxWidth: Platform.OS === 'web' ? (adminView ? 960 : 520) : undefined,
          },
        ]}
        edges={['top']}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {renderBody()}
        <AuthModal />
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <PlacesProvider>
            <AppDataProvider>
              <MainApp />
            </AppDataProvider>
          </PlacesProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safeArea: { flex: 1, width: '100%' },
  contentContainer: { flex: 1 },
  adminBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6 },
  adminBannerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adminBannerText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  adminReturnBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  adminReturnBtnText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
