import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { BottomNav } from './src/components/BottomNav';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlannerScreen } from './src/screens/PlannerScreen';
import { ItineraryScreen } from './src/screens/ItineraryScreen';
import { VisionScreen } from './src/screens/VisionScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';
import { MainTab } from './src/types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [currentPlan, setCurrentPlan] = useState<any>(null);

  const handlePlanGenerated = (planData: any) => {
    setCurrentPlan(planData);
    setCurrentTab('itinerary');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style="light" />
        
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
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  contentContainer: {
    flex: 1,
  },
});
