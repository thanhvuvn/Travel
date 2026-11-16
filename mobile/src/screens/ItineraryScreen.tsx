import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MOCK_PLACES } from '../data/mockPlaces';
import { Itinerary, ItineraryDay, ItineraryItem, Place } from '../types';
import { formatCurrency } from '../utils/format';

interface ItineraryScreenProps {
  initialItinerary?: Itinerary | null;
}

export const ItineraryScreen: React.FC<ItineraryScreenProps> = () => {
  const { theme } = useTheme();
  const { user, openAuthModal } = useAuth();

  const defaultPlacesMap: Record<string, Place> = {};
  MOCK_PLACES.forEach((p) => {
    defaultPlacesMap[p.id] = p;
  });

  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [days, setDays] = useState<ItineraryDay[]>([
    {
      day: 1,
      area: 'danang',
      items: [
        {
          id: 'item-1',
          place_id: 'dn01',
          place: defaultPlacesMap['dn01'],
          time: '07:30 - 08:30',
          note: 'Ăn sáng Mì Quảng Bà Mua - nạp năng lượng bắt đầu ngày mới.',
          est_cost: 55000,
        },
        {
          id: 'item-2',
          place_id: 'dn04',
          place: defaultPlacesMap['dn04'],
          time: '09:00 - 11:30',
          note: 'Viếng chùa Linh Ứng Sơn Trà, ngắm tượng Phật Bà 67m hướng biển.',
          est_cost: 0,
        },
        {
          id: 'item-3',
          place_id: 'dn05',
          place: defaultPlacesMap['dn05'],
          time: '12:00 - 13:30',
          note: 'Ăn trưa Bánh tráng cuốn thịt heo hai đầu da Đặc Sản Trần.',
          est_cost: 140000,
        },
        {
          id: 'item-4',
          place_id: 'dn03',
          place: defaultPlacesMap['dn03'],
          time: '15:30 - 17:30',
          note: 'Tắm biển Mỹ Khê và dạo bờ cát trắng lúc hoàng hôn.',
          est_cost: 0,
        },
        {
          id: 'item-5',
          place_id: 'dn02',
          place: defaultPlacesMap['dn02'],
          time: '20:00 - 21:30',
          note: 'Dạo phố đi bộ Bạch Đằng và xem Cầu Rồng phun lửa.',
          est_cost: 30000,
        },
      ],
    },
    {
      day: 2,
      area: 'hoian',
      items: [
        {
          id: 'item-6',
          place_id: 'ha03',
          place: defaultPlacesMap['ha03'],
          time: '08:00 - 08:45',
          note: 'Ăn sáng Bánh Mì Phượng trứ danh phố cổ.',
          est_cost: 35000,
        },
        {
          id: 'item-7',
          place_id: 'ha01',
          place: defaultPlacesMap['ha01'],
          time: '09:00 - 11:00',
          note: 'Tham quan Chùa Cầu, Nhà Cổ Tấn Ký và chụp ảnh góc di sản.',
          est_cost: 120000,
        },
        {
          id: 'item-8',
          place_id: 'ha02',
          place: defaultPlacesMap['ha02'],
          time: '11:30 - 12:45',
          note: 'Thưởng thức Cao Lầu Thanh chính gốc gia truyền.',
          est_cost: 45000,
        },
        {
          id: 'item-9',
          place_id: 'ha05',
          place: defaultPlacesMap['ha05'],
          time: '14:30 - 16:30',
          note: 'Nghỉ chân tại Faifo Coffee, check-in rooftop ngắm toàn cảnh mái ngói rêu phong.',
          est_cost: 65000,
        },
        {
          id: 'item-10',
          place_id: 'ha04',
          place: defaultPlacesMap['ha04'],
          time: '18:00 - 20:30',
          note: 'Đi thuyền gỗ trên sông Hoài và thả đèn hoa đăng lung linh về đêm.',
          est_cost: 150000,
        },
      ],
    },
  ]);

  const currentDay = days[activeDayIndex] || days[0];
  const currentDayCost = currentDay.items.reduce((sum, it) => sum + it.est_cost, 0);

  const handleOpenGoogleMaps = (item?: ItineraryItem) => {
    let url = '';
    if (item && item.place) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${item.place.lat},${item.place.lng}`;
    } else if (currentDay.items.length > 0 && currentDay.items[0].place) {
      const first = currentDay.items[0].place;
      const last = currentDay.items[currentDay.items.length - 1].place || first;
      url = `https://www.google.com/maps/dir/?api=1&origin=${first.lat},${first.lng}&destination=${last.lat},${last.lng}`;
    }
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Thông báo', 'Không thể mở liên kết bản đồ trên thiết bị');
      });
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...currentDay.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const newDays = [...days];
    newDays[activeDayIndex] = { ...currentDay, items: newItems };
    setDays(newDays);
  };

  const removeItem = (index: number) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn bỏ địa điểm này khỏi lịch trình?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const newItems = currentDay.items.filter((_, i) => i !== index);
          const newDays = [...days];
          newDays[activeDayIndex] = { ...currentDay, items: newItems };
          setDays(newDays);
        },
      },
    ]);
  };

  const handleSaveItinerary = () => {
    if (!user) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập tài khoản để lưu và đồng bộ lịch trình.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => openAuthModal('login') },
        ]
      );
      return;
    }
    Alert.alert('Đã lưu!', 'Lịch trình đã được lưu vào tài khoản của bạn.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* SIMULATED MAP VIEW */}
      <View style={[styles.mapContainer, { borderBottomColor: theme.border }]}>
        <View
          style={[
            styles.mapBackground,
            { backgroundColor: theme.isDark ? '#0F1E36' : '#E0F2FE' },
          ]}
        >
          <View style={styles.gridOverlay} />
        </View>

        <View style={styles.mapOverlayTop}>
          <View
            style={[
              styles.mapPill,
              { backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255,255,255,0.9)' },
            ]}
          >
            <Ionicons name="map-outline" size={12} color={theme.accent} />
            <Text style={[styles.mapPillText, { color: theme.text }]}>
              OpenStreetMap / Tọa độ thực
            </Text>
          </View>
          <View style={[styles.areaBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.areaBadgeText}>
              {currentDay.area === 'danang' ? 'Khu vực: Đà Nẵng' : 'Khu vực: Hội An'}
            </Text>
          </View>
        </View>

        <View style={styles.pinsContainer}>
          {currentDay.items.map((it, idx) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.mapPinWrap,
                {
                  left: `${12 + idx * 17}%`,
                  top: `${26 + (idx % 2 === 0 ? 0 : 32)}%`,
                },
              ]}
              onPress={() => handleOpenGoogleMaps(it)}
            >
              <View style={[styles.pinCircle, { backgroundColor: theme.primary }]}>
                <Text style={styles.pinNumber}>{idx + 1}</Text>
              </View>
              <View style={styles.pinCallout}>
                <Text style={styles.pinCalloutText} numberOfLines={1}>
                  {it.place?.name || `Điểm ${idx + 1}`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.directionsBtn, { backgroundColor: theme.primary }]}
          onPress={() => handleOpenGoogleMaps()}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={14} color="#fff" />
          <Text style={styles.directionsBtnText}>Dẫn Đường Google Maps</Text>
        </TouchableOpacity>
      </View>

      {/* DAY SWITCHER TABS */}
      <View
        style={[
          styles.dayTabsBar,
          { backgroundColor: theme.navBg, borderBottomColor: theme.border },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabsScroll}>
          {days.map((d, index) => {
            const isActive = index === activeDayIndex;
            return (
              <TouchableOpacity
                key={d.day}
                style={[
                  styles.dayTabBtn,
                  { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
                  isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => setActiveDayIndex(index)}
              >
                <Text
                  style={[
                    styles.dayTabBtnText,
                    { color: isActive ? '#fff' : theme.textMuted },
                  ]}
                >
                  Ngày {d.day} ({d.area === 'danang' ? 'Đà Nẵng' : 'Hội An'})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.dayCostWrap}>
          <Text style={[styles.dayCostLabel, { color: theme.textSub }]}>Chi phí:</Text>
          <Text style={[styles.dayCostValue, { color: theme.amber }]}>
            {formatCurrency(currentDayCost)}
          </Text>
        </View>
      </View>

      {/* TIMELINE LIST */}
      <ScrollView contentContainerStyle={styles.timelineScroll} showsVerticalScrollIndicator={false}>
        {currentDay.items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === currentDay.items.length - 1;

          return (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.timelineIndicatorCol}>
                <View
                  style={[
                    styles.timelineNumberBadge,
                    { backgroundColor: theme.blueLight, borderColor: theme.primaryLight },
                  ]}
                >
                  <Text style={[styles.timelineNumberText, { color: theme.primaryLight }]}>
                    {index + 1}
                  </Text>
                </View>
                {!isLast && (
                  <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                )}
              </View>

              <View
                style={[
                  styles.timelineCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={styles.timelineCardHeader}>
                  <View style={[styles.timeTag, { backgroundColor: theme.blueLight }]}>
                    <Ionicons name="time-outline" size={11} color={theme.primaryLight} />
                    <Text style={[styles.timeTagText, { color: theme.primaryLight }]}>
                      {item.time}
                    </Text>
                  </View>

                  <View style={styles.reorderControls}>
                    {!isFirst && (
                      <TouchableOpacity
                        style={[styles.reorderBtn, { backgroundColor: theme.bg }]}
                        onPress={() => moveItem(index, 'up')}
                      >
                        <Ionicons name="arrow-up" size={12} color={theme.textMuted} />
                      </TouchableOpacity>
                    )}
                    {!isLast && (
                      <TouchableOpacity
                        style={[styles.reorderBtn, { backgroundColor: theme.bg }]}
                        onPress={() => moveItem(index, 'down')}
                      >
                        <Ionicons name="arrow-down" size={12} color={theme.textMuted} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.reorderBtnDelete, { backgroundColor: theme.roseLight }]}
                      onPress={() => removeItem(index)}
                    >
                      <Ionicons name="trash-outline" size={12} color={theme.rose} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardMain}>
                  {item.place && (
                    <Image source={{ uri: item.place.image }} style={styles.cardThumb} />
                  )}
                  <View style={styles.cardDetails}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {item.place?.name || 'Địa điểm'}
                    </Text>
                    <Text style={[styles.cardNote, { color: theme.textMuted }]}>
                      {item.note}
                    </Text>
                  </View>
                </View>

                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                  <Text style={[styles.cardCost, { color: theme.textSub }]}>
                    Dự trù:{' '}
                    <Text style={[styles.cardCostVal, { color: theme.emerald }]}>
                      {formatCurrency(item.est_cost)}
                    </Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.directNavBtn}
                    onPress={() => handleOpenGoogleMaps(item)}
                  >
                    <Ionicons name="location-outline" size={12} color={theme.accent} />
                    <Text style={[styles.directNavBtnText, { color: theme.accent }]}>
                      Bản đồ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View
        style={[
          styles.footerBar,
          { backgroundColor: theme.navBg, borderTopColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={handleSaveItinerary}
          activeOpacity={0.8}
        >
          <Ionicons name="bookmark" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Lưu Lịch Trình</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.shareBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          onPress={() =>
            Alert.alert('Xuất PDF', 'Tính năng xuất file PDF đẹp mắt bằng expo-print & expo-sharing.')
          }
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={16} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { height: 190, position: 'relative', overflow: 'hidden', borderBottomWidth: 1 },
  mapBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  mapOverlayTop: {
    position: 'absolute',
    top: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  mapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  mapPillText: { fontSize: 9, fontWeight: '600' },
  areaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  areaBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  pinsContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapPinWrap: { position: 'absolute', alignItems: 'center' },
  pinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinNumber: { fontSize: 10, fontWeight: '800', color: '#fff' },
  pinCallout: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    maxWidth: 90,
  },
  pinCalloutText: { fontSize: 8, color: '#fff', fontWeight: '600' },
  directionsBtn: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
    zIndex: 20,
  },
  directionsBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  dayTabsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dayTabsScroll: { gap: 6 },
  dayTabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  dayTabBtnText: { fontSize: 11, fontWeight: '700' },
  dayCostWrap: { alignItems: 'flex-end', marginLeft: 8 },
  dayCostLabel: { fontSize: 8 },
  dayCostValue: { fontSize: 11, fontWeight: '800' },
  timelineScroll: { padding: 14, paddingBottom: 24 },
  timelineRow: { flexDirection: 'row', marginBottom: 8 },
  timelineIndicatorCol: { alignItems: 'center', width: 24, marginRight: 10 },
  timelineNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNumberText: { fontSize: 10, fontWeight: '700' },
  timelineLine: { flex: 1, width: 2, marginVertical: 4 },
  timelineCard: { flex: 1, borderRadius: 14, padding: 10, borderWidth: 1 },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  timeTagText: { fontSize: 9, fontWeight: '700' },
  reorderControls: { flexDirection: 'row', gap: 4 },
  reorderBtn: { padding: 4, borderRadius: 4 },
  reorderBtnDelete: { padding: 4, borderRadius: 4 },
  cardMain: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  cardThumb: { width: 44, height: 44, borderRadius: 8 },
  cardDetails: { flex: 1 },
  cardTitle: { fontSize: 12, fontWeight: '700' },
  cardNote: { fontSize: 10, marginTop: 2, lineHeight: 14 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  cardCost: { fontSize: 9 },
  cardCostVal: { fontWeight: '700' },
  directNavBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  directNavBtnText: { fontSize: 9, fontWeight: '600' },
  footerBar: { flexDirection: 'row', padding: 12, borderTopWidth: 1, gap: 10 },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  shareBtn: {
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
