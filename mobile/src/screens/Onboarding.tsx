import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface OnboardingProps {
  onFinish: () => void;
}

const SLIDES: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  desc: string;
}[] = [
  {
    icon: 'sparkles',
    color: '#2563EB',
    title: 'AI lập lịch trình trong 5 giây',
    desc: 'Chọn khu vực, số ngày, sở thích và ngân sách. Vivu AI chỉ chọn địa điểm thật ở Đà Nẵng - Hội An, sắp xếp theo giờ và cung đường gần nhau.',
  },
  {
    icon: 'camera',
    color: '#F59E0B',
    title: 'Chụp ảnh - biết ngay món gì, ở đâu',
    desc: 'Chụp món ăn hoặc danh thắng, AI nhận diện kèm độ tin cậy và gợi ý quán tương ứng để thêm thẳng vào lịch trình.',
  },
  {
    icon: 'location',
    color: '#10B981',
    title: 'GPS "Quanh bạn" & dẫn đường',
    desc: 'Xem địa điểm gần bạn nhất, hiển thị ghim đánh số trên bản đồ và mở Google Maps dẫn đường chỉ với một chạm.',
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.topRow}>
        {!isLast ? (
          <TouchableOpacity onPress={onFinish}>
            <Text style={[styles.skip, { color: theme.textMuted }]}>Bỏ qua</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      <View style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: slide.color + '26' }]}>
          <View style={[styles.iconInner, { backgroundColor: slide.color }]}>
            <Ionicons name={slide.icon} size={54} color="#fff" />
          </View>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{slide.title}</Text>
        <Text style={[styles.desc, { color: theme.textMuted }]}>{slide.desc}</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? theme.primary : theme.border },
                i === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: theme.primary }]}
          onPress={() => (isLast ? onFinish() : setIndex(index + 1))}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>{isLast ? 'Bắt đầu khám phá' : 'Tiếp tục'}</Text>
          <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingVertical: 20 },
  topRow: { height: 30, alignItems: 'flex-end', justifyContent: 'center' },
  skip: { fontSize: 13, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  desc: { fontSize: 14, lineHeight: 21, textAlign: 'center', paddingHorizontal: 8 },
  bottom: { gap: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  nextText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
