import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface VisionScreenProps {
  onAddToItinerary?: () => void;
}

export const VisionScreen: React.FC<VisionScreenProps> = ({ onAddToItinerary }) => {
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

  const triggerScan = (key: 'miquang' | 'caurong') => {
    setActiveImageKey(key);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <Ionicons name="sparkles" size={12} color={colors.accent} />
          <Text style={styles.badgeText}>GEMINI VISION AI</Text>
        </View>
        <Text style={styles.headerTitle}>Quét Món Ăn & Danh Thắng</Text>
        <Text style={styles.headerSub}>Chụp ảnh để AI nhận diện và tìm quán ngon chuẩn vị</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* VIEWFINDER CAMERA SIMULATION */}
        <View style={styles.viewfinderContainer}>
          <Image source={{ uri: currentSample.url }} style={styles.previewImage} />

          {/* Scanner laser bar */}
          <View style={styles.scannerLaser} />

          {/* Corner borders */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Status Chip */}
          <View style={styles.scanStatusPill}>
            {isScanning ? (
              <View style={styles.scanningRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.scanStatusText}>AI đang phân tích bức ảnh...</Text>
              </View>
            ) : (
              <View style={styles.scanningRow}>
                <Ionicons name="checkmark-circle" size={14} color={colors.emerald} />
                <Text style={styles.scanStatusText}>Đã nhận diện thành công!</Text>
              </View>
            )}
          </View>
        </View>

        {/* SAMPLE SWITCHER BUTTONS */}
        <View style={styles.sampleSwitcherSection}>
          <Text style={styles.switcherLabel}>Thử nghiệm với mẫu ảnh có sẵn:</Text>
          <View style={styles.switcherButtonsRow}>
            <TouchableOpacity
              style={[
                styles.sampleBtn,
                activeImageKey === 'miquang' && styles.sampleBtnActive,
              ]}
              onPress={() => triggerScan('miquang')}
            >
              <Text style={styles.sampleBtnEmoji}>🍜</Text>
              <Text style={styles.sampleBtnText}>Mì Quảng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sampleBtn,
                activeImageKey === 'caurong' && styles.sampleBtnActive,
              ]}
              onPress={() => triggerScan('caurong')}
            >
              <Text style={styles.sampleBtnEmoji}>🐉</Text>
              <Text style={styles.sampleBtnText}>Cầu Rồng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleBtnCustom}
              onPress={() => Alert.alert('Camera', 'Tính năng mở expo-image-picker để chọn ảnh từ máy thật.')}
            >
              <Ionicons name="camera-outline" size={16} color={colors.textLight} />
              <Text style={styles.sampleBtnCustomText}>Chụp ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI RESULT CARD */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{currentSample.category}</Text>
            </View>
            <View style={styles.confidenceBadge}>
              <Ionicons name="flash" size={12} color={colors.emerald} />
              <Text style={styles.confidenceText}>Độ tin cậy {currentSample.confidence}%</Text>
            </View>
          </View>

          <Text style={styles.resultTitle}>{currentSample.title}</Text>
          <Text style={styles.resultDesc}>{currentSample.desc}</Text>

          {/* MATCHED PLACE IN DATABASE */}
          <View style={styles.matchedSection}>
            <Text style={styles.matchedLabel}>Địa điểm chuẩn vị trong hệ thống:</Text>
            <View style={styles.matchedBox}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.matchedName}>{currentSample.matchedPlace.name}</Text>
                <Text style={styles.matchedAddress}>{currentSample.matchedPlace.address}</Text>
                <View style={styles.matchedMeta}>
                  <Text style={styles.matchedCost}>{currentSample.matchedPlace.cost}</Text>
                  <Text style={styles.matchedDistance}>• Cách bạn {currentSample.matchedPlace.distance}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  Alert.alert('Thành công', 'Đã thêm địa điểm này vào lịch trình hôm nay!');
                  if (onAddToItinerary) onAddToItinerary();
                }}
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
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    alignItems: 'center',
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textLight,
  },
  headerSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
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
  previewImage: {
    width: '100%',
    height: '100%',
  },
  scannerLaser: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '48%',
    height: 2,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.accent,
  },
  cornerTL: {
    top: 8,
    left: 8,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 8,
    right: 8,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 8,
    left: 8,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 8,
    right: 8,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanStatusPill: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scanStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  sampleSwitcherSection: {
    marginTop: 14,
  },
  switcherLabel: {
    fontSize: 10,
    color: colors.textSub,
    marginBottom: 6,
  },
  switcherButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sampleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceDark,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDark,
    gap: 6,
  },
  sampleBtnActive: {
    backgroundColor: colors.blueLight,
    borderColor: colors.primaryLight,
  },
  sampleBtnEmoji: {
    fontSize: 14,
  },
  sampleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
  },
  sampleBtnCustom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceDark,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderDark,
    gap: 6,
  },
  sampleBtnCustomText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textLight,
  },
  resultCard: {
    marginTop: 16,
    backgroundColor: colors.surfaceDark,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: colors.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 9,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  confidenceText: {
    fontSize: 10,
    color: colors.emerald,
    fontWeight: '800',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textLight,
  },
  resultDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 4,
  },
  matchedSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
  },
  matchedLabel: {
    fontSize: 10,
    color: colors.textSub,
    marginBottom: 8,
    fontWeight: '600',
  },
  matchedBox: {
    backgroundColor: colors.bgDark,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  matchedName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
  },
  matchedAddress: {
    fontSize: 9,
    color: colors.textSub,
    marginTop: 2,
  },
  matchedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  matchedCost: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.emerald,
  },
  matchedDistance: {
    fontSize: 9,
    color: colors.textMuted,
    marginLeft: 4,
  },
  addBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
