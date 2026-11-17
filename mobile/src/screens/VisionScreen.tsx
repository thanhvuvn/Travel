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
import { usePlaces } from '../context/PlacesContext';
import { useTheme } from '../context/ThemeContext';
import { Alert } from '../utils/dialog';

interface VisionScreenProps {
  onAddToItinerary?: () => void;
  onGoPlanner?: () => void;
}

export const VisionScreen: React.FC<VisionScreenProps> = ({ onAddToItinerary, onGoPlanner }) => {
  const { theme } = useTheme();
  const { places } = usePlaces();
  const { plan, addPlaceToDay, sim, setSim } = useAppData();
  const [isScanning, setIsScanning] = useState(false);
  const [activeImageKey, setActiveImageKey] = useState<'miquang' | 'caurong'>('miquang');

  const sampleImages = {
    miquang: {
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      title: 'Mì Quảng Tôm Thịt / Ếch',
      category: 'Đặc sản ẩm thực xứ Quảng',
      confidence: 96,
      desc: 'Món ăn linh hồn của đất Quảng, sợi mì làm từ bột gạo dẻo thơm, nước nhưn đậm đà chan sâm sấp, ăn kèm rau sống Trà Quế và bánh tráng mè nướng giòn.',
      matchedPlace: {
        name: 'Mì Quảng Bà Mua',
        address: '19 Trần Bình Trọng, Hải Châu, Đà Nẵng',
        cost: '45.000đ - 65.000đ',
        distance: '450m',
      },
    },
    caurong: {
      url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80',
      title: 'Cầu Rồng Đà Nẵng',
      category: 'Địa danh biểu tượng',
      confidence: 98,
      desc: 'Cây cầu thép dài 666m hình con rồng vươn mình ra biển lớn, có khả năng phun lửa và phun nước vào 21h thứ Bảy và Chủ Nhật.',
      matchedPlace: {
        name: 'Cầu Rồng Phun Lửa',
        address: 'Bắc Mỹ Phú, Sơn Trà, Đà Nẵng',
        cost: 'Miễn phí',
        distance: '1.2km',
      },
    },
  };

  const currentSample = sampleImages[activeImageKey];

  const handleAdd = () => {
    const placeId = activeImageKey === 'miquang' ? 'dn01' : 'dn02';
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

  const triggerScan = (key: 'miquang' | 'caurong') => {
    setActiveImageKey(key);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

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
          Quét Món Ăn & Danh Thắng
        </Text>
        <Text style={[styles.headerSub, { color: theme.textMuted }]}>
          Chụp ảnh để AI nhận diện và tìm quán ngon chuẩn vị
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.viewfinderContainer}>
          <Image source={{ uri: currentSample.url }} style={styles.previewImage} />
          <View style={[styles.scannerLaser, { backgroundColor: theme.accent }]} />

          <View style={[styles.corner, styles.cornerTL, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: theme.accent }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: theme.accent }]} />

          <View style={styles.scanStatusPill}>
            {isScanning ? (
              <View style={styles.scanningRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.scanStatusText}>AI đang phân tích bức ảnh...</Text>
              </View>
            ) : (
              <View style={styles.scanningRow}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.scanStatusText}>Đã nhận diện thành công!</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sampleSwitcherSection}>
          <Text style={[styles.switcherLabel, { color: theme.textSub }]}>
            Thử nghiệm với mẫu ảnh có sẵn:
          </Text>
          <View style={styles.switcherButtonsRow}>
            <TouchableOpacity
              style={[
                styles.sampleBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
                activeImageKey === 'miquang' && {
                  backgroundColor: theme.blueLight,
                  borderColor: theme.primaryLight,
                },
              ]}
              onPress={() => triggerScan('miquang')}
            >
              <Text style={styles.sampleBtnEmoji}>🍜</Text>
              <Text style={[styles.sampleBtnText, { color: theme.text }]}>Mì Quảng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sampleBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
                activeImageKey === 'caurong' && {
                  backgroundColor: theme.blueLight,
                  borderColor: theme.primaryLight,
                },
              ]}
              onPress={() => triggerScan('caurong')}
            >
              <Text style={styles.sampleBtnEmoji}>🐉</Text>
              <Text style={[styles.sampleBtnText, { color: theme.text }]}>Cầu Rồng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sampleBtnCustom,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() =>
                Alert.alert('Camera', 'Tính năng mở expo-image-picker để chọn ảnh từ máy thật.')
              }
            >
              <Ionicons name="camera-outline" size={16} color={theme.text} />
              <Text style={[styles.sampleBtnCustomText, { color: theme.text }]}>Chụp ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
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
                Độ tin cậy {currentSample.confidence}%
              </Text>
            </View>
          </View>

          <Text style={[styles.resultTitle, { color: theme.text }]}>{currentSample.title}</Text>
          <Text style={[styles.resultDesc, { color: theme.textMuted }]}>{currentSample.desc}</Text>

          <View style={[styles.matchedSection, { borderTopColor: theme.border }]}>
            <Text style={[styles.matchedLabel, { color: theme.textSub }]}>
              Địa điểm chuẩn vị trong hệ thống:
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

              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: theme.primary }]}
                onPress={handleAdd}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addBtnText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
