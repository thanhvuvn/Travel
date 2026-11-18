import React, { useState } from 'react';
import {
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import { useTheme } from '../context/ThemeContext';
import { FadeInView, ScalePress } from '../components/AnimatedUI';
import { Area, Category, Place, WeatherCondition } from '../types';
import { Alert } from '../utils/dialog';
import { calculateHaversineDistance, formatDistance, MOCK_USER_LOCATION } from '../utils/distance';
import { formatCurrency } from '../utils/format';
import { MOCK_TRAVEL_EVENTS } from '../data/mockEvents';
import { MOCK_SPECIALTIES, SpecialtyDish } from '../data/mockSpecialties';
import { MOCK_WEATHER_DATA, LOCAL_TIMING_TIPS } from '../data/mockWeather';
import { SuggestPlaceModal } from './SuggestPlaceModal';

interface HomeScreenProps {
  onNavigateToPlanner: () => void;
  onNavigateToVision?: () => void;
  onOpenPlace: (place: Place) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToPlanner,
  onNavigateToVision,
  onOpenPlace,
}) => {
  const { theme } = useTheme();
  const { user, openAuthModal } = useAuth();
  const { places } = usePlaces();
  const {
    isFavorite,
    toggleFavorite,
    weatherCondition,
    setWeatherCondition,
    setActiveVisionSample,
    plan,
    addPlaceToDay,
    sim,
    setSim,
  } = useAppData();

  const [selectedArea, setSelectedArea] = useState<Area | 'all'>('danang');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<SpecialtyDish | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 650);
  };

  const activeWeatherArea: Area = selectedArea === 'hoian' ? 'hoian' : 'danang';
  const currentWeather = MOCK_WEATHER_DATA[activeWeatherArea][weatherCondition];

  const handleSuggest = () => {
    if (!user) {
      Alert.alert('Cần đăng nhập', 'Đăng nhập để đề xuất địa điểm mới.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => openAuthModal('login') },
      ]);
      return;
    }
    setSuggestOpen(true);
  };

  const categories: { key: Category; label: string; icon: string }[] = [
    { key: 'all', label: 'Tất cả', icon: '🔥' },
    { key: 'food', label: 'Ẩm thực', icon: '🍜' },
    { key: 'beach', label: 'Bãi biển', icon: '🏖️' },
    { key: 'checkin', label: 'Check-in', icon: '📸' },
    { key: 'culture', label: 'Văn hóa', icon: '🏮' },
    { key: 'cafe', label: 'Cà phê', icon: '☕' },
  ];

  const handleHeart = (placeId: string) => {
    if (!user) {
      Alert.alert('Cần đăng nhập', 'Đăng nhập để lưu địa điểm yêu thích của bạn.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => openAuthModal('login') },
      ]);
      return;
    }
    toggleFavorite(placeId);
  };

  const filteredPlaces = places.filter((place) => {
    if (!place.is_active) return false;
    const q = searchQuery.toLowerCase();
    const matchArea = selectedArea === 'all' || place.area === selectedArea;
    const matchCategory = selectedCategory === 'all' || place.category === selectedCategory;
    const matchSearch =
      place.name.toLowerCase().includes(q) || place.tags.some((t) => t.toLowerCase().includes(q));
    return matchArea && matchCategory && matchSearch;
  });

  const nearbyPlaces = places
    .filter((p) => p.is_active)
    .map((p) => ({
      ...p,
      distance: calculateHaversineDistance(MOCK_USER_LOCATION.lat, MOCK_USER_LOCATION.lng, p.lat, p.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: theme.headerBg }]}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingText}>
                {user ? `Xin chào, ${user.name} 👋` : 'Chào bạn đến miền Trung 👋'}
              </Text>
              <Text style={styles.appNameText}>Vivu AI Travel Guide</Text>
            </View>
            {!user && (
              <TouchableOpacity style={styles.headerLoginBtn} onPress={() => openAuthModal('login')}>
                <Ionicons name="log-in-outline" size={14} color="#fff" />
                <Text style={styles.headerLoginText}>Đăng nhập</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.areaSwitcher}>
            {([
              { k: 'danang', l: 'Đà Nẵng' },
              { k: 'hoian', l: 'Hội An' },
              { k: 'all', l: 'Cả 2 khu vực' },
            ] as { k: Area | 'all'; l: string }[]).map((a) => (
              <TouchableOpacity
                key={a.k}
                style={[styles.areaButton, selectedArea === a.k && styles.areaButtonActive]}
                onPress={() => setSelectedArea(a.k)}
              >
                <Text style={[styles.areaText, selectedArea === a.k && styles.areaTextActive]}>{a.l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#64748B" style={{ marginRight: 8 }} />
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

        {/* WIDGET THỜI TIẾT ĐỘNG & GỢI Ý THÔNG MINH */}
        <View
          style={[
            styles.weatherCard,
            {
              backgroundColor: theme.surface,
              borderColor:
                weatherCondition === 'rainy'
                  ? 'rgba(59,130,246,0.3)'
                  : 'rgba(245,158,11,0.3)',
            },
          ]}
        >
          <View style={styles.weatherHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <Text style={{ fontSize: 24 }}>
                {weatherCondition === 'sunny' ? '☀️' : weatherCondition === 'rainy' ? '🌧️' : '⛅'}
              </Text>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.weatherTempText, { color: theme.text }]}>
                    {currentWeather.temp}°C
                  </Text>
                  <Text style={[styles.weatherLabelText, { color: theme.primaryLight }]}>
                    {currentWeather.label}
                  </Text>
                </View>
                <Text style={{ fontSize: 10, color: theme.textSub }}>
                  {activeWeatherArea === 'danang' ? 'Đà Nẵng' : 'Hội An'} • Độ ẩm {currentWeather.humidity}% • Mưa {currentWeather.rain_chance}%
                </Text>
              </View>
            </View>

            {/* Bộ chọn giả lập thời tiết cho Demo */}
            <View style={styles.weatherSwitcher}>
              {(
                [
                  { cond: 'sunny' as const, icon: '☀️' },
                  { cond: 'rainy' as const, icon: '🌧️' },
                  { cond: 'cloudy' as const, icon: '⛅' },
                ] as const
              ).map((w) => {
                const active = weatherCondition === w.cond;
                return (
                  <TouchableOpacity
                    key={w.cond}
                    style={[
                      styles.weatherSwitchBtn,
                      active && { backgroundColor: theme.primary },
                    ]}
                    onPress={() => setWeatherCondition(w.cond)}
                  >
                    <Text style={{ fontSize: 11 }}>{w.icon}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Lời khuyên thích ứng thời tiết */}
          <View
            style={[
              styles.weatherTipBox,
              {
                backgroundColor:
                  weatherCondition === 'rainy' ? theme.blueLight : theme.amberLight,
              },
            ]}
          >
            <Ionicons
              name={weatherCondition === 'rainy' ? 'umbrella-outline' : 'sunny-outline'}
              size={13}
              color={weatherCondition === 'rainy' ? theme.primaryLight : theme.secondary}
              style={{ marginTop: 1 }}
            />
            <Text
              style={[
                styles.weatherTipText,
                {
                  color:
                    weatherCondition === 'rainy' ? theme.primaryLight : theme.secondary,
                },
              ]}
            >
              <Text style={{ fontWeight: '700' }}>Gợi ý thời tiết: </Text>
              {currentWeather.recommendation}
            </Text>
          </View>
        </View>

        {/* SECTION SỰ KIỆN & MÙA LỄ HỘI NỔI BẬT */}
        <View style={{ marginTop: 12 }}>
          <View style={[styles.sectionHeader, { marginTop: 4, marginBottom: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="calendar-outline" size={15} color={theme.accent} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Sự kiện & Mùa lễ hội
              </Text>
            </View>
            <Text style={[styles.sectionCount, { color: theme.accent, fontWeight: '700' }]}>
              Đang diễn ra
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {MOCK_TRAVEL_EVENTS.map((ev) => (
              <TouchableOpacity
                key={ev.id}
                style={[
                  styles.eventCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                activeOpacity={0.85}
                onPress={onNavigateToPlanner}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Text style={{ fontSize: 16 }}>{ev.icon}</Text>
                  <View
                    style={[
                      styles.eventBadge,
                      { backgroundColor: theme.blueLight },
                    ]}
                  >
                    <Text style={[styles.eventBadgeText, { color: theme.primaryLight }]}>
                      {ev.badge}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.eventTitle, { color: theme.text }]} numberOfLines={1}>
                  {ev.title}
                </Text>
                <Text style={[styles.eventPeriod, { color: theme.secondary }]} numberOfLines={1}>
                  📅 {ev.period}
                </Text>
                <Text style={[styles.eventDesc, { color: theme.textMuted }]} numberOfLines={2}>
                  {ev.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AI BANNER */}
        <View style={[styles.aiBanner, { backgroundColor: theme.amberLight, borderColor: 'rgba(245,158,11,0.35)' }]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color={theme.secondary} />
              <Text style={[styles.aiBadgeText, { color: theme.secondary }]}>AI LẬP LỊCH TRÌNH</Text>
            </View>
            <Text style={[styles.aiBannerTitle, { color: theme.text }]}>Bạn chưa biết đi đâu?</Text>
            <Text style={[styles.aiBannerSub, { color: theme.textMuted }]}>
              Để Vivu AI sắp xếp trọn vẹn trong 5 giây
            </Text>
          </View>
          <ScalePress
            style={[styles.aiBannerButton, { backgroundColor: theme.secondary }]}
            onPress={onNavigateToPlanner}
          >
            <Text style={styles.aiBannerButtonText}>Tạo Ngay</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </ScalePress>
        </View>

        {/* BẢN ĐỒ ẨM THỰC XỨ QUẢNG (FOOD TRAIL NỐI VỚI VISION AI) */}
        <View style={{ marginTop: 14 }}>
          <View style={[styles.sectionHeader, { marginTop: 2, marginBottom: 8 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="restaurant-outline" size={15} color={theme.secondary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Bản Đồ Ẩm Thực Xứ Quảng
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigateToVision?.()}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}
            >
              <Ionicons name="camera-outline" size={13} color={theme.primaryLight} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: theme.primaryLight }}>
                Quét món bằng AI
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {MOCK_SPECIALTIES.filter(
              (d) => selectedArea === 'all' || d.area === selectedArea
            ).map((dish) => (
              <ScalePress
                key={dish.id}
                style={[
                  styles.foodTrailCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => setSelectedDish(dish)}
              >
                <View style={styles.foodTrailImgWrap}>
                  <Image source={{ uri: dish.image }} style={styles.foodTrailImg} />
                  <View
                    style={[
                      styles.areaTag,
                      dish.area === 'danang'
                        ? { backgroundColor: '#2563EB' }
                        : { backgroundColor: '#EA580C' },
                    ]}
                  >
                    <Text style={styles.areaTagText}>
                      {dish.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}
                    </Text>
                  </View>
                  <View style={styles.foodVisionBadge}>
                    <Ionicons name="scan-outline" size={10} color="#38BDF8" />
                    <Text style={styles.foodVisionBadgeText}>Vision AI</Text>
                  </View>
                </View>

                <View style={{ padding: 10 }}>
                  <Text style={[styles.foodTrailName, { color: theme.text }]} numberOfLines={1}>
                    {dish.emoji} {dish.name}
                  </Text>
                  <Text
                    style={[styles.foodTrailTagline, { color: theme.textMuted }]}
                    numberOfLines={1}
                  >
                    {dish.tagline}
                  </Text>
                  <View style={styles.foodTrailFooter}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: theme.emerald }}>
                      {dish.priceRange}
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primaryLight }}>
                      Khám phá →
                    </Text>
                  </View>
                </View>
              </ScalePress>
            ))}
          </ScrollView>
        </View>

        {/* CATEGORY CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.chip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  active && { backgroundColor: theme.blueLight, borderColor: theme.primaryLight },
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={{ fontSize: 12 }}>{cat.icon}</Text>
                <Text style={[styles.chipText, { color: active ? theme.primaryLight : theme.textMuted }, active && { fontWeight: '700' }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* PLACES GRID */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedArea === 'all' ? 'Điểm nổi bật nhất' : selectedArea === 'danang' ? 'Điểm đến Đà Nẵng' : 'Điểm đến Hội An'}
          </Text>
          <Text style={[styles.sectionCount, { color: theme.textMuted }]}>({filteredPlaces.length} địa điểm)</Text>
        </View>

        {filteredPlaces.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={36} color={theme.textSub} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Không tìm thấy địa điểm</Text>
            <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
              Thử đổi từ khóa, bộ lọc danh mục hoặc khu vực khác nhé.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.blueLight, borderColor: theme.primaryLight }]}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedArea('all');
              }}
            >
              <Text style={[styles.emptyBtnText, { color: theme.primaryLight }]}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placesGrid}>
            {filteredPlaces.map((place) => {
              const fav = isFavorite(place.id);
              return (
                <ScalePress
                  key={place.id}
                  style={[styles.placeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => onOpenPlace(place)}
                  scaleTo={0.97}
                >
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: place.image }} style={styles.placeImage} />
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={10} color="#F59E0B" />
                      <Text style={styles.ratingText}>{place.rating}</Text>
                    </View>
                    <TouchableOpacity style={styles.heartBtn} onPress={() => handleHeart(place.id)} hitSlop={8}>
                      <Ionicons name={fav ? 'heart' : 'heart-outline'} size={16} color={fav ? '#F43F5E' : '#fff'} />
                    </TouchableOpacity>
                    <View style={[styles.areaTag, place.area === 'danang' ? { backgroundColor: '#2563EB' } : { backgroundColor: '#EA580C' }]}>
                      <Text style={styles.areaTagText}>{place.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}</Text>
                    </View>
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text style={[styles.placeName, { color: theme.text }]} numberOfLines={1}>{place.name}</Text>
                    <Text style={[styles.placeType, { color: theme.textMuted }]} numberOfLines={1}>{place.type}</Text>
                    
                    {place.best_time && (
                      <View style={[styles.bestTimeBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                        <Text style={[styles.bestTimeText, { color: theme.secondary }]} numberOfLines={1}>
                          ⏰ {place.best_time.split('(')[0].trim()}
                        </Text>
                      </View>
                    )}

                    {weatherCondition === 'rainy' && place.weather_suitability === 'indoor' && (
                      <View style={[styles.bestTimeBadge, { backgroundColor: theme.blueLight, borderColor: theme.primaryLight, marginTop: 3 }]}>
                        <Text style={[styles.bestTimeText, { color: theme.primaryLight }]} numberOfLines={1}>
                          ☔ Thích hợp trú mưa
                        </Text>
                      </View>
                    )}

                    <View style={[styles.placeFooter, { borderTopColor: theme.border }]}>
                      <Text style={[styles.placeCost, { color: theme.emerald }]}>{formatCurrency(place.avg_cost)}</Text>
                      <Text style={[styles.placeHours, { color: theme.textSub }]}>{place.open_hours.split(' ')[0]}</Text>
                    </View>
                  </View>
                </ScalePress>
              );
            })}
          </View>
        )}

        {/* GPS NEARBY */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="location" size={16} color={theme.emerald} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quanh bạn (GPS)</Text>
          </View>
        </View>

        {sim.gpsDenied ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border, marginHorizontal: 16 }]}>
            <Ionicons name="location-outline" size={36} color={theme.rose} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Chưa cấp quyền vị trí</Text>
            <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
              Vivu AI cần quyền truy cập GPS để hiển thị địa điểm gần bạn. Bạn vẫn có thể duyệt danh sách ở trên.
            </Text>
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={() => setSim({ gpsDenied: false })}>
              <Text style={[styles.emptyBtnText, { color: '#fff' }]}>Cấp quyền vị trí</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {nearbyPlaces.map((item) => (
              <TouchableOpacity
                key={'nearby-' + item.id}
                style={[styles.nearbyItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                activeOpacity={0.8}
                onPress={() => onOpenPlace(item)}
              >
                <Image source={{ uri: item.image }} style={styles.nearbyImage} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.nearbyHeaderRow}>
                    <Text style={[styles.nearbyName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.distanceBadge, { backgroundColor: theme.emeraldLight }]}>
                      <Text style={[styles.distanceText, { color: theme.emerald }]}>{formatDistance(item.distance)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.nearbyDesc, { color: theme.textMuted }]} numberOfLines={1}>{item.description}</Text>
                  <View style={styles.nearbyFooter}>
                    <Text style={[styles.nearbyCost, { color: theme.emerald }]}>{formatCurrency(item.avg_cost)}</Text>
                    <Text style={{ fontSize: 10, color: theme.amber }}>★ {item.rating} ({item.review_count})</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ĐỀ XUẤT ĐỊA ĐIỂM */}
        <View style={[styles.suggestCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="add-circle" size={30} color={theme.primaryLight} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>Biết một nơi hay chưa có trong app?</Text>
            <Text style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>Đề xuất để Admin thêm vào cho mọi người.</Text>
          </View>
          <TouchableOpacity
            style={[styles.suggestBtn, { backgroundColor: theme.primary }]}
            onPress={handleSuggest}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Đề xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SuggestPlaceModal visible={suggestOpen} onClose={() => setSuggestOpen(false)} />

      {/* MODAL CHI TIẾT MÓN ĐẶC SẢN (BẢN ĐỒ ẨM THỰC XỨ QUẢNG) */}
      <Modal
        visible={!!selectedDish}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDish(null)}
      >
        <View style={styles.dishModalOverlay}>
          {selectedDish && (
            <View style={[styles.dishModalSheet, { backgroundColor: theme.surface }]}>
              <View style={styles.dishHeroWrap}>
                <Image source={{ uri: selectedDish.image }} style={styles.dishHeroImg} />
                <TouchableOpacity
                  style={styles.dishCloseBtn}
                  onPress={() => setSelectedDish(null)}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.dishHeroBadgeRow}>
                  <View
                    style={[
                      styles.dishAreaPill,
                      {
                        backgroundColor:
                          selectedDish.area === 'danang' ? '#2563EB' : '#EA580C',
                      },
                    ]}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
                      Đặc sản {selectedDish.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}
                    </Text>
                  </View>
                  <View style={styles.dishPricePill}>
                    <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>
                      {selectedDish.priceRange}
                    </Text>
                  </View>
                </View>
              </View>

              <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>
                    {selectedDish.emoji} {selectedDish.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.secondary, fontWeight: '600', marginTop: 2 }}>
                    {selectedDish.tagline}
                  </Text>
                </View>

                <View
                  style={[
                    styles.dishStoryBox,
                    { backgroundColor: theme.bg, borderColor: theme.border },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.text, marginBottom: 4 }}>
                    📖 Câu chuyện văn hóa ẩm thực
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.textMuted, lineHeight: 18 }}>
                    {selectedDish.story}
                  </Text>
                </View>

                <View
                  style={[
                    styles.dishStoryBox,
                    { backgroundColor: theme.amberLight, borderColor: theme.amber },
                  ]}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: theme.secondary, marginBottom: 4 }}>
                    🍴 Bí quyết ăn đúng điệu người bản xứ
                  </Text>
                  <Text style={{ fontSize: 12, color: theme.text, lineHeight: 18 }}>
                    {selectedDish.howToEat}
                  </Text>
                </View>

                {/* Danh sách quán chuẩn vị trong hệ thống */}
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: theme.text, marginBottom: 8 }}>
                    📍 Quán chuẩn vị trong hệ thống Vivu AI
                  </Text>
                  {places
                    .filter(
                      (p) =>
                        selectedDish.recommendedPlaceIds.includes(p.id) && p.is_active
                    )
                    .map((p) => (
                      <View
                        key={p.id}
                        style={[
                          styles.dishPlaceRow,
                          { backgroundColor: theme.bg, borderColor: theme.border },
                        ]}
                      >
                        <Image source={{ uri: p.image }} style={styles.dishPlaceThumb} />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{ fontSize: 12, fontWeight: '800', color: theme.text }}
                            numberOfLines={1}
                          >
                            {p.name}
                          </Text>
                          <Text style={{ fontSize: 10, color: theme.textSub, marginTop: 2 }}>
                            ★ {p.rating} ({p.review_count}) • {formatCurrency(p.avg_cost)} • Mở:{' '}
                            {p.open_hours}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <TouchableOpacity
                            style={[
                              styles.dishPlaceBtn,
                              { backgroundColor: theme.blueLight, borderColor: theme.primaryLight },
                            ]}
                            onPress={() => {
                              const target = p;
                              setSelectedDish(null);
                              onOpenPlace(target);
                            }}
                          >
                            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primaryLight }}>
                              Chi tiết
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.dishPlaceBtn,
                              { backgroundColor: theme.primary, borderColor: theme.primary },
                            ]}
                            onPress={() => {
                              if (!plan) {
                                setSelectedDish(null);
                                Alert.alert(
                                  'Chưa có lịch trình',
                                  'Hãy tạo lịch trình bằng AI trước rồi thêm quán này vào.',
                                  [
                                    { text: 'Để sau', style: 'cancel' },
                                    { text: 'Tạo lịch', onPress: onNavigateToPlanner },
                                  ]
                                );
                                return;
                              }
                              if (plan.days[0].items.some((it) => it.place_id === p.id)) {
                                Alert.alert('Đã có trong lịch', `${p.name} đã có trong Ngày 1.`);
                                return;
                              }
                              addPlaceToDay(0, p);
                              Alert.alert('Đã thêm!', `Đã thêm "${p.name}" vào Ngày 1 của lịch trình.`);
                            }}
                          >
                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
                              + Lịch
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                </View>

                {/* Nút kết nối thẳng sang Gemini Vision AI */}
                <TouchableOpacity
                  style={[styles.dishVisionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    const key = selectedDish.id;
                    setSelectedDish(null);
                    setActiveVisionSample(key);
                    onNavigateToVision?.();
                  }}
                >
                  <Ionicons name="scan-circle-outline" size={20} color="#fff" />
                  <Text style={styles.dishVisionBtnText}>
                    Mở Camera Gemini Vision AI quét thử món này
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  greetingText: { fontSize: 11, color: '#DBEAFE', fontWeight: '600' },
  appNameText: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 2 },
  headerLoginBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, gap: 4 },
  headerLoginText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  areaSwitcher: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 18, padding: 3, alignSelf: 'flex-start', marginBottom: 12 },
  areaButton: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  areaButtonActive: { backgroundColor: '#fff' },
  areaText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  areaTextActive: { color: '#1D4ED8', fontWeight: '700' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, fontSize: 12, color: '#0F172A' },
  aiBanner: { marginHorizontal: 16, marginTop: 14, padding: 14, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  aiBannerTitle: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  aiBannerSub: { fontSize: 10, marginTop: 1 },
  aiBannerButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiBannerButtonText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  categoryScroll: { paddingHorizontal: 16, gap: 8, marginTop: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, gap: 6 },
  chipText: { fontSize: 11, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCount: { fontSize: 11 },
  placesGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, justifyContent: 'space-between' },
  placeCard: { width: '48%', borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1 },
  imageWrapper: { height: 105, position: 'relative' },
  placeImage: { width: '100%', height: '100%' },
  ratingBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(15,23,42,0.85)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, gap: 3 },
  ratingText: { fontSize: 9, color: '#F59E0B', fontWeight: '700' },
  heartBtn: { position: 'absolute', top: 5, right: 5, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  areaTag: { position: 'absolute', bottom: 6, right: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  areaTagText: { fontSize: 8, color: '#fff', fontWeight: '700' },
  placeName: { fontSize: 12, fontWeight: '700' },
  placeType: { fontSize: 10, marginTop: 2 },
  placeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTopWidth: 1 },
  placeCost: { fontSize: 10, fontWeight: '700' },
  placeHours: { fontSize: 9 },
  emptyCard: { marginHorizontal: 16, padding: 24, borderRadius: 18, borderWidth: 1, alignItems: 'center', gap: 6 },
  emptyTitle: { fontSize: 14, fontWeight: '800', marginTop: 4 },
  emptyDesc: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  emptyBtn: { marginTop: 10, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  emptyBtnText: { fontSize: 12, fontWeight: '700' },
  nearbyItem: { flexDirection: 'row', borderRadius: 16, padding: 10, borderWidth: 1, alignItems: 'center' },
  nearbyImage: { width: 60, height: 60, borderRadius: 12 },
  nearbyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nearbyName: { fontSize: 12, fontWeight: '700', flex: 1 },
  distanceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 6 },
  distanceText: { fontSize: 9, fontWeight: '700' },
  nearbyDesc: { fontSize: 10, marginTop: 2 },
  nearbyFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  nearbyCost: { fontSize: 10, fontWeight: '600' },
  suggestCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 20, padding: 14, borderRadius: 16, borderWidth: 1 },
  suggestBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  weatherCard: { marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 16, borderWidth: 1 },
  weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weatherTempText: { fontSize: 16, fontWeight: '800' },
  weatherLabelText: { fontSize: 11, fontWeight: '700' },
  weatherSwitcher: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 12, padding: 2, gap: 2 },
  weatherSwitchBtn: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 10 },
  weatherTipBox: { flexDirection: 'row', alignItems: 'flex-start', padding: 8, borderRadius: 10, marginTop: 8, gap: 6 },
  weatherTipText: { fontSize: 11, lineHeight: 16, flex: 1 },
  eventCard: { width: 220, padding: 12, borderRadius: 16, borderWidth: 1 },
  eventBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  eventBadgeText: { fontSize: 9, fontWeight: '700' },
  eventTitle: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  eventPeriod: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  eventDesc: { fontSize: 10, lineHeight: 14, marginTop: 4 },
  bestTimeBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, marginTop: 4 },
  bestTimeText: { fontSize: 9, fontWeight: '600' },
  foodTrailCard: {
    width: 215,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  foodTrailImgWrap: {
    height: 100,
    position: 'relative',
  },
  foodTrailImg: {
    width: '100%',
    height: '100%',
  },
  foodVisionBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  foodVisionBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#38BDF8',
  },
  foodTrailName: {
    fontSize: 12,
    fontWeight: '800',
  },
  foodTrailTagline: {
    fontSize: 10,
    marginTop: 2,
  },
  foodTrailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  dishModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  dishModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  dishHeroWrap: {
    height: 185,
    position: 'relative',
  },
  dishHeroImg: {
    width: '100%',
    height: '100%',
  },
  dishCloseBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dishHeroBadgeRow: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishAreaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dishPricePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dishStoryBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  dishPlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  dishPlaceThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  dishPlaceBtn: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  dishVisionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 2,
  },
  dishVisionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
