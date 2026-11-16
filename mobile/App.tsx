import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { BottomNav } from './src/components/BottomNav';
import { AuthModal } from './src/screens/AuthModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlannerScreen } from './src/screens/PlannerScreen';
import { ItineraryScreen } from './src/screens/ItineraryScreen';
import { VisionScreen } from './src/screens/VisionScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MainTab } from './src/types';

function MainApp() {
  const { isDark, theme } = useTheme();
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [currentPlan, setCurrentPlan] = useState<any>(null);

  const handlePlanGenerated = (planData: any) => {
    setCurrentPlan(planData);
    setCurrentTab('itinerary');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.contentContainer}>
        {currentTab === 'home' && (
          <HomeScreen onNavigateToPlanner={() => setCurrentTab('planner')} />
        )}

        {currentTab === 'planner' && (
          <PlannerScreen onPlanGenerated={handlePlanGenerated} />
        )}

        {currentTab === 'itinerary' && (
          <ItineraryScreen initialItinerary={currentPlan} />
        )}

        {currentTab === 'vision' && (
          <VisionScreen onAddToItinerary={() => setCurrentTab('itinerary')} />
        )}

        {currentTab === 'profile' && <ProfileScreen />}
      </View>

      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
      <AuthModal />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});
