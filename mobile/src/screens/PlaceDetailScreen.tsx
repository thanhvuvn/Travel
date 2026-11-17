import React, { useState } from 'react';
import { Image, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import { useTheme } from '../context/ThemeContext';
import { Place } from '../types';
import { Alert } from '../utils/dialog';
import { calculateHaversineDistance, formatDistance, MOCK_USER_LOCATION } from '../utils/distance';
import { formatCurrency } from '../utils/format';

interface PlaceDetailScreenProps {
  place: Place;
  onBack: () => void;
  onGoPlanner: () => void;
  onGoItinerary: () => void;
}

export const PlaceDetailScreen: React.FC<PlaceDetailScreenProps> = ({
  place,
  onBack,
  onGoPlanner,
  onGoItinerary,
}) => {
  const { theme } = useTheme();
  const { user, openAuthModal } = useAuth();
  const { isFavorite, toggleFavorite, plan, addPlaceToDay } = useAppData();
  const { reviews, addReview, reportClosed } = usePlaces();
  const [dayPickerOpen, setDayPickerOpen] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');

  const approvedReviews = reviews.filter((r) => r.place_id === place.id && r.status === 'approved');

  const handleReportClosed = () => {
    if (!user) {
      Alert.alert('Cần đăng nhập', 'Đăng nhập để báo cáo thông tin sai.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => openAuthModal('login') },
      ]);
      return;
    }
    Alert.alert('Báo quán đã đóng cửa', `Bạn xác nhận "${place.name}" đã đóng cửa hoặc ngừng hoạt động?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Gửi báo cáo',
        onPress: () => {
          const res = reportClosed(place.id, user.name);
          Alert.alert(
            res === 'ok' ? 'Đã gửi báo cáo' : 'Bạn đã báo rồi',
            res === 'ok'
              ? 'Cảm ơn bạn! Admin sẽ kiểm tra lại thông tin địa điểm này.'
              : 'Báo cáo của bạn cho địa điểm này đang chờ Admin xử lý.'
          );
        },
      },
    ]);
  };

  const handleSubmitReview = () => {
    if (!user) {
      Alert.alert('Cần đăng nhập', 'Đăng nhập để viết đánh giá.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => openAuthModal('login') },
      ]);
      return;
    }
    if (myComment.trim().length < 5) {
      Alert.alert('Nội dung quá ngắn', 'Vui lòng viết ít nhất 5 ký tự.');
      return;
    }
    addReview(place.id, user.name, myRating, myComment.trim());
    setMyComment('');
    setMyRating(5);
    Alert.alert('Cảm ơn bạn!', 'Đánh giá đã được gửi và đang chờ Admin duyệt.');
  };

  const fav = isFavorite(place.id);
  const distance = calculateHaversineDistance(
    MOCK_USER_LOCATION.lat,
    MOCK_USER_LOCATION.lng,
    place.lat,
    place.lng
  );

  const handleFavorite = () => {
    if (!user) {
      Alert.alert('Cần đăng nhập', 'Đăng nhập để lưu địa điểm yêu thích của bạn.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Đăng nhập', onPress: () => openAuthModal('login') },
      ]);
      return;
    }
    toggleFavorite(place.id);
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Thông báo', 'Không thể mở bản đồ trên thiết bị này.')
    );
  };

  const handleAddToPlan = () => {
    if (!plan) {
      Alert.alert('Chưa có lịch trình', 'Hãy tạo lịch trình bằng AI trước rồi thêm địa điểm này vào.', [
        { text: 'Để sau', style: 'cancel' },
        { text: 'Tạo lịch trình', onPress: onGoPlanner },
      ]);
      return;
    }
    setDayPickerOpen(true);
  };

  const pickDay = (dayIndex: number) => {
    const already = plan?.days[dayIndex].items.some((it) => it.place_id === place.id);
    if (already) {
      Alert.alert('Đã có trong lịch', `${place.name} đã nằm trong Ngày ${dayIndex + 1}.`);
      return;
    }
    addPlaceToDay(dayIndex, place);
    setDayPickerOpen(false);
    Alert.alert('Đã thêm', `Đã thêm ${place.name} vào Ngày ${dayIndex + 1}.`, [
      { text: 'Ở lại', style: 'cancel' },
      { text: 'Xem lịch trình', onPress: onGoItinerary },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HERO */}
        <View style={styles.hero}>
          <Image source={{ uri: place.image }} style={styles.heroImage} />
          <TouchableOpacity style={[styles.roundBtn, { left: 14 }]} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roundBtn, { right: 14 }]} onPress={handleFavorite}>
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? '#F43F5E' : '#fff'} />
          </TouchableOpacity>
          <View style={[styles.areaTag, { backgroundColor: place.area === 'danang' ? '#2563EB' : '#EA580C' }]}>
            <Text style={styles.areaTagText}>{place.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.text }]}>{place.name}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{place.type}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={theme.amber} />
            <Text style={[styles.ratingVal, { color: theme.amber }]}>{place.rating}</Text>
            <Text style={[styles.ratingCount, { color: theme.textSub }]}>
              ({place.review_count} đánh giá)
            </Text>
          </View>

          {/* INFO CARDS */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="cash-outline" size={18} color={theme.emerald} />
              <Text style={[styles.infoLabel, { color: theme.textSub }]}>Giá</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{formatCurrency(place.avg_cost)}</Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="time-outline" size={18} color={theme.primaryLight} />
              <Text style={[styles.infoLabel, { color: theme.textSub }]}>Giờ mở cửa</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{place.open_hours}</Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="navigate-outline" size={18} color={theme.accent} />
              <Text style={[styles.infoLabel, { color: theme.textSub }]}>Cách bạn</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{formatDistance(distance)}</Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Giới thiệu</Text>
          <Text style={[styles.desc, { color: theme.textMuted }]}>{place.description}</Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Vị trí</Text>
          <View style={[styles.coordBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="location" size={16} color={theme.rose} />
            <Text style={[styles.coordText, { color: theme.textMuted }]}>
              {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
            </Text>
          </View>

          <View style={styles.tagWrap}>
            {place.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.tagText, { color: theme.textSub }]}>#{tag}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.reportBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
            onPress={handleReportClosed}
            activeOpacity={0.8}
          >
            <Ionicons name="flag-outline" size={15} color={theme.rose} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.rose }}>Báo quán đã đóng cửa / thông tin sai</Text>
          </TouchableOpacity>

          {/* ĐÁNH GIÁ */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Đánh giá ({approvedReviews.length})
          </Text>
          {approvedReviews.length === 0 ? (
            <Text style={{ fontSize: 12, color: theme.textMuted }}>
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </Text>
          ) : (
            approvedReviews.map((r) => (
              <View key={r.id} style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.reviewHead}>
                  <Text style={[styles.reviewName, { color: theme.text }]}>{r.user_name}</Text>
                  <Text style={{ fontSize: 10, color: theme.textSub }}>{r.created_at}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 2, marginVertical: 3 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons key={n} name={n <= r.rating ? 'star' : 'star-outline'} size={12} color={theme.amber} />
                  ))}
                </View>
                <Text style={{ fontSize: 12, color: theme.textMuted, lineHeight: 18 }}>{r.content}</Text>
              </View>
            ))
          )}

          <View style={[styles.writeBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.reviewName, { color: theme.text }]}>Viết đánh giá của bạn</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginVertical: 8 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <TouchableOpacity key={n} onPress={() => setMyRating(n)} hitSlop={6}>
                  <Ionicons name={n <= myRating ? 'star' : 'star-outline'} size={26} color={theme.amber} />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.reviewInput, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }]}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              placeholderTextColor={theme.textSub}
              value={myComment}
              onChangeText={setMyComment}
              multiline
            />
            <TouchableOpacity style={[styles.reviewSubmit, { backgroundColor: theme.primary }]} onPress={handleSubmitReview}>
              <Ionicons name="send" size={14} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Gửi đánh giá</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 10, color: theme.textSub, marginTop: 6 }}>
              Đánh giá sẽ hiển thị sau khi Admin duyệt.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ACTION BAR */}
      <View style={[styles.actionBar, { backgroundColor: theme.navBg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.sideBtn, { backgroundColor: fav ? theme.roseLight : theme.surface, borderColor: fav ? theme.rose : theme.border }]}
          onPress={handleFavorite}
        >
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? theme.rose : theme.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sideBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleDirections}
        >
          <Ionicons name="navigate" size={20} color={theme.accent} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainBtn, { backgroundColor: theme.primary }]}
          onPress={handleAddToPlan}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.mainBtnText}>Thêm vào lịch trình</Text>
        </TouchableOpacity>
      </View>

      {/* DAY PICKER */}
      <Modal visible={dayPickerOpen} transparent animationType="fade" onRequestClose={() => setDayPickerOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setDayPickerOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sheetTitle, { color: theme.text }]}>Thêm vào ngày nào?</Text>
            {plan?.days.map((d, i) => (
              <TouchableOpacity
                key={d.day}
                style={[styles.dayOption, { backgroundColor: theme.bg, borderColor: theme.border }]}
                onPress={() => pickDay(i)}
              >
                <Text style={[styles.dayOptionText, { color: theme.text }]}>
                  Ngày {d.day} ({d.area === 'danang' ? 'Đà Nẵng' : 'Hội An'})
                </Text>
                <Text style={[styles.dayOptionSub, { color: theme.textSub }]}>{d.items.length} điểm</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  roundBtn: {
    position: 'absolute',
    top: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaTag: { position: 'absolute', bottom: 14, left: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  areaTagText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  body: { padding: 18 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  ratingVal: { fontSize: 14, fontWeight: '800' },
  ratingCount: { fontSize: 12 },
  infoGrid: { flexDirection: 'row', gap: 8, marginTop: 16 },
  infoCard: { flex: 1, padding: 10, borderRadius: 14, borderWidth: 1, alignItems: 'center', gap: 3 },
  infoLabel: { fontSize: 10 },
  infoValue: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginTop: 20, marginBottom: 6 },
  desc: { fontSize: 13, lineHeight: 20 },
  coordBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  coordText: { fontSize: 12, fontFamily: 'monospace' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16 },
  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  tagText: { fontSize: 11 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1, marginTop: 16 },
  reviewCard: { padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewName: { fontSize: 12, fontWeight: '800' },
  writeBox: { padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 8 },
  reviewInput: { borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 70, fontSize: 12, textAlignVertical: 'top' },
  reviewSubmit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, marginTop: 10 },
  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1 },
  sideBtn: { width: 48, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  mainBtn: { flex: 1, height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mainBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  sheet: { borderRadius: 20, padding: 16, gap: 8 },
  sheetTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  dayOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  dayOptionText: { fontSize: 13, fontWeight: '700' },
  dayOptionSub: { fontSize: 11 },
});
