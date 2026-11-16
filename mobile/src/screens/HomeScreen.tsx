import React, { useState } from 'react';
import {
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
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MOCK_PLACES } from '../data/mockPlaces';
import { Area, Category, Place } from '../types';
import { calculateHaversineDistance, formatDistance } from '../utils/distance';
import { formatCurrency } from '../utils/format';

interface HomeScreenProps {
  onNavigateToPlanner: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToPlanner }) => {
  const { theme } = useTheme();
  const { user, openAuthModal } = useAuth();

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

  const filteredPlaces = MOCK_PLACES.filter((place) => {
    const matchArea = selectedArea === 'all' || place.area === selectedArea;
    const matchCategory =
      selectedCategory === 'all' || place.category === selectedCategory;
    const matchSearch =
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchArea && matchCategory && matchSearch;
  });

  const nearbyPlaces = [...MOCK_PLACES]
    .map((place) => ({
      ...place,
      distance: calculateHaversineDistance(userLat, userLng, place.lat, place.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* TOP HEADER */}
        <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingText}>
                {user ? `Xin chào, ${user.name} 👋` : 'Chào bạn đến miền Trung 👋'}
              </Text>
              <Text style={styles.appNameText}>Vivu AI Travel Guide</Text>
            </View>

            {!user && (
              <TouchableOpacity
                style={styles.headerLoginBtn}
                onPress={() => openAuthModal('login')}
              >
                <Ionicons name="log-in-outline" size={14} color="#fff" />
                <Text style={styles.headerLoginText}>Đăng nhập</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Area Switcher */}
          <View style={styles.areaRow}>
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
                  Cả 2 khu vực
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm quán ăn, bãi biển, Chùa Cầu..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FAST AI BANNER */}
        <View
          style={[
            styles.aiBanner,
            { backgroundColor: theme.amberLight, borderColor: 'rgba(245, 158, 11, 0.35)' },
          ]}
        >
          <View style={styles.aiBannerTextWrap}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color={theme.secondary} />
              <Text style={[styles.aiBadgeText, { color: theme.secondary }]}>
                AI LẬP LỊCH TRÌNH
              </Text>
            </View>
            <Text style={[styles.aiBannerTitle, { color: theme.text }]}>
              Bạn chưa biết đi đâu?
            </Text>
            <Text style={[styles.aiBannerSub, { color: theme.textMuted }]}>
              Để Vivu AI sắp xếp trọn vẹn trong 5 giây
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.aiBannerButton, { backgroundColor: theme.secondary }]}
            onPress={onNavigateToPlanner}
            activeOpacity={0.8}
          >
            <Text style={styles.aiBannerButtonText}>Tạo Ngay</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
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
                  style={[
                    styles.chip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    isActive && { backgroundColor: theme.blueLight, borderColor: theme.primaryLight },
                  ]}
                  onPress={() => setSelectedCategory(cat.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.chipText,
                      { color: isActive ? theme.primaryLight : theme.textMuted },
                      isActive && styles.chipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* FEATURED PLACES GRID */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedArea === 'all'
              ? 'Điểm nổi bật nhất'
              : selectedArea === 'danang'
              ? 'Điểm đến Đà Nẵng'
              : 'Điểm đến Hội An'}
          </Text>
          <Text style={[styles.sectionCount, { color: theme.textMuted }]}>
            ({filteredPlaces.length} địa điểm)
          </Text>
        </View>

        <View style={styles.placesGrid}>
          {filteredPlaces.map((place) => (
            <TouchableOpacity
              key={place.id}
              style={[
                styles.placeCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedPlace(place)}
            >
              <View style={styles.imageWrapper}>
                <Image source={{ uri: place.image }} style={styles.placeImage} />
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={10} color="#F59E0B" />
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
                <Text style={[styles.placeName, { color: theme.text }]} numberOfLines={1}>
                  {place.name}
                </Text>
                <Text style={[styles.placeType, { color: theme.textMuted }]} numberOfLines={1}>
                  {place.type}
                </Text>
                <View style={[styles.placeFooter, { borderTopColor: theme.border }]}>
                  <Text style={[styles.placeCost, { color: theme.emerald }]}>
                    {formatCurrency(place.avg_cost)}
                  </Text>
                  <Text style={[styles.placeHours, { color: theme.textSub }]}>
                    {place.open_hours.split(' ')[0]}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* GPS NEARBY SECTION */}
        <View style={styles.sectionHeader}>
          <View style={styles.gpsTitleWrap}>
            <Ionicons name="location" size={16} color={theme.emerald} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Địa điểm quanh bạn (GPS)
            </Text>
          </View>
          <Text style={[styles.gpsSub, { color: theme.emerald }]}>Haversine</Text>
        </View>

        <View style={styles.nearbyList}>
          {nearbyPlaces.map((item) => (
            <TouchableOpacity
              key={'nearby-' + item.id}
              style={[
                styles.nearbyItem,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedPlace(item)}
            >
              <Image source={{ uri: item.image }} style={styles.nearbyImage} />
              <View style={styles.nearbyContent}>
                <View style={styles.nearbyHeaderRow}>
                  <Text style={[styles.nearbyName, { color: theme.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={[styles.distanceBadge, { backgroundColor: theme.emeraldLight }]}>
                    <Text style={[styles.distanceText, { color: theme.emerald }]}>
                      {formatDistance(item.distance)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.nearbyDesc, { color: theme.textMuted }]} numberOfLines={1}>
                  {item.description}
                </Text>
                <View style={styles.nearbyFooter}>
                  <Text style={[styles.nearbyCost, { color: theme.emerald }]}>
                    {formatCurrency(item.avg_cost)}
                  </Text>
                  <Text style={[styles.nearbyRating, { color: theme.amber }]}>
                    ★ {item.rating} ({item.review_count})
                  </Text>
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
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
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
                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                      {selectedPlace.name}
                    </Text>
                    <Text style={[styles.modalType, { color: theme.textMuted }]}>
                      {selectedPlace.type} • {selectedPlace.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}
                    </Text>
                  </View>
                  <View style={styles.modalRatingWrap}>
                    <Text style={[styles.modalRatingVal, { color: theme.amber }]}>
                      ★ {selectedPlace.rating}
                    </Text>
                    <Text style={[styles.modalReviewCount, { color: theme.textSub }]}>
                      {selectedPlace.review_count} đánh giá
                    </Text>
                  </View>
                </View>

                <Text style={[styles.modalDesc, { color: theme.textMuted }]}>
                  {selectedPlace.description}
                </Text>

                <View style={[styles.modalInfoRow, { borderColor: theme.border }]}>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="cash-outline" size={16} color={theme.emerald} />
                    <Text style={[styles.modalInfoText, { color: theme.text }]}>
                      Giá: {formatCurrency(selectedPlace.avg_cost)}
                    </Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Ionicons name="time-outline" size={16} color={theme.primaryLight} />
                    <Text style={[styles.modalInfoText, { color: theme.text }]}>
                      Giờ: {selectedPlace.open_hours}
                    </Text>
                  </View>
                </View>

                <View style={styles.tagWrap}>
                  {selectedPlace.tags.map((tag) => (
                    <View key={tag} style={[styles.tagBadge, { backgroundColor: theme.bg }]}>
                      <Text style={[styles.tagText, { color: theme.textSub }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalPrimaryBtn, { backgroundColor: theme.primary }]}
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
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greetingText: {
    fontSize: 11,
    color: '#DBEAFE',
    fontWeight: '600',
  },
  appNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  headerLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  headerLoginText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  areaRow: {
    marginBottom: 12,
  },
  areaSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 18,
    padding: 3,
    alignSelf: 'flex-start',
  },
  areaButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  areaButtonActive: { backgroundColor: '#fff' },
  areaText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  areaTextActive: { color: '#1D4ED8', fontWeight: '700' },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 12, color: '#0F172A' },
  aiBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiBannerTextWrap: { flex: 1, paddingRight: 10 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  aiBannerTitle: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  aiBannerSub: { fontSize: 10, marginTop: 1 },
  aiBannerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiBannerButtonText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  categoriesSection: { marginTop: 14 },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipIcon: { fontSize: 12 },
  chipText: { fontSize: 11, fontWeight: '500' },
  chipTextActive: { fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCount: { fontSize: 11 },
  placesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  placeCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
  },
  imageWrapper: { height: 105, position: 'relative' },
  placeImage: { width: '100%', height: '100%' },
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
  ratingText: { fontSize: 9, color: '#F59E0B', fontWeight: '700' },
  areaTag: { position: 'absolute', bottom: 6, right: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  areaTagDN: { backgroundColor: '#2563EB' },
  areaTagHA: { backgroundColor: '#EA580C' },
  areaTagText: { fontSize: 8, color: '#fff', fontWeight: '700' },
  placeInfo: { padding: 10 },
  placeName: { fontSize: 12, fontWeight: '700' },
  placeType: { fontSize: 10, marginTop: 2 },
  placeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  placeCost: { fontSize: 10, fontWeight: '700' },
  placeHours: { fontSize: 9 },
  gpsTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gpsSub: { fontSize: 10, fontWeight: '600' },
  nearbyList: { paddingHorizontal: 16, gap: 10 },
  nearbyItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  nearbyImage: { width: 60, height: 60, borderRadius: 12 },
  nearbyContent: { flex: 1, marginLeft: 12 },
  nearbyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nearbyName: { fontSize: 12, fontWeight: '700', flex: 1 },
  distanceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 6 },
  distanceText: { fontSize: 9, fontWeight: '700' },
  nearbyDesc: { fontSize: 10, marginTop: 2 },
  nearbyFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  nearbyCost: { fontSize: 10, fontWeight: '600' },
  nearbyRating: { fontSize: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%', overflow: 'hidden' },
  modalImage: { width: '100%', height: 200 },
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
  modalBody: { padding: 18 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  modalType: { fontSize: 11, marginTop: 2 },
  modalRatingWrap: { alignItems: 'flex-end' },
  modalRatingVal: { fontSize: 13, fontWeight: '700' },
  modalReviewCount: { fontSize: 9 },
  modalDesc: { fontSize: 12, lineHeight: 18, marginTop: 12 },
  modalInfoRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  modalInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalInfoText: { fontSize: 11, fontWeight: '500' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10 },
  modalActions: { marginTop: 18 },
  modalPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  modalPrimaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
