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
import { colors } from '../theme/colors';
import { Area } from '../types';
import { formatCurrency } from '../utils/format';

interface PlannerScreenProps {
  onPlanGenerated: (planData: any) => void;
}

export const PlannerScreen: React.FC<PlannerScreenProps> = ({ onPlanGenerated }) => {
  const [area, setArea] = useState<Area | 'both'>('both');
  const [days, setDays] = useState<number>(2);
  const [people, setPeople] = useState<number>(2);
  const [interests, setInterests] = useState<string[]>([
    'food',
    'checkin',
    'culture',
  ]);
  const [budget, setBudget] = useState<number>(3000000);
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
    setIsLoading(true);
    setLoadingTextIndex(0);

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev < loadingQuotes.length - 1 ? prev + 1 : prev));
    }, 600);

    setTimeout(() => {
      clearInterval(interval);
      setIsLoading(false);
      onPlanGenerated({
        area,
        days,
        people,
        interests,
        budget,
      });
    }, 2200);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.sparkleIconWrap}>
            <Ionicons name="sparkles" size={16} color={colors.primaryLight} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Lập Lịch Trình Vivu AI</Text>
            <Text style={styles.headerSub}>Tự động tối ưu cung đường & ngân sách</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STEP 1: CHỌN KHU VỰC */}
        <View style={styles.stepSection}>
          <Text style={styles.stepTitle}>1. Bạn muốn khám phá khu vực nào?</Text>
          <View style={styles.areaGrid}>
            <TouchableOpacity
              style={[styles.areaOption, area === 'danang' && styles.areaOptionActive]}
              onPress={() => setArea('danang')}
            >
              <Text style={styles.areaEmoji}>🌊</Text>
              <Text style={[styles.areaOptionText, area === 'danang' && styles.areaOptionTextActive]}>
                Đà Nẵng
              </Text>
              <Text style={styles.areaOptionSub}>Biển, cầu, ẩm thực</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.areaOption, area === 'hoian' && styles.areaOptionActive]}
              onPress={() => setArea('hoian')}
            >
              <Text style={styles.areaEmoji}>🏮</Text>
              <Text style={[styles.areaOptionText, area === 'hoian' && styles.areaOptionTextActive]}>
                Hội An
              </Text>
              <Text style={styles.areaOptionSub}>Phố cổ, di sản</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.areaOption, area === 'both' && styles.areaOptionActive]}
              onPress={() => setArea('both')}
            >
              <Text style={styles.areaEmoji}>✨</Text>
              <Text style={[styles.areaOptionText, area === 'both' && styles.areaOptionTextActive]}>
                Cả Hai Nơi
              </Text>
              <Text style={styles.areaOptionSub}>Kết hợp tối ưu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STEP 2: SỐ NGÀY & SỐ NGƯỜI */}
        <View style={styles.stepSection}>
          <Text style={styles.stepTitle}>2. Thời gian & Số lượng người đi</Text>
          <View style={styles.rowTwoCols}>
            {/* Số ngày */}
            <View style={styles.colHalf}>
              <Text style={styles.fieldLabel}>Số ngày tham quan</Text>
              <View style={styles.counterWrap}>
                {[1, 2, 3, 4].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.counterBtn, days === d && styles.counterBtnActive]}
                    onPress={() => setDays(d)}
                  >
                    <Text style={[styles.counterBtnText, days === d && styles.counterBtnTextActive]}>
                      {d}N
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Số người */}
            <View style={styles.colHalf}>
              <Text style={styles.fieldLabel}>Số người tham gia</Text>
              <View style={styles.counterWrap}>
                {[1, 2, 4, 6].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.counterBtn, people === p && styles.counterBtnActive]}
                    onPress={() => setPeople(p)}
                  >
                    <Text style={[styles.counterBtnText, people === p && styles.counterBtnTextActive]}>
                      {p === 1 ? 'Solo' : p === 2 ? 'Đôi' : `${p}ng`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* STEP 3: SỞ THÍCH */}
        <View style={styles.stepSection}>
          <View style={styles.stepHeaderRow}>
            <Text style={styles.stepTitle}>3. Sở thích của bạn</Text>
            <Text style={styles.stepTip}>Chọn nhiều mục</Text>
          </View>
          <View style={styles.interestWrap}>
            {interestOptions.map((opt) => {
              const isSelected = interests.includes(opt.key);
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.interestChip, isSelected && styles.interestChipActive]}
                  onPress={() => toggleInterest(opt.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.interestIcon}>{opt.icon}</Text>
                  <Text
                    style={[
                      styles.interestLabel,
                      isSelected && styles.interestLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* STEP 4: NGÂN SÁCH DỰ TRÙ */}
        <View style={styles.stepSection}>
          <View style={styles.stepHeaderRow}>
            <Text style={styles.stepTitle}>4. Dự trù ngân sách</Text>
            <Text style={styles.budgetValue}>{formatCurrency(budget)}</Text>
          </View>

          <View style={styles.budgetPresetsRow}>
            {budgetPresets.map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.presetBtn, budget === val && styles.presetBtnActive]}
                onPress={() => setBudget(val)}
              >
                <Text
                  style={[styles.presetBtnText, budget === val && styles.presetBtnTextActive]}
                >
                  {val >= 1000000 ? `${val / 1000000} Triệu` : `${val / 1000}k`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* GENERATE BUTTON */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.generateButton}
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
            <View style={styles.quoteCard}>
              <Text style={styles.quoteText}>{loadingQuotes[loadingTextIndex]}</Text>
            </View>
          )}

          <Text style={styles.disclaimerText}>
            *AI chỉ chọn các địa điểm thật trong cơ sở dữ liệu Đà Nẵng & Hội An, đảm bảo tọa độ chính xác.
          </Text>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    backgroundColor: colors.surfaceDark,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sparkleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textLight,
  },
  headerSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  stepSection: {
    marginBottom: 20,
    backgroundColor: colors.surfaceDark,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 10,
  },
  stepTip: {
    fontSize: 10,
    color: colors.textSub,
  },
  areaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  areaOption: {
    flex: 1,
    backgroundColor: colors.bgDark,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  areaOptionActive: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.blueLight,
  },
  areaEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  areaOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  areaOptionTextActive: {
    color: '#fff',
  },
  areaOptionSub: {
    fontSize: 8,
    color: colors.textSub,
    marginTop: 2,
    textAlign: 'center',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 8,
  },
  counterWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  counterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignItems: 'center',
  },
  counterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  counterBtnText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  counterBtnTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  interestWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    gap: 6,
  },
  interestChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  interestIcon: {
    fontSize: 12,
  },
  interestLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  interestLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  budgetValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.amber,
  },
  budgetPresetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.bgDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: colors.amberLight,
    borderColor: colors.amber,
  },
  presetBtnText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  presetBtnTextActive: {
    color: colors.amber,
    fontWeight: '800',
  },
  actionSection: {
    marginTop: 4,
  },
  generateButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quoteCard: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  quoteText: {
    fontSize: 10,
    color: colors.primaryLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  disclaimerText: {
    fontSize: 9,
    color: colors.textSub,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 14,
  },
});
