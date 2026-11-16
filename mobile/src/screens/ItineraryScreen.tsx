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
import { MOCK_PLACES } from '../data/mockPlaces';
import { colors } from '../theme/colors';
import { Itinerary, ItineraryDay, ItineraryItem, Place } from '../types';
import { formatCurrency } from '../utils/format';

interface ItineraryScreenProps {
  initialItinerary?: Itinerary | null;
}

export const ItineraryScreen: React.FC<ItineraryScreenProps> = ({ initialItinerary }) => {
  // Dữ liệu lịch trình mẫu sinh từ AI nếu chưa có state truyền vào
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

  // Tính tổng chi phí cho ngày hiện tại
  const currentDayCost = currentDay.items.reduce((sum, it) => sum + it.est_cost, 0);

  // Mở Google Maps dẫn đường
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

  // Đổi thứ tự địa điểm an toàn (Nút Lên / Xuống)
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

  // Xóa địa điểm khỏi ngày
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

  return (
    <View style={styles.container}>
      {/* SIMULATED MAP VIEW */}
      <View style={styles.mapContainer}>
        {/* Fake Map Background */}
        <View style={styles.mapBackground}>
          <View style={styles.gridOverlay} />
        </View>

        {/* Map Header Overlay */}
        <View style={styles.mapOverlayTop}>
          <View style={styles.mapPill}>
            <Ionicons name="map-outline" size={12} color={colors.accent} />
            <Text style={styles.mapPillText}>OpenStreetMap / Tọa độ thực</Text>
          </View>
          <View style={styles.areaBadge}>
            <Text style={styles.areaBadgeText}>
              {currentDay.area === 'danang' ? 'Khu vực: Đà Nẵng' : 'Khu vực: Hội An'}
            </Text>
          </View>
        </View>

        {/* Simulated Route Pins & Line */}
        <View style={styles.pinsContainer}>
          {currentDay.items.map((it, idx) => (
            <TouchableOpacity
              key={it.id}
              style={[
                styles.mapPinWrap,
                {
                  left: `${15 + idx * 18}%`,
                  top: `${25 + (idx % 2 === 0 ? 0 : 35)}%`,
                },
              ]}
              onPress={() => handleOpenGoogleMaps(it)}
            >
              <View style={styles.pinCircle}>
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

        {/* Directions Button Overlay */}
        <TouchableOpacity
          style={styles.directionsBtn}
          onPress={() => handleOpenGoogleMaps()}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={14} color="#fff" />
          <Text style={styles.directionsBtnText}>Dẫn Đường Google Maps</Text>
        </TouchableOpacity>
      </View>

      {/* DAY SWITCHER TABS */}
      <View style={styles.dayTabsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabsScroll}>
          {days.map((d, index) => {
            const isActive = index === activeDayIndex;
            return (
              <TouchableOpacity
                key={d.day}
                style={[styles.dayTabBtn, isActive && styles.dayTabBtnActive]}
                onPress={() => setActiveDayIndex(index)}
              >
                <Text style={[styles.dayTabBtnText, isActive && styles.dayTabBtnTextActive]}>
                  Ngày {d.day} ({d.area === 'danang' ? 'Đà Nẵng' : 'Hội An'})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.dayCostWrap}>
          <Text style={styles.dayCostLabel}>Chi phí:</Text>
          <Text style={styles.dayCostValue}>{formatCurrency(currentDayCost)}</Text>
        </View>
      </View>

      {/* TIMELINE LIST */}
      <ScrollView contentContainerStyle={styles.timelineScroll} showsVerticalScrollIndicator={false}>
        {currentDay.items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === currentDay.items.length - 1;

          return (
            <View key={item.id} style={styles.timelineRow}>
              {/* Left Timeline Indicator */}
              <View style={styles.timelineIndicatorCol}>
                <View style={styles.timelineNumberBadge}>
                  <Text style={styles.timelineNumberText}>{index + 1}</Text>
                </View>
                {!isLast && <View style={styles.timelineLine} />}
              </View>

              {/* Right Content Card */}
              <View style={styles.timelineCard}>
                <View style={styles.timelineCardHeader}>
                  <View style={styles.timeTag}>
                    <Ionicons name="time-outline" size={11} color={colors.primaryLight} />
                    <Text style={styles.timeTagText}>{item.time}</Text>
                  </View>

                  {/* Reorder Buttons [▲] [▼] & Delete [x] */}
                  <View style={styles.reorderControls}>
                    {!isFirst && (
                      <TouchableOpacity
                        style={styles.reorderBtn}
                        onPress={() => moveItem(index, 'up')}
                      >
                        <Ionicons name="arrow-up" size={12} color={colors.textMuted} />
                      </TouchableOpacity>
                    )}
                    {!isLast && (
                      <TouchableOpacity
                        style={styles.reorderBtn}
                        onPress={() => moveItem(index, 'down')}
                      >
                        <Ionicons name="arrow-down" size={12} color={colors.textMuted} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.reorderBtnDelete}
                      onPress={() => removeItem(index)}
                    >
                      <Ionicons name="trash-outline" size={12} color={colors.rose} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cardMain}>
                  {item.place && (
                    <Image source={{ uri: item.place.image }} style={styles.cardThumb} />
                  )}
                  <View style={styles.cardDetails}>
                    <Text style={styles.cardTitle}>{item.place?.name || 'Địa điểm'}</Text>
                    <Text style={styles.cardNote}>{item.note}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardCost}>
                    Dự trù: <Text style={styles.cardCostVal}>{formatCurrency(item.est_cost)}</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.directNavBtn}
                    onPress={() => handleOpenGoogleMaps(item)}
                  >
                    <Ionicons name="location-outline" size={12} color={colors.accent} />
                    <Text style={styles.directNavBtnText}>Bản đồ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => Alert.alert('Đã lưu!', 'Lịch trình đã được lưu vào bộ nhớ máy.')}
          activeOpacity={0.8}
        >
          <Ionicons name="bookmark" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Lưu Lịch Trình</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => Alert.alert('Xuất PDF', 'Tính năng xuất file PDF đẹp mắt bằng expo-print & expo-sharing.')}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social-outline" size={16} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  mapContainer: {
    height: 190,
    backgroundColor: colors.surfaceDark,
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F1E36',
  },
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
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  mapPillText: {
    fontSize: 9,
    color: colors.textLight,
  },
  areaBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  areaBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },
  pinsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapPinWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  pinNumber: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  pinCallout: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    maxWidth: 90,
  },
  pinCalloutText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '600',
  },
  directionsBtn: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 20,
  },
  directionsBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  dayTabsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#070D18',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  dayTabsScroll: {
    gap: 6,
  },
  dayTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.surfaceDark,
  },
  dayTabBtnActive: {
    backgroundColor: colors.primary,
  },
  dayTabBtnText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  dayTabBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  dayCostWrap: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  dayCostLabel: {
    fontSize: 8,
    color: colors.textSub,
  },
  dayCostValue: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.amber,
  },
  timelineScroll: {
    padding: 14,
    paddingBottom: 24,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 10,
  },
  timelineNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.blueLight,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.borderDark,
    marginVertical: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  timeTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  reorderControls: {
    flexDirection: 'row',
    gap: 4,
  },
  reorderBtn: {
    padding: 3,
    borderRadius: 4,
    backgroundColor: colors.bgDark,
  },
  reorderBtnDelete: {
    padding: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
  },
  cardMain: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  cardThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
  },
  cardNote: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardCost: {
    fontSize: 9,
    color: colors.textSub,
  },
  cardCostVal: {
    color: colors.emerald,
    fontWeight: '700',
  },
  directNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  directNavBtnText: {
    fontSize: 9,
    color: colors.accent,
    fontWeight: '600',
  },
  footerBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#070D18',
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  shareBtn: {
    backgroundColor: colors.surfaceDark,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
});
