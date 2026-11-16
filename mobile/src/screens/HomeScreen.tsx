import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_PLACES } from '../data/mockPlaces';
import { colors } from '../theme/colors';
import { Area, Category, Place } from '../types';
import { calculateHaversineDistance, formatDistance } from '../utils/distance';
import { formatCurrency } from '../utils/format';

interface HomeScreenProps {
  onNavigateToPlanner: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToPlanner }) => {
  const [selectedArea, setSelectedArea] = useState<Area | 'all'>('danang');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Giả lập toạ độ GPS hiện tại của người dùng (gần Cầu Sông Hàn, Đà Nẵng)
  const userLat = 16.0680;
  const userLng = 108.2215;

  const categories: { key: Category; label: string; icon: string }[] = [
    { key: 'all', label: 'Tất cả', icon: '🔥' },
    { key: 'food', label: 'Ẩm thực', icon: '🍜' },
    { key: 'beach', label: 'Bãi biển', icon: '🏖️' },
    { key: 'checkin', label: 'Check-in', icon: '📸' },
    { key: 'culture', label: 'Văn hóa', icon: '🏮' },
    { key: 'cafe', label: 'Cà phê', icon: '☕' },
  ];

  // Lọc địa điểm theo khu vực, danh mục và từ khóa tìm kiếm
  const filteredPlaces = MOCK_PLACES.filter((place) => {
    const matchArea = selectedArea === 'all' || place.area === selectedArea;
    const matchCategory =
      selectedCategory === 'all' || place.category === selectedCategory;
    const matchSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchArea && matchCategory && matchSearch;
  });

  // Tính khoảng cách GPS cho toàn bộ địa điểm và sắp xếp theo gần nhất
  const nearbyPlaces = [...MOCK_PLACES]
    .map((place) => ({
      ...place,
      distance: calculateHaversineDistance(userLat, userLng, place.lat, place.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* TOP HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>Chào bạn đến miền Trung 👋</Text>
              <Text style={styles.appNameText}>Vivu AI Travel Guide</Text>
            </View>

            {/* Area Pill Switcher */}
            <View style={styles.areaSwitcher}>
              <TouchableOpacity
                style={[styles.areaButton, selectedArea === 'danang' && styles.areaButtonActive]}
                onPress={() => setSelectedArea('danang')}
              >
                <Text style={[styles.areaText, selectedArea === 'danang' && styles.areaTextActive]}>
                  Đà Nẵng
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.areaButton, selectedArea === 'hoian' && styles.areaButtonActive]}
                onPress={() => setSelectedArea('hoian')}
              >
                <Text style={[styles.areaText, selectedArea === 'hoian' && styles.areaTextActive]}>
                  Hội An
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.areaButton, selectedArea === 'all' && styles.areaButtonActive]}
                onPress={() => setSelectedArea('all')}
              >
                <Text style={[styles.areaText, selectedArea === 'all' && styles.areaTextActive]}>
                  Cả 2
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm quán ăn, bãi biển, Chùa Cầu..."
              placeholderTextColor={colors.textSub}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FAST AI BANNER */}
        <View style={styles.aiBanner}>
          <View style={styles.aiBannerTextWrap}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color={colors.secondary} />
              <Text style={styles.aiBadgeText}>AI LẬP LỊCH TRÌNH</Text>
            </View>
            <Text style={styles.aiBannerTitle}>Bạn chưa biết đi đâu?</Text>
            <Text style={styles.aiBannerSub}>Để Vivu AI sắp xếp trọn vẹn trong 5 giây</Text>
          </View>
          <TouchableOpacity
            style={styles.aiBannerButton}
            onPress={onNavigateToPlanner}
            activeOpacity={0.8}
          >
            <Text style={styles.aiBannerButtonText}>Tạo Ngay</Text>
            <Ionicons name="arrow-forward" size={14} color="#000" />
          </TouchableOpacity>
        </View>

        {/* CATEGORY CHIPS */}
        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setSelectedCategory(cat.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipIcon}>{cat.icon}</Text>
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* FEATURED PLACES GRID */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedArea === 'all'
              ? 'Điểm nổi bật nhất'
              : selectedArea === 'danang'
              ? 'Điểm đến Đà Nẵng'
              : 'Điểm đến Hội An'}
          </Text>
          <Text style={styles.sectionCount}>({filteredPlaces.length} địa điểm)</Text>
        </View>

        <View style={styles.placesGrid}>
          {filteredPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={styles.placeCard}
              activeOpacity={0.8}
              onPress={() => setSelectedPlace(place)}
            >
              <View style={styles.imageWrapper}>
                <Image source={{ uri: place.image }} style={styles.placeImage} />
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={10} color={colors.amber} />
                  <Text style={styles.ratingText}>{place.rating}</Text>
                </View>
                <View
                  style={[
                    styles.areaTag,
                    place.area === 'danang' ? styles.areaTagDN : styles.areaTagHA,
                  ]}
                >
                  <Text style={styles.areaTagText}>
                    {place.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}
                  </Text>
                </View>
              </View>

              <View style={styles.placeInfo}>
                <Text style={styles.placeName} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={styles.placeType} numberOfLines={1}>
                  {place.type}
                </Text>
                <View style={styles.placeFooter}>
                  <Text style={styles.placeCost}>{formatCurrency(place.avg_cost)}</Text>
                  <Text style={styles.placeHours}>{place.open_hours.split(' ')[0]}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* GPS NEARBY SECTION */}
        <View style={styles.sectionHeader}>
          <View style={styles.gpsTitleWrap}>
            <Ionicons name="location" size={16} color={colors.emerald} />
            <Text style={styles.sectionTitle}>Địa điểm quanh bạn (GPS)</Text>
          </View>
          <Text style={styles.gpsSub}>Tự động tính theo Haversine</Text>
        </View>

        <View style={styles.nearbyList}>
          {nearbyPlaces.map((item) => (
            <TouchableOpacity
              key={'nearby-' + item.id}
              style={styles.nearbyItem}
              activeOpacity={0.7}
              onPress={() => setSelectedPlace(item)}
            >
              <Image source={{ uri: item.image }} style={styles.nearbyImage} />
              <View style={styles.nearbyContent}>
                <View style={styles.nearbyHeaderRow}>
                  <Text style={styles.nearbyName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>{formatDistance(item.distance)}</Text>
                  </View>
                </View>
                <Text style={styles.nearbyDesc} numberOfLines={1}>
                  {item.description}
                </Text>
                <View style={styles.nearbyFooter}>
                  <Text style={styles.nearbyCost}>{formatCurrency(item.avg_cost)}</Text>
                  <Text style={styles.nearbyRating}>★ {item.rating} ({item.review_count})</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* DETAIL MODAL */}
      {selectedPlace && (
        <Modal visible={!!selectedPlace} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Image source={{ uri: selectedPlace.image }} style={styles.modalImage} />
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setSelectedPlace(null)}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>

              <View style={styles.modalBody}>
                <View style={styles.modalHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selectedPlace.name}</Text>
                    <Text style={styles.modalType}>
                      {selectedPlace.type} • {selectedPlace.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}
                    </Text>
                  </View>
                  <View style={styles.modalRatingWrap}>
                    <Text style={styles.modalRatingVal}>★ {selectedPlace.rating}</Text>
                    <Text style={styles.modalReviewCount}>{selectedPlace.review_count} đánh giá</Text>
                  </View>
                </View>

                <Text style={styles.modalDesc}>{selectedPlace.description}</Text>

                <View style={styles.modalInfoRow}>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="cash-outline" size={16} color={colors.emerald} />
                    <Text style={styles.modalInfoText}>
                      Giá: {formatCurrency(selectedPlace.avg_cost)}
                    </Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="time-outline" size={16} color={colors.primaryLight} />
                    <Text style={styles.modalInfoText}>Giờ: {selectedPlace.open_hours}</Text>
                  </View>
                </View>

                <View style={styles.tagWrap}>
                  {selectedPlace.tags.map((tag) => (
                    <View key={tag} style={styles.tagBadge}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => {
                      setSelectedPlace(null);
                      onNavigateToPlanner();
                    }}
                  >
                    <Ionicons name="sparkles" size={16} color="#fff" />
                    <Text style={styles.modalPrimaryBtnText}>Thêm vào Lịch Trình AI</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 11,
    color: '#93C5FD',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  appNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  areaSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 2,
  },
  areaButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
  },
  areaButtonActive: {
    backgroundColor: '#fff',
  },
  areaText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  areaTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 40,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
  },
  aiBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiBannerTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  aiBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  aiBannerSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  aiBannerButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiBannerButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  categoriesSection: {
    marginTop: 14,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    gap: 6,
  },
  chipActive: {
    backgroundColor: colors.blueLight,
    borderColor: colors.primaryLight,
  },
  chipIcon: {
    fontSize: 12,
  },
  chipText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 11,
    color: colors.textMuted,
  },
  placesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  placeCard: {
    width: '48%',
    backgroundColor: colors.surfaceDark,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  imageWrapper: {
    height: 105,
    position: 'relative',
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 9,
    color: colors.amber,
    fontWeight: '700',
  },
  areaTag: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  areaTagDN: {
    backgroundColor: '#2563EB',
  },
  areaTagHA: {
    backgroundColor: '#EA580C',
  },
  areaTagText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '700',
  },
  placeInfo: {
    padding: 10,
  },
  placeName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
  },
  placeType: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  placeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  placeCost: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.emerald,
  },
  placeHours: {
    fontSize: 9,
    color: colors.textSub,
  },
  gpsTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsSub: {
    fontSize: 10,
    color: colors.emerald,
  },
  nearbyList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  nearbyItem: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDark,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignItems: 'center',
  },
  nearbyImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  nearbyContent: {
    flex: 1,
    marginLeft: 12,
  },
  nearbyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nearbyName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  distanceText: {
    fontSize: 9,
    color: colors.emerald,
    fontWeight: '700',
  },
  nearbyDesc: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  nearbyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  nearbyCost: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.emerald,
  },
  nearbyRating: {
    fontSize: 10,
    color: colors.amber,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surfaceDark,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 18,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textLight,
  },
  modalType: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalRatingWrap: {
    alignItems: 'flex-end',
  },
  modalRatingVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.amber,
  },
  modalReviewCount: {
    fontSize: 9,
    color: colors.textSub,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderDark,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalInfoText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tagBadge: {
    backgroundColor: colors.bgDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: colors.textSub,
  },
  modalActions: {
    marginTop: 18,
  },
  modalPrimaryBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  modalPrimaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
