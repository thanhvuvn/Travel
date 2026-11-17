import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GUEST_AI_LIMIT, useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Area, WeatherCondition } from '../types';
import { formatCurrency } from '../utils/format';
import { MOCK_TRAVEL_EVENTS } from '../data/mockEvents';
import { LOCAL_TIMING_TIPS } from '../data/mockWeather';

interface PlannerScreenProps {
  onPlanGenerated: () => void;
}

export const PlannerScreen: React.FC<PlannerScreenProps> = ({ onPlanGenerated }) => {
  const { theme } = useTheme();
  const { role, openAuthModal } = useAuth();
  const { createPlan, guestUsed, weatherCondition } = useAppData();
  const [errorKind, setErrorKind] = useState<null | 'error' | 'limit' | 'empty'>(null);
  const [area, setArea] = useState<Area | 'both'>('both');
  const [days, setDays] = useState<number>(2);
  const [people, setPeople] = useState<number>(2);
  const [interests, setInterests] = useState<string[]>([
    'food',
    'checkin',
    'culture',
  ]);
  const [budget, setBudget] = useState<number>(3000000);
  const [selectedEvent, setSelectedEvent] = useState<string>('none');
  const [selectedWeather, setSelectedWeather] = useState<WeatherCondition>(weatherCondition);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState<number>(0);

  const interestOptions = [
    { key: 'food', label: 'Ẩm thực đặc sản', icon: '🍜' },
    { key: 'checkin', label: 'Sống ảo / Check-in', icon: '📸' },
    { key: 'beach', label: 'Tắm biển & Thư giãn', icon: '🏖️' },
    { key: 'culture', label: 'Di tích & Lịch sử', icon: '🏮' },
    { key: 'cafe', label: 'Cà phê view đẹp', icon: '☕' },
  ];

  const budgetPresets = [1500000, 3000000, 5000000, 8000000];

  const loadingQuotes = [
    'Vivu AI đang kết nối danh sách địa điểm thật...',
    'Đang gom cụm địa điểm gần nhau để tiết kiệm thời gian di chuyển...',
    'Đang cân đối chi phí theo ngân sách của bạn...',
    'Hoàn tất! Đang vẽ lộ trình lên bản đồ...',
  ];

  const toggleInterest = (key: string) => {
    if (interests.includes(key)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== key));
      }
    } else {
      setInterests([...interests, key]);
    }
  };

  const handleGenerate = () => {
    setErrorKind(null);

    // Khách vãng lai hết lượt dùng thử -> chặn ngay, không cần gọi AI
    if (role === 'guest' && guestUsed >= GUEST_AI_LIMIT) {
      setErrorKind('limit');
      return;
    }

    setIsLoading(true);
    setLoadingTextIndex(0);

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev < loadingQuotes.length - 1 ? prev + 1 : prev));
    }, 600);

    setTimeout(() => {
      clearInterval(interval);
      setIsLoading(false);
      const result = createPlan({
        area,
        days,
        people,
        interests,
        budget,
        event: selectedEvent,
        weatherPreference: selectedWeather,
      });
      if (result === 'ok') {
        onPlanGenerated();
      } else {
        setErrorKind(result);
      }
    }, 2200);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View style={styles.headerTitleWrap}>
          <View style={[styles.sparkleIconWrap, { backgroundColor: theme.blueLight }]}>
            <Ionicons name="sparkles" size={16} color={theme.primaryLight} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Lập Lịch Trình Vivu AI
            </Text>
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>
              Tự động tối ưu cung đường & ngân sách
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* BANNER GỢI Ý KHUNG GIỜ VÀNG */}
        <View
          style={[
            styles.timingBanner,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Ionicons name="time-outline" size={15} color={theme.secondary} />
            <Text style={[styles.timingBannerTitle, { color: theme.text }]}>
              Khung giờ vàng du lịch bản địa
            </Text>
          </View>
          <Text style={[styles.timingBannerDesc, { color: theme.textMuted }]}>
            AI sẽ tự động căn giờ: Phố cổ Hội An (sau 16:30 ngắm đèn lồng), Cầu Rồng (21:00 cuối tuần), Biển Mỹ Khê (sáng sớm hoặc chiều mát).
          </Text>
        </View>

        {/* STEP 1 */}
        <View
          style={[
            styles.stepSection,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.stepTitle, { color: theme.text }]}>
            1. Bạn muốn khám phá khu vực nào?
          </Text>
          <View style={styles.areaGrid}>
            {[
              { key: 'danang' as const, emoji: '🌊', title: 'Đà Nẵng', sub: 'Biển, cầu, ẩm thực' },
              { key: 'hoian' as const, emoji: '🏮', title: 'Hội An', sub: 'Phố cổ, di sản' },
              { key: 'both' as const, emoji: '✨', title: 'Cả Hai Nơi', sub: 'Kết hợp tối ưu' },
            ].map((opt) => {
              const isSelected = area === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.areaOption,
                    { backgroundColor: theme.bg, borderColor: theme.border },
                    isSelected && {
                      borderColor: theme.primaryLight,
                      backgroundColor: theme.blueLight,
                    },
                  ]}
                  onPress={() => setArea(opt.key)}
                >
                  <Text style={styles.areaEmoji}>{opt.emoji}</Text>
                  <Text
                    style={[
                      styles.areaOptionText,
                      { color: isSelected ? theme.primaryLight : theme.textMuted },
                    ]}
                  >
                    {opt.title}
                  </Text>
                  <Text style={[styles.areaOptionSub, { color: theme.textSub }]}>
                    {opt.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 2 */}
        <View
          style={[
            styles.stepSection,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.stepTitle, { color: theme.text }]}>
            2. Thời gian & Số lượng người đi
          </Text>
          <View style={styles.rowTwoCols}>
            <View style={styles.colHalf}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                Số ngày tham quan
              </Text>
              <View style={styles.counterWrap}>
                {[1, 2, 3, 4].map((d) => {
                  const isActive = days === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.counterBtn,
                        { backgroundColor: theme.bg, borderColor: theme.border },
                        isActive && {
                          backgroundColor: theme.primary,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => setDays(d)}
                    >
                      <Text
                        style={[
                          styles.counterBtnText,
                          { color: isActive ? '#fff' : theme.textMuted },
                        ]}
                      >
                        {d}N
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.colHalf}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                Số người tham gia
              </Text>
              <View style={styles.counterWrap}>
                {[1, 2, 4, 6].map((p) => {
                  const isActive = people === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.counterBtn,
                        { backgroundColor: theme.bg, borderColor: theme.border },
                        isActive && {
                          backgroundColor: theme.primary,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => setPeople(p)}
                    >
                      <Text
                        style={[
                          styles.counterBtnText,
                          { color: isActive ? '#fff' : theme.textMuted },
                        ]}
                      >
                        {p === 1 ? 'Solo' : p === 2 ? 'Đôi' : `${p}ng`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* STEP 3 */}
        <View
          style={[
            styles.stepSection,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.stepHeaderRow}>
            <Text style={[styles.stepTitle, { color: theme.text, marginBottom: 0 }]}>
              3. Sở thích của bạn
            </Text>
            <Text style={[styles.stepTip, { color: theme.textSub }]}>Chọn nhiều mục</Text>
          </View>
          <View style={[styles.interestWrap, { marginTop: 10 }]}>
            {interestOptions.map((opt) => {
              const isSelected = interests.includes(opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.interestChip,
                    { backgroundColor: theme.bg, borderColor: theme.border },
                    isSelected && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => toggleInterest(opt.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.interestIcon}>{opt.icon}</Text>
                  <Text
                    style={[
                      styles.interestLabel,
                      { color: isSelected ? '#fff' : theme.textMuted },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 4 */}
        <View
          style={[
            styles.stepSection,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.stepHeaderRow}>
            <Text style={[styles.stepTitle, { color: theme.text, marginBottom: 0 }]}>
              4. Dự trù ngân sách
            </Text>
            <Text style={[styles.budgetValue, { color: theme.amber }]}>
              {formatCurrency(budget)}
            </Text>
          </View>

          <View style={[styles.budgetPresetsRow, { marginTop: 10 }]}>
            {budgetPresets.map((val) => {
              const isActive = budget === val;
              return (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.presetBtn,
                    { backgroundColor: theme.bg, borderColor: theme.border },
                    isActive && {
                      backgroundColor: theme.amberLight,
                      borderColor: theme.amber,
                    },
                  ]}
                  onPress={() => setBudget(val)}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      { color: isActive ? theme.amber : theme.textMuted },
                      isActive && { fontWeight: '800' },
                    ]}
                  >
                    {val >= 1000000 ? `${val / 1000000} Triệu` : `${val / 1000}k`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 5: SỰ KIỆN & THỜI TIẾT ƯU TIÊN */}
        <View
          style={[
            styles.stepSection,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.stepHeaderRow}>
            <Text style={[styles.stepTitle, { color: theme.text, marginBottom: 0 }]}>
              5. Mùa lễ hội & Thời tiết ưu tiên
            </Text>
            <Text style={[styles.stepTip, { color: theme.textSub }]}>Tối ưu trải nghiệm</Text>
          </View>

          {/* Chọn sự kiện */}
          <Text style={[styles.fieldLabel, { color: theme.textMuted, marginTop: 10 }]}>
            Sự kiện hoặc Lễ hội đặc biệt
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 6 }}>
            {[
              { id: 'none', title: 'Tự do / Thường nhật', icon: '✨' },
              ...MOCK_TRAVEL_EVENTS.map((e) => ({ id: e.id, title: e.title, icon: e.icon })),
            ].map((ev) => {
              const active = selectedEvent === ev.id;
              return (
                <TouchableOpacity
                  key={ev.id}
                  style={[
                    styles.eventOptionChip,
                    { backgroundColor: theme.bg, borderColor: theme.border },
                    active && { backgroundColor: theme.blueLight, borderColor: theme.primaryLight },
                  ]}
                  onPress={() => setSelectedEvent(ev.id)}
                >
                  <Text style={{ fontSize: 13 }}>{ev.icon}</Text>
                  <Text
                    style={[
                      styles.eventOptionText,
                      { color: active ? theme.primaryLight : theme.textMuted },
                      active && { fontWeight: '700' },
                    ]}
                  >
                    {ev.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Chọn thời tiết */}
          <Text style={[styles.fieldLabel, { color: theme.textMuted, marginTop: 12 }]}>
            Điều kiện thời tiết dự kiến
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            {[
              { cond: 'sunny' as const, label: 'Nắng đẹp', icon: '☀️' },
              { cond: 'cloudy' as const, label: 'Dịu mát', icon: '⛅' },
              { cond: 'rainy' as const, label: 'Mưa rào (Trú mưa)', icon: '🌧️' },
            ].map((w) => {
              const active = selectedWeather === w.cond;
              return (
                <TouchableOpacity
                  key={w.cond}
                  style={[
                    styles.weatherOptionBtn,
                    { backgroundColor: theme.bg, borderColor: theme.border },
                    active && { backgroundColor: theme.amberLight, borderColor: theme.amber },
                  ]}
                  onPress={() => setSelectedWeather(w.cond)}
                >
                  <Text style={{ fontSize: 13 }}>{w.icon}</Text>
                  <Text
                    style={[
                      styles.weatherOptionText,
                      { color: active ? theme.secondary : theme.textMuted },
                      active && { fontWeight: '700' },
                    ]}
                  >
                    {w.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* GENERATE BUTTON */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: theme.primary }]}
            onPress={handleGenerate}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.generateButtonText}>Đang tạo lịch trình...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.generateButtonText}>Vivu AI, Tạo Lịch Trình Ngay!</Text>
              </>
            )}
          </TouchableOpacity>

          {isLoading && (
            <View
              style={[
                styles.quoteCard,
                { backgroundColor: theme.blueLight, borderColor: theme.primaryLight },
              ]}
            >
              <Text style={[styles.quoteText, { color: theme.primaryLight }]}>
                {loadingQuotes[loadingTextIndex]}
              </Text>
            </View>
          )}

          {role === 'guest' && (
            <Text style={[styles.disclaimerText, { color: theme.textSub, marginTop: 8 }]}>
              Khách dùng thử: còn {Math.max(0, GUEST_AI_LIMIT - guestUsed)}/{GUEST_AI_LIMIT} lượt tạo lịch (không lưu).
            </Text>
          )}

          {errorKind && (
            <View
              style={[
                styles.errorCard,
                {
                  backgroundColor: errorKind === 'limit' ? theme.amberLight : theme.roseLight,
                  borderColor: errorKind === 'limit' ? theme.amber : theme.rose,
                },
              ]}
            >
              <Ionicons
                name={errorKind === 'limit' ? 'lock-closed' : 'cloud-offline'}
                size={28}
                color={errorKind === 'limit' ? theme.amber : theme.rose}
              />
              <Text style={[styles.errorTitle, { color: theme.text }]}>
                {errorKind === 'limit'
                  ? 'Bạn đã hết lượt dùng thử'
                  : errorKind === 'empty'
                  ? 'Không đủ địa điểm để lập lịch'
                  : 'AI đang gặp sự cố'}
              </Text>
              <Text style={[styles.errorDesc, { color: theme.textMuted }]}>
                {errorKind === 'limit'
                  ? `Khách vãng lai chỉ được tạo ${GUEST_AI_LIMIT} lịch trình. Đăng nhập để tạo không giới hạn và lưu lịch trình.`
                  : errorKind === 'empty'
                  ? 'Khu vực bạn chọn hiện chưa có địa điểm nào đang hoạt động. Hãy thử chọn khu vực khác.'
                  : 'Không nhận được phản hồi hợp lệ từ AI hoặc mất kết nối mạng. Vui lòng thử lại sau ít giây.'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.errorBtn,
                  { backgroundColor: errorKind === 'limit' ? theme.primary : theme.rose },
                ]}
                onPress={() => (errorKind === 'limit' ? openAuthModal('login') : handleGenerate())}
              >
                <Ionicons name={errorKind === 'limit' ? 'log-in-outline' : 'refresh'} size={15} color="#fff" />
                <Text style={styles.errorBtnText}>
                  {errorKind === 'limit' ? 'Đăng nhập ngay' : 'Thử lại'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.disclaimerText, { color: theme.textSub }]}>
            *AI chỉ chọn các địa điểm thật trong cơ sở dữ liệu Đà Nẵng & Hội An, đảm bảo tọa độ chính xác.
          </Text>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sparkleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '800' },
  headerSub: { fontSize: 10, marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 30 },
  stepSection: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: { fontSize: 12, fontWeight: '700', marginBottom: 10 },
  stepTip: { fontSize: 10 },
  areaGrid: { flexDirection: 'row', gap: 8 },
  areaOption: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  areaEmoji: { fontSize: 20, marginBottom: 4 },
  areaOptionText: { fontSize: 11, fontWeight: '700' },
  areaOptionSub: { fontSize: 8, marginTop: 2, textAlign: 'center' },
  rowTwoCols: { flexDirection: 'row', gap: 12 },
  colHalf: { flex: 1 },
  fieldLabel: { fontSize: 10, marginBottom: 8 },
  counterWrap: { flexDirection: 'row', gap: 6 },
  counterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  counterBtnText: { fontSize: 11, fontWeight: '600' },
  interestWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  interestIcon: { fontSize: 12 },
  interestLabel: { fontSize: 11, fontWeight: '500' },
  budgetValue: { fontSize: 13, fontWeight: '800' },
  budgetPresetsRow: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetBtnText: { fontSize: 10, fontWeight: '600' },
  actionSection: { marginTop: 4 },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  generateButtonText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quoteCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  quoteText: { fontSize: 10, textAlign: 'center', fontStyle: 'italic' },
  disclaimerText: { fontSize: 9, textAlign: 'center', marginTop: 10, lineHeight: 14 },
  errorCard: { marginTop: 14, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 6 },
  errorTitle: { fontSize: 14, fontWeight: '800' },
  errorDesc: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  errorBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginTop: 6 },
  errorBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  timingBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  timingBannerTitle: { fontSize: 12, fontWeight: '700' },
  timingBannerDesc: { fontSize: 10, lineHeight: 15, marginTop: 2 },
  eventOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  eventOptionText: { fontSize: 11, fontWeight: '600' },
  weatherOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  weatherOptionText: { fontSize: 10, fontWeight: '600' },
});
