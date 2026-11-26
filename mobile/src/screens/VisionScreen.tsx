import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import { usePlaces } from '../context/PlacesContext';
import { useTheme } from '../context/ThemeContext';
import { FadeInView, LaserSweep, PulseView, ScalePress } from '../components/AnimatedUI';
import { MOCK_SPECIALTIES, VisionSampleKey } from '../data/mockSpecialties';
import { Alert } from '../utils/dialog';

interface VisionScreenProps {
  onAddToItinerary?: () => void;
  onGoPlanner?: () => void;
}

export const VisionScreen: React.FC<VisionScreenProps> = ({ onAddToItinerary, onGoPlanner }) => {
  const { theme } = useTheme();
  const { isVietnamese, t } = useLanguage();
  const { places } = usePlaces();
  const {
    plan,
    addPlaceToDay,
    sim,
    setSim,
    activeVisionSample,
    setActiveVisionSample,
  } = useAppData();
  const [isScanning, setIsScanning] = useState(false);

  const sampleImages: Record<
    VisionSampleKey,
    {
      url: string;
      title: string;
      emoji: string;
      shortLabel: string;
      category: string;
      confidence: number;
      desc: string;
      howToEat?: string;
      placeId: string;
      matchedPlace: {
        name: string;
        address: string;
        cost: string;
        distance: string;
      };
    }
  > = {
    miquang: {
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      title: isVietnamese ? MOCK_SPECIALTIES[0].name : MOCK_SPECIALTIES[0].nameEn,
      emoji: '🍜',
      shortLabel: 'Mì Quảng',
      category: isVietnamese ? 'Đặc sản ẩm thực Đà Nẵng' : 'Da Nang Culinary Specialty',
      confidence: 97,
      desc: isVietnamese ? MOCK_SPECIALTIES[0].story : MOCK_SPECIALTIES[0].storyEn,
      howToEat: isVietnamese ? MOCK_SPECIALTIES[0].howToEat : MOCK_SPECIALTIES[0].howToEatEn,
      placeId: 'dn01',
      matchedPlace: {
        name: 'Mì Quảng Bà Mua',
        address: '19 Trần Bình Trọng, Hải Châu, Đà Nẵng',
        cost: '45.000đ - 65.000đ',
        distance: '450m',
      },
    },
    caolau: {
      url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
      title: isVietnamese ? MOCK_SPECIALTIES[1].name : MOCK_SPECIALTIES[1].nameEn,
      emoji: '🥢',
      shortLabel: 'Cao Lầu',
      category: isVietnamese ? 'Đặc sản ẩm thực Hội An' : 'Hoi An Culinary Specialty',
      confidence: 96,
      desc: isVietnamese ? MOCK_SPECIALTIES[1].story : MOCK_SPECIALTIES[1].storyEn,
      howToEat: isVietnamese ? MOCK_SPECIALTIES[1].howToEat : MOCK_SPECIALTIES[1].howToEatEn,
      placeId: 'ha02',
      matchedPlace: {
        name: 'Cao Lầu Thanh Hội An',
        address: '26 Thái Phiên, Minh An, Hội An',
        cost: '40.000đ - 55.000đ',
        distance: '650m',
      },
    },
    banhtrangthitheo: {
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      title: isVietnamese ? MOCK_SPECIALTIES[2].name : MOCK_SPECIALTIES[2].nameEn,
      emoji: '🌯',
      shortLabel: isVietnamese ? 'Bánh Tráng Thịt Heo' : 'Pork Rolls',
      category: isVietnamese ? 'Đặc sản ẩm thực Đà Nẵng' : 'Da Nang Culinary Specialty',
      confidence: 95,
      desc: isVietnamese ? MOCK_SPECIALTIES[2].story : MOCK_SPECIALTIES[2].storyEn,
      howToEat: isVietnamese ? MOCK_SPECIALTIES[2].howToEat : MOCK_SPECIALTIES[2].howToEatEn,
      placeId: 'dn05',
      matchedPlace: {
        name: 'Đặc Sản Trần (Bánh Tráng Cuốn Thịt Heo)',
        address: '04 Lê Duẩn, Hải Châu, Đà Nẵng',
        cost: '120.000đ - 160.000đ',
        distance: '900m',
      },
    },
    banhmiphuong: {
      url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80',
      title: isVietnamese ? MOCK_SPECIALTIES[3].name : MOCK_SPECIALTIES[3].nameEn,
      emoji: '🥖',
      shortLabel: 'Bánh Mì Phượng',
      category: isVietnamese ? 'Ẩm thực đường phố Hội An' : 'Hoi An Street Food',
      confidence: 98,
      desc: isVietnamese ? MOCK_SPECIALTIES[3].story : MOCK_SPECIALTIES[3].storyEn,
      howToEat: isVietnamese ? MOCK_SPECIALTIES[3].howToEat : MOCK_SPECIALTIES[3].howToEatEn,
      placeId: 'ha03',
      matchedPlace: {
        name: 'Bánh Mì Phượng Hội An',
        address: '2B Phan Chu Trinh, Minh An, Hội An',
        cost: '30.000đ - 45.000đ',
        distance: '500m',
      },
    },
    caurong: {
      url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80',
      title: isVietnamese ? 'Cầu Rồng Đà Nẵng' : 'Dragon Bridge Da Nang',
      emoji: '🐉',
      shortLabel: isVietnamese ? 'Cầu Rồng' : 'Dragon Bridge',
      category: isVietnamese ? 'Địa danh biểu tượng' : 'Iconic Landmark',
      confidence: 98,
      desc: isVietnamese
        ? 'Cây cầu thép dài 666m hình con rồng vươn mình ra biển lớn, có khả năng phun lửa và phun nước vào 21h thứ Bảy và Chủ Nhật.'
        : 'A 666m steel dragon-shaped bridge stretching toward the sea, breathing real fire and water every Saturday and Sunday at 21:00.',
      placeId: 'dn02',
      matchedPlace: {
        name: 'Cầu Rồng Phun Lửa',
        address: 'Bắc Mỹ Phú, Sơn Trà, Đà Nẵng',
        cost: isVietnamese ? 'Miễn phí' : 'Free',
        distance: '1.2km',
      },
    },
  };

  const currentSample = sampleImages[activeVisionSample] ?? sampleImages.miquang;

  const handleAdd = () => {
    const placeId = currentSample.placeId;
    const place = places.find((p) => p.id === placeId);
    if (!place || !place.is_active) {
      Alert.alert('Không khả dụng', 'Địa điểm này đang tạm ẩn khỏi hệ thống.');
      return;
    }
    if (!plan) {
      Alert.alert('Chưa có lịch trình', 'Hãy tạo lịch trình bằng AI trước rồi thêm địa điểm vào.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Tạo lịch trình', onPress: () => onGoPlanner?.() },
      ]);
      return;
    }
    if (plan.days[0].items.some((it) => it.place_id === place.id)) {
      Alert.alert('Đã có trong lịch', `${place.name} đã nằm trong Ngày 1.`);
      return;
    }
    addPlaceToDay(0, place);
    Alert.alert('Đã thêm', `Đã thêm ${place.name} vào Ngày 1.`, [
      { text: 'Ở lại', style: 'cancel' },
      { text: 'Xem lịch trình', onPress: () => onAddToItinerary?.() },
    ]);
  };

  // ---------- TRẠNG THÁI TỪ CHỐI CAMERA ----------
  if (sim.cameraDenied) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }]}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: theme.roseLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Ionicons name="videocam-off-outline" size={46} color={theme.rose} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>Chưa cấp quyền camera</Text>
        <Text style={{ fontSize: 13, color: theme.textMuted, textAlign: 'center', lineHeight: 20, marginTop: 8 }}>
          Vivu AI cần camera để chụp món ăn hoặc địa điểm. Bạn có thể cấp quyền trong Cài đặt, hoặc chọn ảnh có sẵn từ thư viện.
        </Text>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14, marginTop: 18 }}
          onPress={() => setSim({ cameraDenied: false })}
        >
          <Ionicons name="camera" size={16} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Cấp quyền camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 14, marginTop: 10 }}
          onPress={() => setSim({ cameraDenied: false })}
        >
          <Ionicons name="images-outline" size={16} color={theme.text} />
          <Text style={{ color: theme.text, fontWeight: '700', fontSize: 13 }}>Chọn ảnh từ thư viện</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const triggerScan = (key: VisionSampleKey) => {
    setActiveVisionSample(key);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 900);
  };

  const sampleKeys: VisionSampleKey[] = [
    'miquang',
    'caolau',
    'banhtrangthitheo',
    'banhmiphuong',
    'caurong',
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View style={[styles.badgeWrap, { backgroundColor: theme.blueLight }]}>
          <Ionicons name="sparkles" size={12} color={theme.accent} />
          <Text style={[styles.badgeText, { color: theme.accent }]}>GEMINI VISION AI</Text>
        </View>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {t('vision_title')}
        </Text>
        <Text style={[styles.headerSub, { color: theme.textMuted }]}>
          {t('vision_sub')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.viewfinderContainer}>
          <Image source={{ uri: currentSample.url }} style={styles.previewImage} />
          <LaserSweep color={theme.accent} height={216} fast={isScanning} />

          <View style={[styles.corner, styles.cornerTL, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: theme.accent }]} />

          <View style={styles.scanStatusPill}>
            {isScanning ? (
              <View style={styles.scanningRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.scanStatusText}>{t('vision_analyzing')}</Text>
              </View>
            ) : (
              <View style={styles.scanningRow}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.scanStatusText}>{t('vision_done')}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sampleSwitcherSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.switcherLabel, { color: theme.textSub, marginBottom: 0 }]}>
              {t('vision_pick_sample')}
            </Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Camera',
                  isVietnamese
                    ? 'Tính năng mở expo-image-picker để chọn ảnh từ máy thật.'
                    : 'Opens expo-image-picker to choose a real photo from your device.'
                )
              }
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Ionicons name="camera-outline" size={13} color={theme.primaryLight} />
              <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primaryLight }}>
                {t('vision_upload')}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {sampleKeys.map((key) => {
              const item = sampleImages[key];
              const isSelected = activeVisionSample === key;
              return (
                <ScalePress
                  key={key}
                  style={[
                    styles.sampleChipBtn,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    isSelected && {
                      backgroundColor: theme.blueLight,
                      borderColor: theme.primaryLight,
                    },
                  ]}
                  onPress={() => triggerScan(key)}
                >
                  <Text style={styles.sampleBtnEmoji}>{item.emoji}</Text>
                  <Text
                    style={[
                      styles.sampleBtnText,
                      { color: isSelected ? theme.primaryLight : theme.text },
                    ]}
                  >
                    {item.shortLabel}
                  </Text>
                </ScalePress>
              );
            })}
          </ScrollView>
        </View>

        {isScanning ? (
          <PulseView
            style={[
              styles.resultCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ width: 120, height: 18, borderRadius: 6, backgroundColor: theme.border }} />
              <View style={{ width: 90, height: 18, borderRadius: 6, backgroundColor: theme.border }} />
            </View>
            <View style={{ width: '75%', height: 20, borderRadius: 6, backgroundColor: theme.border, marginBottom: 10 }} />
            <View style={{ width: '100%', height: 12, borderRadius: 6, backgroundColor: theme.border, marginBottom: 6 }} />
            <View style={{ width: '90%', height: 12, borderRadius: 6, backgroundColor: theme.border, marginBottom: 14 }} />
            <View style={{ width: '100%', height: 58, borderRadius: 12, backgroundColor: theme.border }} />
          </PulseView>
        ) : (
          <FadeInView
            triggerKey={activeVisionSample}
            duration={300}
            slideOffset={12}
            style={[
              styles.resultCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: theme.blueLight }]}>
                <Text style={[styles.categoryBadgeText, { color: theme.primaryLight }]}>
                  {currentSample.category}
                </Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Ionicons name="flash" size={12} color={theme.emerald} />
                <Text style={[styles.confidenceText, { color: theme.emerald }]}>
                  {t('vision_confidence')} {currentSample.confidence}%
                </Text>
              </View>
            </View>

            <Text style={[styles.resultTitle, { color: theme.text }]}>{currentSample.title}</Text>
            <Text style={[styles.resultDesc, { color: theme.textMuted }]}>{currentSample.desc}</Text>

            {currentSample.howToEat && (
              <View
                style={[
                  styles.howToEatBox,
                  { backgroundColor: theme.amberLight, borderColor: theme.amber },
                ]}
              >
                <Text style={{ fontSize: 10, fontWeight: '800', color: theme.secondary }}>
                  {t('vision_how_to_eat')}
                </Text>
                <Text style={{ fontSize: 10, color: theme.text, lineHeight: 15, marginTop: 2 }}>
                  {currentSample.howToEat}
                </Text>
              </View>
            )}

            <View style={[styles.matchedSection, { borderTopColor: theme.border }]}>
              <Text style={[styles.matchedLabel, { color: theme.textSub }]}>
                {t('vision_matched_label')}
              </Text>
              <View
                style={[
                  styles.matchedBox,
                  { backgroundColor: theme.bg, borderColor: theme.border },
                ]}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.matchedName, { color: theme.text }]}>
                    {currentSample.matchedPlace.name}
                  </Text>
                  <Text style={[styles.matchedAddress, { color: theme.textSub }]}>
                    {currentSample.matchedPlace.address}
                  </Text>
                  <View style={styles.matchedMeta}>
                    <Text style={[styles.matchedCost, { color: theme.emerald }]}>
                      {currentSample.matchedPlace.cost}
                    </Text>
                    <Text style={[styles.matchedDistance, { color: theme.textMuted }]}>
                      • Cách bạn {currentSample.matchedPlace.distance}
                    </Text>
                  </View>
                </View>

                <ScalePress
                  style={[styles.addBtn, { backgroundColor: theme.primary }]}
                  onPress={handleAdd}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                  <Text style={styles.addBtnText}>{t('vision_add_btn')}</Text>
                </ScalePress>
              </View>
            </View>
          </FadeInView>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    marginBottom: 4,
  },
  badgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  headerTitle: { fontSize: 15, fontWeight: '800' },
  headerSub: { fontSize: 10, marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  viewfinderContainer: {
    height: 220,
    backgroundColor: '#070D18',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    borderStyle: 'dashed',
  },
  previewImage: { width: '100%', height: '100%' },
  scannerLaser: { position: 'absolute', left: 0, right: 0, top: '48%', height: 2 },
  corner: { position: 'absolute', width: 20, height: 20 },
  cornerTL: { top: 8, left: 8, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 8, right: 8, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 3, borderRightWidth: 3 },
  scanStatusPill: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scanningRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scanStatusText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  sampleSwitcherSection: { marginTop: 14 },
  switcherLabel: { fontSize: 10, marginBottom: 6 },
  switcherButtonsRow: { flexDirection: 'row', gap: 8 },
  sampleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  sampleBtnEmoji: { fontSize: 14 },
  sampleBtnText: { fontSize: 11, fontWeight: '700' },
  sampleBtnCustom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  sampleBtnCustomText: { fontSize: 11, fontWeight: '600' },
  resultCard: { marginTop: 16, borderRadius: 18, padding: 14, borderWidth: 1 },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  categoryBadgeText: { fontSize: 9, fontWeight: '700' },
  confidenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  confidenceText: { fontSize: 10, fontWeight: '800' },
  resultTitle: { fontSize: 14, fontWeight: '800' },
  resultDesc: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  matchedSection: { marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
  matchedLabel: { fontSize: 10, marginBottom: 8, fontWeight: '600' },
  matchedBox: {
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  matchedName: { fontSize: 12, fontWeight: '700' },
  matchedAddress: { fontSize: 9, marginTop: 2 },
  matchedMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  matchedCost: { fontSize: 10, fontWeight: '700' },
  matchedDistance: { fontSize: 9, marginLeft: 4 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  sampleChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  howToEatBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
