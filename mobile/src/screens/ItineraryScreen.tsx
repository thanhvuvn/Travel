import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import { useTheme } from '../context/ThemeContext';
import { ItineraryItem, Place } from '../types';
import { Alert } from '../utils/dialog';
import { formatCurrency, formatShortMoney } from '../utils/format';

interface ItineraryScreenProps {
  onNavigateToPlanner: () => void;
  onOpenPlace: (place: Place) => void;
}

export const ItineraryScreen: React.FC<ItineraryScreenProps> = ({
  onNavigateToPlanner,
  onOpenPlace,
}) => {
  const { theme } = useTheme();
  const { user, openAuthModal } = useAuth();
  const { places } = usePlaces();
  const { plan, clearPlan, moveItem, removeItem, addPlaceToDay, regenerateDay } = useAppData();

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [addOpen, setAddOpen] = useState(false);

  // Giữ tab ngày hợp lệ khi lịch trình thay đổi
  useEffect(() => {
    if (plan && activeDayIndex >= plan.days.length) setActiveDayIndex(0);
  }, [plan, activeDayIndex]);

  // ---------- TRẠNG THÁI RỖNG ----------
  if (!plan) {
    return (
      <View style={[styles.container, styles.emptyWrap, { backgroundColor: theme.bg }]}>
        <View style={[styles.emptyIcon, { backgroundColor: theme.blueLight }]}>
          <Ionicons name="map-outline" size={52} color={theme.primaryLight} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Chưa có lịch trình nào</Text>
        <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
          Hãy để Vivu AI lập lịch trình theo từng ngày, có giờ giấc, ngân sách và bản đồ chỉ trong vài giây.
        </Text>
        <TouchableOpacity
          style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
          onPress={onNavigateToPlanner}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={16} color="#fff" />
          <Text style={styles.emptyBtnText}>Tạo lịch trình bằng AI</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const day = plan.days[Math.min(activeDayIndex, plan.days.length - 1)];
  const dayIndex = plan.days.indexOf(day);
  const dayCost = day.items.reduce((s, it) => s + it.est_cost, 0);
  const totalCost = plan.days.reduce((s, d) => s + d.items.reduce((a, it) => a + it.est_cost, 0), 0);
  const budget = plan.params.budget;
  const ratio = budget > 0 ? totalCost / budget : 0;
  const over = totalCost > budget;
  const barColor = over ? theme.rose : ratio > 0.85 ? theme.amber : theme.emerald;

  const openMaps = (item?: ItineraryItem) => {
    let url = '';
    if (item?.place) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${item.place.lat},${item.place.lng}`;
    } else if (day.items.length > 0 && day.items[0].place) {
      const first = day.items[0].place;
      const last = day.items[day.items.length - 1].place || first;
      url = `https://www.google.com/maps/dir/?api=1&origin=${first.lat},${first.lng}&destination=${last.lat},${last.lng}`;
    }
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert('Thông báo', 'Không thể mở bản đồ trên thiết bị này.'));
    }
  };

  const confirmRemove = (index: number) => {
    Alert.alert('Xóa địa điểm', 'Bỏ địa điểm này khỏi lịch trình?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => removeItem(dayIndex, index) },
    ]);
  };

  const confirmRegenerate = () => {
    Alert.alert('Tạo lại ngày này', `AI sẽ gợi ý lại toàn bộ các điểm của Ngày ${day.day}. Tiếp tục?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Tạo lại', onPress: () => regenerateDay(dayIndex) },
    ]);
  };

  const handleSave = () => {
    if (!user) {
      Alert.alert('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để lưu lịch trình.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập ngay', onPress: () => openAuthModal('login') },
      ]);
      return;
    }
    Alert.alert('Đã lưu!', 'Lịch trình đã được lưu vào tài khoản của bạn.');
  };

  // Địa điểm có thể thêm: active, chưa có trong ngày, ưu tiên cùng khu vực
  const addable = places
    .filter((p) => p.is_active && !day.items.some((it) => it.place_id === p.id))
    .sort((a, b) => Number(b.area === day.area) - Number(a.area === day.area));

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* NGÂN SÁCH */}
      <View style={[styles.budgetBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.budgetTop}>
          <View>
            <Text style={[styles.budgetLabel, { color: theme.textSub }]}>
              Tổng chi phí • {plan.params.days} ngày • {plan.params.people} người
            </Text>
            <Text style={[styles.budgetValue, { color: over ? theme.rose : theme.text }]}>
              {formatShortMoney(totalCost)}{' '}
              <Text style={[styles.budgetOf, { color: theme.textMuted }]}>/ {formatShortMoney(budget)}</Text>
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: over ? theme.roseLight : theme.emeraldLight }]}>
            <Ionicons name={over ? 'warning' : 'checkmark-circle'} size={13} color={over ? theme.rose : theme.emerald} />
            <Text style={[styles.statusPillText, { color: over ? theme.rose : theme.emerald }]}>
              {over ? `Vượt ${formatShortMoney(totalCost - budget)}` : `Còn ${formatShortMoney(budget - totalCost)}`}
            </Text>
          </View>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { width: `${Math.min(ratio, 1) * 100}%`, backgroundColor: barColor }]} />
        </View>
      </View>

      {/* BẢN ĐỒ MÔ PHỎNG */}
      <View style={[styles.mapContainer, { borderBottomColor: theme.border }]}>
        <View style={[styles.mapBg, { backgroundColor: theme.isDark ? '#0F1E36' : '#E0F2FE' }]} />
        <View style={styles.mapTop}>
          <View style={[styles.mapPill, { backgroundColor: theme.isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.92)' }]}>
            <Ionicons name="map-outline" size={12} color={theme.accent} />
            <Text style={[styles.mapPillText, { color: theme.text }]}>OpenStreetMap</Text>
          </View>
          <View style={[styles.areaBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.areaBadgeText}>{day.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}</Text>
          </View>
        </View>
        {day.items.map((it, idx) => (
          <TouchableOpacity
            key={it.id}
            style={[styles.pinWrap, { left: `${10 + idx * 17}%`, top: `${30 + (idx % 2 === 0 ? 0 : 28)}%` }]}
            onPress={() => openMaps(it)}
          >
            <View style={[styles.pin, { backgroundColor: theme.primary }]}>
              <Text style={styles.pinNum}>{idx + 1}</Text>
            </View>
            <View style={styles.pinCallout}>
              <Text style={styles.pinCalloutText} numberOfLines={1}>{it.place?.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.dirBtn, { backgroundColor: theme.primary }]} onPress={() => openMaps()}>
          <Ionicons name="navigate" size={13} color="#fff" />
          <Text style={styles.dirBtnText}>Dẫn đường Google Maps</Text>
        </TouchableOpacity>
      </View>

      {/* TAB NGÀY */}
      <View style={[styles.dayTabsBar, { backgroundColor: theme.navBg, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {plan.days.map((d, i) => {
            const active = i === dayIndex;
            return (
              <TouchableOpacity
                key={d.day}
                style={[
                  styles.dayTab,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  active && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => setActiveDayIndex(i)}
              >
                <Text style={[styles.dayTabText, { color: active ? '#fff' : theme.textMuted }]}>
                  Ngày {d.day} ({d.area === 'danang' ? 'ĐN' : 'HA'})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
          <Text style={{ fontSize: 8, color: theme.textSub }}>Ngày này</Text>
          <Text style={{ fontSize: 11, fontWeight: '800', color: theme.amber }}>{formatShortMoney(dayCost)}</Text>
        </View>
      </View>

      {/* TIMELINE */}
      <ScrollView contentContainerStyle={styles.timelineScroll} showsVerticalScrollIndicator={false}>
        {/* Công cụ chỉnh sửa ngày */}
        <View style={styles.toolRow}>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: theme.blueLight, borderColor: theme.primaryLight }]}
            onPress={() => setAddOpen(true)}
          >
            <Ionicons name="add-circle-outline" size={15} color={theme.primaryLight} />
            <Text style={[styles.toolBtnText, { color: theme.primaryLight }]}>Thêm điểm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: theme.amberLight, borderColor: theme.amber }]}
            onPress={confirmRegenerate}
          >
            <Ionicons name="refresh" size={15} color={theme.amber} />
            <Text style={[styles.toolBtnText, { color: theme.amber }]}>Tạo lại ngày này</Text>
          </TouchableOpacity>
        </View>

        {day.items.length === 0 ? (
          <View style={[styles.dayEmpty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="calendar-outline" size={30} color={theme.textSub} />
            <Text style={[styles.dayEmptyText, { color: theme.textMuted }]}>
              Ngày này chưa có điểm nào. Bấm "Thêm điểm" hoặc "Tạo lại ngày này".
            </Text>
          </View>
        ) : (
          day.items.map((item, index) => {
            const first = index === 0;
            const last = index === day.items.length - 1;
            return (
              <View key={item.id} style={styles.timelineRow}>
                <View style={styles.indicatorCol}>
                  <View style={[styles.numBadge, { backgroundColor: theme.blueLight, borderColor: theme.primaryLight }]}>
                    <Text style={[styles.numText, { color: theme.primaryLight }]}>{index + 1}</Text>
                  </View>
                  {!last && <View style={[styles.line, { backgroundColor: theme.border }]} />}
                </View>

                <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.timeTag, { backgroundColor: theme.blueLight }]}>
                      <Ionicons name="time-outline" size={11} color={theme.primaryLight} />
                      <Text style={[styles.timeTagText, { color: theme.primaryLight }]}>{item.time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {!first && (
                        <TouchableOpacity style={[styles.miniBtn, { backgroundColor: theme.bg }]} onPress={() => moveItem(dayIndex, index, 'up')}>
                          <Ionicons name="arrow-up" size={12} color={theme.textMuted} />
                        </TouchableOpacity>
                      )}
                      {!last && (
                        <TouchableOpacity style={[styles.miniBtn, { backgroundColor: theme.bg }]} onPress={() => moveItem(dayIndex, index, 'down')}>
                          <Ionicons name="arrow-down" size={12} color={theme.textMuted} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={[styles.miniBtn, { backgroundColor: theme.roseLight }]} onPress={() => confirmRemove(index)}>
                        <Ionicons name="trash-outline" size={12} color={theme.rose} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.cardMain}
                    activeOpacity={0.8}
                    onPress={() => item.place && onOpenPlace(item.place)}
                  >
                    {item.place && <Image source={{ uri: item.place.image }} style={styles.thumb} />}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: theme.text }]}>{item.place?.name}</Text>
                      <Text style={[styles.cardNote, { color: theme.textMuted }]} numberOfLines={2}>{item.note}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.textSub} />
                  </TouchableOpacity>

                  <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                    <Text style={{ fontSize: 10, color: theme.textSub }}>
                      Dự trù: <Text style={{ color: theme.emerald, fontWeight: '700' }}>{formatCurrency(item.est_cost)}</Text>
                    </Text>
                    <TouchableOpacity style={styles.navLink} onPress={() => openMaps(item)}>
                      <Ionicons name="location-outline" size={12} color={theme.accent} />
                      <Text style={{ fontSize: 10, color: theme.accent, fontWeight: '600' }}>Dẫn đường</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footerBar, { backgroundColor: theme.navBg, borderTopColor: theme.border }]}>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
          <Ionicons name="bookmark" size={16} color="#fff" />
          <Text style={styles.saveBtnText}>Lưu lịch trình</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => Alert.alert('Xuất PDF', 'Tính năng xuất PDF sẽ dùng expo-print + expo-sharing.')}
        >
          <Ionicons name="share-social-outline" size={18} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: theme.roseLight, borderColor: theme.rose }]}
          onPress={() =>
            Alert.alert('Xóa lịch trình', 'Xóa toàn bộ lịch trình hiện tại?', [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa', style: 'destructive', onPress: clearPlan },
            ])
          }
        >
          <Ionicons name="trash-outline" size={18} color={theme.rose} />
        </TouchableOpacity>
      </View>

      {/* MODAL THÊM ĐIỂM */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Thêm điểm vào Ngày {day.day}</Text>
              <TouchableOpacity onPress={() => setAddOpen(false)}>
                <Ionicons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 14, gap: 8 }}>
              {addable.length === 0 && (
                <Text style={{ color: theme.textMuted, textAlign: 'center', padding: 20 }}>
                  Không còn địa điểm nào để thêm.
                </Text>
              )}
              {addable.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.addRow, { backgroundColor: theme.bg, borderColor: theme.border }]}
                  onPress={() => {
                    addPlaceToDay(dayIndex, p);
                    setAddOpen(false);
                  }}
                >
                  <Image source={{ uri: p.image }} style={styles.addThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addName, { color: theme.text }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={{ fontSize: 10, color: theme.textSub }}>
                      {p.area === 'danang' ? 'Đà Nẵng' : 'Hội An'} • {formatCurrency(p.avg_cost)}
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color={theme.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyDesc: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 14, marginTop: 20 },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  budgetBar: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1 },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budgetLabel: { fontSize: 10 },
  budgetValue: { fontSize: 20, fontWeight: '800', marginTop: 1 },
  budgetOf: { fontSize: 14, fontWeight: '600' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  progressTrack: { height: 6, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  mapContainer: { height: 150, position: 'relative', overflow: 'hidden', borderBottomWidth: 1 },
  mapBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapTop: { position: 'absolute', top: 8, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  mapPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  mapPillText: { fontSize: 9, fontWeight: '600' },
  areaBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  areaBadgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  pinWrap: { position: 'absolute', alignItems: 'center' },
  pin: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  pinNum: { fontSize: 10, fontWeight: '800', color: '#fff' },
  pinCallout: { backgroundColor: 'rgba(15,23,42,0.9)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginTop: 2, maxWidth: 90 },
  pinCalloutText: { fontSize: 8, color: '#fff', fontWeight: '600' },
  dirBtn: { position: 'absolute', bottom: 8, right: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 5, zIndex: 20 },
  dirBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  dayTabsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  dayTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  dayTabText: { fontSize: 11, fontWeight: '700' },
  timelineScroll: { padding: 14, paddingBottom: 24 },
  toolRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toolBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  toolBtnText: { fontSize: 11, fontWeight: '700' },
  dayEmpty: { alignItems: 'center', padding: 24, borderRadius: 16, borderWidth: 1, gap: 8 },
  dayEmptyText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  timelineRow: { flexDirection: 'row', marginBottom: 8 },
  indicatorCol: { alignItems: 'center', width: 24, marginRight: 10 },
  numBadge: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 10, fontWeight: '700' },
  line: { flex: 1, width: 2, marginVertical: 4 },
  card: { flex: 1, borderRadius: 14, padding: 10, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  timeTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
  timeTagText: { fontSize: 9, fontWeight: '700' },
  miniBtn: { padding: 5, borderRadius: 6 },
  cardMain: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  thumb: { width: 44, height: 44, borderRadius: 8 },
  cardTitle: { fontSize: 12, fontWeight: '700' },
  cardNote: { fontSize: 10, marginTop: 2, lineHeight: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 6, borderTopWidth: 1 },
  navLink: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  footerBar: { flexDirection: 'row', padding: 12, borderTopWidth: 1, gap: 8 },
  saveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderRadius: 12, gap: 6 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  iconBtn: { width: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  sheetTitle: { fontSize: 15, fontWeight: '800' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, borderWidth: 1 },
  addThumb: { width: 46, height: 46, borderRadius: 10 },
  addName: { fontSize: 12, fontWeight: '700' },
});
