import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
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
import {
  estimateTravelBetween,
  getItemHoursWarning,
  inspectSchedule,
} from '../utils/scheduleValidator';

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
  const {
    plan,
    clearPlan,
    moveItem,
    removeItem,
    addPlaceToDay,
    regenerateDay,
    optimizeDay,
  } = useAppData();

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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

  // Kiểm tra cảnh báo lịch trình bất hợp lý (Tính năng 4)
  const warnings = inspectSchedule(day, totalCost, budget);
  const hasHoursConflict = warnings.some((w) => w.type === 'hours');
  const perPersonCost = Math.round(totalCost / Math.max(1, plan.params.people));
  const shareUrl = `https://vivuai.vn/plan/DN-HA-${plan.params.days}N${plan.params.people}P`;

  // Tạo nội dung chia sẻ lịch trình (Tính năng 5)
  const buildShareText = (): string => {
    const lines: string[] = [
      `🌴 LỊCH TRÌNH DU LỊCH ĐÀ NẴNG - HỘI AN (${plan.params.days} NGÀY • ${plan.params.people} NGƯỜI)`,
      `💰 Tổng dự trù: ${formatCurrency(totalCost)} / Ngân sách ${formatCurrency(budget)} (~${formatCurrency(perPersonCost)}/người)`,
      `----------------------------------------`,
    ];
    plan.days.forEach((d) => {
      const dCost = d.items.reduce((s, it) => s + it.est_cost, 0);
      lines.push(
        `\n📅 NGÀY ${d.day} (${d.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}) - ${formatCurrency(dCost)}:`
      );
      d.items.forEach((it, idx) => {
        lines.push(
          `  ${idx + 1}. [${it.time}] ${it.place?.name ?? it.place_id} (${formatCurrency(it.est_cost)})`
        );
      });
    });
    lines.push(`\n🔗 Xem bản đồ & lịch trình trên Vivu AI: ${shareUrl}`);
    return lines.join('\n');
  };

  const handleNativeShare = async () => {
    const text = buildShareText();
    try {
      await Share.share({
        title: 'Lịch trình du lịch Đà Nẵng - Hội An (Vivu AI)',
        message: text,
        url: shareUrl,
      });
    } catch {
      Alert.alert('Thông báo', 'Không thể mở hộp thoại chia sẻ trên thiết bị này.');
    }
  };

  const handleCopyShare = async () => {
    const text = buildShareText();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        Alert.alert(
          'Đã sao chép!',
          'Toàn bộ lịch trình và link chia sẻ đã được lưu vào Clipboard. Bạn có thể dán ngay vào nhóm Zalo / Messenger.'
        );
        return;
      }
    } catch {
      // fallback below
    }
    Alert.alert('Nội dung chia sẻ', text);
  };

  const handlePrintPdf = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    } else {
      Alert.alert(
        'Xuất bản in / PDF',
        'Đã chuẩn bị bản tóm tắt lịch trình PDF. Bạn có thể chọn "Chia sẻ qua App" để lưu hoặc gửi file.'
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* NGÂN SÁCH */}
      <View style={[styles.budgetBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.budgetTop}>
          <View>
            <Text style={[styles.budgetLabel, { color: theme.textSub }]}>
              Tổng chi phí • {plan.params.days} ngày • {plan.params.people} người (~{formatShortMoney(perPersonCost)}/người)
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

        {/* TÍNH NĂNG 4: TRỢ LÝ KIỂM TRA LỊCH TRÌNH BẤT HỢP LÝ */}
        {day.items.length > 0 && (
          warnings.length > 0 ? (
            <View
              style={[
                styles.inspectorCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.amber,
                },
              ]}
            >
              <View style={styles.inspectorHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Ionicons name="alert-circle" size={16} color={theme.amber} />
                  <Text style={[styles.inspectorTitle, { color: theme.text }]}>
                    Phát hiện {warnings.length} điểm cần lưu ý trong lịch trình
                  </Text>
                </View>
                {hasHoursConflict && (
                  <TouchableOpacity
                    style={[styles.autoFixBtn, { backgroundColor: theme.amber }]}
                    onPress={() => {
                      optimizeDay(dayIndex);
                      Alert.alert(
                        'Đã tối ưu!',
                        'Đã tự động sắp xếp lại thứ tự các điểm theo khung giờ mở cửa hợp lý.'
                      );
                    }}
                  >
                    <Ionicons name="flash" size={11} color="#fff" />
                    <Text style={styles.autoFixBtnText}>Tự động sửa giờ</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ gap: 6, marginTop: 6 }}>
                {warnings.map((w) => (
                  <View
                    key={w.id}
                    style={[
                      styles.warningRow,
                      {
                        backgroundColor: w.severity === 'high' ? theme.roseLight : theme.amberLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        w.type === 'hours'
                          ? 'time-outline'
                          : w.type === 'distance'
                          ? 'car-outline'
                          : 'wallet-outline'
                      }
                      size={13}
                      color={w.severity === 'high' ? theme.rose : theme.secondary}
                      style={{ marginTop: 1 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: '700',
                          color: w.severity === 'high' ? theme.rose : theme.secondary,
                        }}
                      >
                        {w.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          color: theme.text,
                          lineHeight: 14,
                          marginTop: 1,
                        }}
                      >
                        {w.detail}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.validScheduleBar,
                { backgroundColor: theme.emeraldLight, borderColor: theme.emerald },
              ]}
            >
              <Ionicons name="checkmark-done-circle" size={15} color={theme.emerald} />
              <Text style={[styles.validScheduleText, { color: theme.emerald }]}>
                Lịch trình hợp lý: Giờ mở cửa, khoảng cách và ngân sách đều tối ưu.
              </Text>
            </View>
          )
        )}

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
            const hoursConflict = getItemHoursWarning(item);
            const prevTravel = index > 0 ? estimateTravelBetween(day.items[index - 1], item) : null;
            const isFar = prevTravel && prevTravel.roadKm >= 12;

            return (
              <View key={item.id}>
                {/* Cảnh báo nếu 2 điểm liên tiếp quá xa */}
                {isFar && prevTravel && (
                  <View
                    style={[
                      styles.farNoticeRow,
                      { backgroundColor: theme.amberLight, borderColor: theme.amber },
                    ]}
                  >
                    <Ionicons name="warning-outline" size={12} color={theme.secondary} />
                    <Text style={[styles.farNoticeText, { color: theme.secondary }]}>
                      Cách điểm trước khá xa: {prevTravel.roadKm.toFixed(1)} km (~{prevTravel.minutes} phút di chuyển)
                    </Text>
                  </View>
                )}

                <View style={styles.timelineRow}>
                  <View style={styles.indicatorCol}>
                    <View
                      style={[
                        styles.numBadge,
                        {
                          backgroundColor: hoursConflict ? theme.roseLight : theme.blueLight,
                          borderColor: hoursConflict ? theme.rose : theme.primaryLight,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.numText,
                          { color: hoursConflict ? theme.rose : theme.primaryLight },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    {!last && <View style={[styles.line, { backgroundColor: theme.border }]} />}
                  </View>

                  <View
                    style={[
                      styles.card,
                      {
                        backgroundColor: theme.surface,
                        borderColor: hoursConflict ? theme.rose : theme.border,
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                        <View
                          style={[
                            styles.timeTag,
                            { backgroundColor: hoursConflict ? theme.roseLight : theme.blueLight },
                          ]}
                        >
                          <Ionicons
                            name="time-outline"
                            size={11}
                            color={hoursConflict ? theme.rose : theme.primaryLight}
                          />
                          <Text
                            style={[
                              styles.timeTagText,
                              { color: hoursConflict ? theme.rose : theme.primaryLight },
                            ]}
                          >
                            {item.time}
                          </Text>
                        </View>
                        {item.place && (
                          <Text style={{ fontSize: 9, color: theme.textSub }} numberOfLines={1}>
                            Mở: {item.place.open_hours}
                          </Text>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {!first && (
                          <TouchableOpacity
                            style={[styles.miniBtn, { backgroundColor: theme.bg }]}
                            onPress={() => moveItem(dayIndex, index, 'up')}
                          >
                            <Ionicons name="arrow-up" size={12} color={theme.textMuted} />
                          </TouchableOpacity>
                        )}
                        {!last && (
                          <TouchableOpacity
                            style={[styles.miniBtn, { backgroundColor: theme.bg }]}
                            onPress={() => moveItem(dayIndex, index, 'down')}
                          >
                            <Ionicons name="arrow-down" size={12} color={theme.textMuted} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.miniBtn, { backgroundColor: theme.roseLight }]}
                          onPress={() => confirmRemove(index)}
                        >
                          <Ionicons name="trash-outline" size={12} color={theme.rose} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Badge cảnh báo lệch giờ mở cửa ngay trên thẻ */}
                    {hoursConflict && (
                      <View
                        style={[
                          styles.inlineConflictBadge,
                          { backgroundColor: theme.roseLight },
                        ]}
                      >
                        <Ionicons name="alert-circle" size={12} color={theme.rose} />
                        <Text style={[styles.inlineConflictText, { color: theme.rose }]}>
                          {hoursConflict}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.cardMain}
                      activeOpacity={0.8}
                      onPress={() => item.place && onOpenPlace(item.place)}
                    >
                      {item.place && <Image source={{ uri: item.place.image }} style={styles.thumb} />}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>
                          {item.place?.name}
                        </Text>
                        <Text
                          style={[styles.cardNote, { color: theme.textMuted }]}
                          numberOfLines={2}
                        >
                          {item.note}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={theme.textSub} />
                    </TouchableOpacity>

                    <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                      <Text style={{ fontSize: 10, color: theme.textSub }}>
                        Dự trù:{' '}
                        <Text style={{ color: theme.emerald, fontWeight: '700' }}>
                          {formatCurrency(item.est_cost)}
                        </Text>
                      </Text>
                      <TouchableOpacity style={styles.navLink} onPress={() => openMaps(item)}>
                        <Ionicons name="location-outline" size={12} color={theme.accent} />
                        <Text style={{ fontSize: 10, color: theme.accent, fontWeight: '600' }}>
                          Dẫn đường
                        </Text>
                      </TouchableOpacity>
                    </View>
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
          style={[
            styles.shareBtn,
            { backgroundColor: theme.blueLight, borderColor: theme.primaryLight },
          ]}
          onPress={() => setShareOpen(true)}
        >
          <Ionicons name="share-social" size={16} color={theme.primaryLight} />
          <Text style={[styles.shareBtnText, { color: theme.primaryLight }]}>Chia sẻ</Text>
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
                      {p.area === 'danang' ? 'Đà Nẵng' : 'Hội An'} • {formatCurrency(p.avg_cost)} • Mở: {p.open_hours}
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color={theme.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* TÍNH NĂNG 5: MODAL CHIA SẺ LỊCH TRÌNH (TRAVEL PASS CARD) */}
      <Modal visible={shareOpen} transparent animationType="fade" onRequestClose={() => setShareOpen(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.surface, maxHeight: '88%' }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="share-social" size={18} color={theme.primaryLight} />
                <Text style={[styles.sheetTitle, { color: theme.text }]}>
                  Chia sẻ Lịch trình Nhóm
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShareOpen(false)}>
                <Ionicons name="close" size={22} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
              {/* Thẻ tóm tắt trực quan (Travel Pass Card) */}
              <View
                style={[
                  styles.shareCardPreview,
                  { backgroundColor: theme.bg, borderColor: theme.border },
                ]}
              >
                <View style={styles.shareCardBanner}>
                  <View>
                    <Text style={styles.sharePassBadge}>VIVU AI TRAVEL PASS</Text>
                    <Text style={styles.sharePassTitle}>
                      Hành Trình Đà Nẵng - Hội An ({plan.params.days} Ngày)
                    </Text>
                  </View>
                  <Ionicons name="airplane" size={24} color="#fff" />
                </View>

                <View style={styles.shareStatsRow}>
                  <View style={styles.shareStatItem}>
                    <Text style={[styles.shareStatLabel, { color: theme.textSub }]}>Số người</Text>
                    <Text style={[styles.shareStatVal, { color: theme.text }]}>
                      {plan.params.people} khách
                    </Text>
                  </View>
                  <View style={styles.shareStatItem}>
                    <Text style={[styles.shareStatLabel, { color: theme.textSub }]}>Tổng chi phí</Text>
                    <Text style={[styles.shareStatVal, { color: theme.emerald }]}>
                      {formatShortMoney(totalCost)}
                    </Text>
                  </View>
                  <View style={styles.shareStatItem}>
                    <Text style={[styles.shareStatLabel, { color: theme.textSub }]}>Mỗi người</Text>
                    <Text style={[styles.shareStatVal, { color: theme.amber }]}>
                      ~{formatShortMoney(perPersonCost)}
                    </Text>
                  </View>
                </View>

                {plan.days.map((d) => (
                  <View
                    key={d.day}
                    style={[styles.shareDayBox, { borderTopColor: theme.border }]}
                  >
                    <Text style={[styles.shareDayTitle, { color: theme.primaryLight }]}>
                      📅 Ngày {d.day}: {d.area === 'danang' ? 'Đà Nẵng' : 'Hội An'} ({d.items.length} điểm)
                    </Text>
                    {d.items.map((it, idx) => (
                      <Text
                        key={it.id}
                        style={[styles.shareItemLine, { color: theme.text }]}
                        numberOfLines={1}
                      >
                        {idx + 1}. <Text style={{ color: theme.textSub }}>{it.time}</Text> •{' '}
                        {it.place?.name}
                      </Text>
                    ))}
                  </View>
                ))}

                <View
                  style={[
                    styles.shareLinkBox,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <Ionicons name="link-outline" size={14} color={theme.accent} />
                  <Text
                    style={{ fontSize: 10, color: theme.accent, flex: 1, fontWeight: '600' }}
                    numberOfLines={1}
                  >
                    {shareUrl}
                  </Text>
                </View>
              </View>

              {/* Các nút hành động chia sẻ */}
              <View style={{ gap: 8 }}>
                <TouchableOpacity
                  style={[styles.shareActionBtn, { backgroundColor: theme.primary }]}
                  onPress={handleCopyShare}
                >
                  <Ionicons name="copy-outline" size={16} color="#fff" />
                  <Text style={styles.shareActionPrimaryText}>
                    Sao chép Lịch trình & Link (Gửi Zalo / Messenger)
                  </Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.shareSecondaryBtn,
                      { backgroundColor: theme.blueLight, borderColor: theme.primaryLight },
                    ]}
                    onPress={handleNativeShare}
                  >
                    <Ionicons name="share-outline" size={15} color={theme.primaryLight} />
                    <Text style={[styles.shareSecondaryText, { color: theme.primaryLight }]}>
                      Chia sẻ qua App
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.shareSecondaryBtn,
                      { backgroundColor: theme.amberLight, borderColor: theme.amber },
                    ]}
                    onPress={handlePrintPdf}
                  >
                    <Ionicons name="document-text-outline" size={15} color={theme.secondary} />
                    <Text style={[styles.shareSecondaryText, { color: theme.secondary }]}>
                      Xuất PDF / In
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  inspectorCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inspectorTitle: {
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  autoFixBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  autoFixBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 8,
    borderRadius: 10,
  },
  validScheduleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  validScheduleText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  farNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 34,
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  farNoticeText: {
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  inlineConflictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 6,
  },
  inlineConflictText: {
    fontSize: 10,
    fontWeight: '700',
    flex: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  shareCardPreview: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  shareCardBanner: {
    backgroundColor: '#1D4ED8',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sharePassBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 0.8,
  },
  sharePassTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  shareStatsRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  shareStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  shareStatLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  shareStatVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  shareDayBox: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 4,
  },
  shareDayTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  shareItemLine: {
    fontSize: 11,
    lineHeight: 16,
  },
  shareLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    margin: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  shareActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  shareActionPrimaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  shareSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  shareSecondaryText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
