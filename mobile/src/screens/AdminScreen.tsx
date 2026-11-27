import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import { useTheme } from '../context/ThemeContext';
import { communityApi } from '../services/communityApi';
import { Area, Category, Place } from '../types';
import { Alert } from '../utils/dialog';
import { formatCurrency } from '../utils/format';

type AdminTab = 'places' | 'users' | 'reviews' | 'overview';

interface AdminScreenProps {
  onLogout: () => void;
  onPreviewUserApp?: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  onLogout,
  onPreviewUserApp,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    places,
    users,
    aiStats,
    togglePlaceActive,
    addPlace,
    updatePlace,
    deletePlace,
    isLoading, error, refreshPlaces, resetPlacesToDefault,
    toggleUserLock,
    reviews,
    setReviewStatus,
    deleteReview,
    suggestions,
    approveSuggestion,
    rejectSuggestion,
    reports,
    resolveReport,
  } = usePlaces();

  const pendingReviews = reviews.filter((r) => r.status === 'pending');
  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending');
  const openReports = reports.filter((r) => r.status === 'open');
  const totalModeration = pendingReviews.length + pendingSuggestions.length + openReports.length;

  const [moderationTab, setModerationTab] = useState<'reviews' | 'suggestions' | 'reports'>('reviews');
  const DEFAULT_WEEK = [
    { d: 'T2', v: 12 },
    { d: 'T3', v: 18 },
    { d: 'T4', v: 9 },
    { d: 'T5', v: 22 },
    { d: 'T6', v: 17 },
    { d: 'T7', v: 28 },
    { d: 'CN', v: 24 },
  ];
  const [WEEK, setWeek] = useState(DEFAULT_WEEK);
  const weekMax = Math.max(1, ...WEEK.map((w) => w.v));
  const hotPlaces = [...places].sort((a, b) => b.review_count - a.review_count).slice(0, 5);
  const hotMax = Math.max(1, ...hotPlaces.map((p) => p.review_count));

  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);
  const showError = (e: unknown) => Alert.alert('Lỗi', e instanceof Error ? e.message : 'Thao tác thất bại.');
  const [activeTab, setActiveTab] = useState<AdminTab>('places');

  // Đồng bộ biểu đồ 7 ngày thật từ GET /api/admin/stats (fallback về DEFAULT_WEEK nếu chưa có log AI)
  useEffect(() => {
    if (activeTab !== 'overview') return;
    let mounted = true;
    communityApi.getAdminStats().then((res) => {
      if (!mounted || !res?.success || !res.data) return;
      const hasData = res.data.weeklyCalls.some((item) => item.v > 0);
      if (hasData) {
        setWeek(res.data.weeklyCalls.map((item) => ({ d: item.d, v: item.v })));
      }
    });
    return () => {
      mounted = false;
    };
  }, [activeTab]);
  const [filterArea, setFilterArea] = useState<Area | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'rating_desc' | 'cost_asc' | 'cost_desc' | 'name_asc'>('default');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal thêm / sửa địa điểm
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formArea, setFormArea] = useState<Area>('danang');
  const [formCategory, setFormCategory] = useState<Category>('food');
  const [formType, setFormType] = useState('Quán ăn đặc sản');
  const [formLat, setFormLat] = useState('16.0612');
  const [formLng, setFormLng] = useState('108.2198');
  const [formCost, setFormCost] = useState('50000');
  const [formHours, setFormHours] = useState('07:00 - 22:00');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState(
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
  );
  const [formTags, setFormTags] = useState('đặc sản, ẩm thực');

  const PRESET_IMAGES = [
    {
      label: '🍜 Ẩm thực',
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: '🏖️ Bãi biển',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: '🏮 Phố cổ',
      url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&auto=format&fit=crop&q=80',
    },
    {
      label: '☕ Cà phê',
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const handlePickLocalImage = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            setFormImage(reader.result);
          }
        };
        reader.readAsDataURL(file);
      };
      input.click();
    } else {
      Alert.alert(
        'Chọn ảnh',
        'Trên điện thoại, bạn có thể dán trực tiếp link ảnh (URL) hoặc chọn nhanh ảnh mẫu bên dưới.'
      );
    }
  };

  // Thống kê nhanh
  const activePlacesCount = places.filter((p) => p.is_active).length;
  const daNangCount = places.filter((p) => p.area === 'danang').length;
  const hoiAnCount = places.filter((p) => p.area === 'hoian').length;
  const lockedUsersCount = users.filter((u) => u.is_locked).length;

  const openAddModal = () => {
    setEditingPlaceId(null);
    setFormImage(PRESET_IMAGES[0].url);
    setFormName('');
    setFormArea('danang');
    setFormCategory('food');
    setFormType('Quán ăn đặc sản');
    setFormLat('16.0612');
    setFormLng('108.2198');
    setFormCost('50000');
    setFormHours('07:00 - 22:00');
    setFormDesc('');
    setFormTags('đặc sản, ẩm thực');
    setIsPlaceModalOpen(true);
  };

  const openEditModal = (place: Place) => {
    setEditingPlaceId(place.id);
    setFormName(place.name);
    setFormArea(place.area);
    setFormCategory(place.category);
    setFormType(place.type);
    setFormLat(place.lat.toString());
    setFormLng(place.lng.toString());
    setFormCost(place.avg_cost.toString());
    setFormHours(place.open_hours);
    setFormDesc(place.description);
    setFormImage(place.image);
    setFormTags(place.tags.join(', '));
    setIsPlaceModalOpen(true);
  };

  const handleSavePlace = async () => {
    if (saving) return;
    if (!formName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên địa điểm');
      return;
    }

    if ([formLat, formLng, formCost].some(v => !v.trim() || !Number.isFinite(Number(v)))) {
      Alert.alert('Lỗi', 'Tọa độ và chi phí phải là số hợp lệ.');
      return;
    }
    const placeData = {
      name: formName.trim(),
      area: formArea,
      category: formCategory,
      type: formType.trim() || 'Địa điểm tham quan',
      lat: Number(formLat),
      lng: Number(formLng),
      avg_cost: Number(formCost),
      open_hours: formHours.trim() || 'Cả ngày',
      description: formDesc.trim() || 'Điểm đến hấp dẫn tại Đà Nẵng - Hội An',
      image: formImage.trim(),
      tags: formTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      is_active: editingPlaceId ? places.find(p => p.id === editingPlaceId)?.is_active ?? true : true,
    };

    setSaving(true);
    try {
    if (editingPlaceId) {
      await updatePlace(editingPlaceId, placeData);
      Alert.alert('Thành công', 'Đã cập nhật thông tin địa điểm.');
    } else {
      await addPlace(placeData);
      Alert.alert('Thành công', 'Đã thêm địa điểm mới vào hệ thống.');
    }

    setIsPlaceModalOpen(false);
    } catch (e) { showError(e); } finally { setSaving(false); }
  };

  const handleDeletePlace = (place: Place) => {
    Alert.alert(
      'Xác nhận xóa',
      `Ẩn địa điểm "${place.name}"? Lịch trình, yêu thích và đánh giá được giữ nguyên.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Ẩn địa điểm',
          style: 'destructive',
          onPress: () => { void deletePlace(place.id).catch(showError); },
        },
      ]
    );
  };

  // Lọc và sắp xếp địa điểm
  const filteredPlaces = places
    .filter((p) => {
      const matchArea = filterArea === 'all' || p.area === filterArea;
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' ? p.is_active : !p.is_active);
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchArea && matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      if (sortBy === 'cost_asc') return a.avg_cost - b.avg_cost;
      if (sortBy === 'cost_desc') return b.avg_cost - a.avg_cost;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'vi');
      return 0;
    });

  const handleResetDemoData = () => {
    if (resetting) return;
    Alert.alert('Khôi phục dữ liệu mẫu',
      'Khôi phục thông tin và bật lại 16 địa điểm mẫu. Địa điểm thêm mới, tài khoản, đánh giá, yêu thích và lịch trình được giữ nguyên. Chỉ dùng trên database local/test.', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Khôi phục', onPress: async () => {
          setResetting(true);
          try {
            const count = await resetPlacesToDefault();
            Alert.alert('Thành công', `Đã khôi phục ${count} địa điểm mẫu từ backend.`);
          } catch (e) { showError(e); }
          finally { setResetting(false); }
        } },
      ]);
  };

  const handleExportCSV = async () => {
    const header = 'ID,Ten dia diem,Khu vuc,Danh muc,Chi phi (VND),Danh gia,Gio mo cua,Trang thai AI';
    const rows = filteredPlaces.map((p) => {
      const areaLabel = p.area === 'danang' ? 'Da Nang' : 'Hoi An';
      const statusLabel = p.is_active ? 'Dang bat' : 'Tam an';
      const safeName = `"${p.name.replace(/"/g, '""')}"`;
      const safeHours = `"${p.open_hours.replace(/"/g, '""')}"`;
      return `${p.id},${safeName},${areaLabel},${p.category},${p.avg_cost},${p.rating},${safeHours},${statusLabel}`;
    });
    const csvContent = '\uFEFF' + [header, ...rows].join('\n');

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `vivu_places_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Xuất Excel / CSV thành công', `Đã tải xuống ${filteredPlaces.length} địa điểm.`);
        return;
      } catch {
        // fallback below
      }
    }

    try {
      await Share.share({
        title: 'Báo cáo Địa điểm Vivu AI (CSV)',
        message: csvContent,
      });
    } catch {
      Alert.alert('Thông báo', 'Không thể xuất file trên thiết bị này.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {isLoading && <Text style={{ color: theme.text, padding: 8 }}>Đang tải dữ liệu...</Text>}
      {error && <TouchableOpacity onPress={() => { void refreshPlaces(); }}><Text style={{ color: theme.text, padding: 8 }}>{error} Nhấn để thử lại.</Text></TouchableOpacity>}
      {!isLoading && !error && activeTab === 'places' && filteredPlaces.length === 0 && <Text style={{ color: theme.text }}>Không có địa điểm phù hợp.</Text>}
      {!isLoading && !error && activeTab === 'users' && users.length === 0 && <Text style={{ color: theme.text }}>Chưa có tài khoản.</Text>}
      {activeTab === 'reviews' || activeTab === 'overview' ? <Text style={{ color: theme.textMuted, padding: 8 }}>Các mục cộng đồng/thống kê còn dùng fallback demo của nhóm khi API chưa có dữ liệu.</Text> : null}

      {/* HEADER QUẢN TRỊ */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <View style={[styles.adminPill, { backgroundColor: theme.roseLight }]}>
              <Ionicons name="shield-checkmark" size={12} color={theme.rose} />
              <Text style={[styles.adminPillText, { color: theme.rose }]}>
                TOÀN QUYỀN QUẢN TRỊ HỆ THỐNG
              </Text>
            </View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Vivu AI Admin Portal
            </Text>
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>
              Đang đăng nhập: {user?.email}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {activeTab === 'places' && (
              <TouchableOpacity
                style={[styles.addBtn, { backgroundColor: theme.primary }]}
                onPress={openAddModal}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addBtnText}>Thêm điểm</Text>
              </TouchableOpacity>
            )}

            {onPreviewUserApp && (
              <TouchableOpacity
                style={[
                  styles.previewBtn,
                  { backgroundColor: theme.blueLight, borderColor: theme.primaryLight },
                ]}
                onPress={onPreviewUserApp}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={15} color={theme.primaryLight} />
                <Text style={[styles.previewBtnText, { color: theme.primaryLight }]}>
                  App Khách
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.logoutAdminBtn,
                { backgroundColor: theme.roseLight, borderColor: theme.rose },
              ]}
              onPress={() => {
                Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi quyền Admin?', [
                  { text: 'Hủy', style: 'cancel' },
                  { text: 'Đăng xuất', style: 'destructive', onPress: onLogout },
                ]);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={15} color={theme.rose} />
              <Text style={[styles.logoutAdminBtnText, { color: theme.rose }]}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ADMIN SUB-TABS */}
        <View style={[styles.subTabsWrap, { backgroundColor: theme.bg }]}>
          {[
            { key: 'places' as const, label: 'Địa điểm', icon: 'location' },
            { key: 'users' as const, label: 'Người dùng', icon: 'people' },
            {
              key: 'reviews' as const,
              label: totalModeration ? `Duyệt (${totalModeration})` : 'Duyệt',
              icon: 'shield-checkmark',
            },
            { key: 'overview' as const, label: 'Thống kê', icon: 'stats-chart' },
          ].map((t) => {
            const isActive = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.subTabBtn,
                  isActive && { backgroundColor: theme.primary },
                ]}
                onPress={() => setActiveTab(t.key)}
              >
                <Ionicons
                  name={t.icon as any}
                  size={14}
                  color={isActive ? '#fff' : theme.textMuted}
                />
                <Text
                  style={[
                    styles.subTabBtnText,
                    { color: isActive ? '#fff' : theme.textMuted },
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ========================================================= */}
        {/* TAB 1: QUẢN LÝ ĐỊA ĐIỂM (PLACES CRUD & TOGGLE AI) */}
        {/* ========================================================= */}
        {activeTab === 'places' && (
          <View>
            {/* Quick metrics */}
            <View style={styles.metricsRow}>
              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.metricLabel, { color: theme.textSub }]}>Tổng số điểm</Text>
                <Text style={[styles.metricVal, { color: theme.text }]}>{places.length}</Text>
                <Text style={[styles.metricSub, { color: theme.primaryLight }]}>
                  {daNangCount} ĐN • {hoiAnCount} HA
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.metricLabel, { color: theme.textSub }]}>AI được chọn</Text>
                <Text style={[styles.metricVal, { color: theme.emerald }]}>
                  {activePlacesCount}
                </Text>
                <Text style={[styles.metricSub, { color: theme.textMuted }]}>
                  Đang bật prompt
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.metricLabel, { color: theme.textSub }]}>Tạm ẩn khỏi AI</Text>
                <Text style={[styles.metricVal, { color: theme.rose }]}>
                  {places.length - activePlacesCount}
                </Text>
                <Text style={[styles.metricSub, { color: theme.textMuted }]}>
                  Quán tạm đóng
                </Text>
              </View>
            </View>

            {/* Filter & Search Bar */}
            <View
              style={[
                styles.filterCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  styles.searchInputWrap,
                  { backgroundColor: theme.bg, borderColor: theme.border },
                ]}
              >
                <Ionicons name="search" size={16} color={theme.textSub} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder="Lọc theo tên hoặc tags..."
                  placeholderTextColor={theme.textSub}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View style={styles.filterPillsRow}>
                {/* Area filter */}
                <View style={styles.pillsGroup}>
                  {(['all', 'danang', 'hoian'] as const).map((a) => (
                    <TouchableOpacity
                      key={a}
                      style={[
                        styles.filterPill,
                        { backgroundColor: theme.bg, borderColor: theme.border },
                        filterArea === a && {
                          backgroundColor: theme.primary,
                          borderColor: theme.primary,
                        },
                      ]}
                      onPress={() => setFilterArea(a)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          { color: filterArea === a ? '#fff' : theme.textMuted },
                        ]}
                      >
                        {a === 'all' ? 'Tất cả vùng' : a === 'danang' ? 'Đà Nẵng' : 'Hội An'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Status filter */}
                <View style={styles.pillsGroup}>
                  {(['all', 'active', 'inactive'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.filterPill,
                        { backgroundColor: theme.bg, borderColor: theme.border },
                        filterStatus === s && {
                          backgroundColor: theme.accent,
                          borderColor: theme.accent,
                        },
                      ]}
                      onPress={() => setFilterStatus(s)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          { color: filterStatus === s ? '#fff' : theme.textMuted },
                        ]}
                      >
                        {s === 'all' ? 'Tất cả TT' : s === 'active' ? 'Đang bật' : 'Tạm ẩn'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sắp xếp nhanh */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 6, marginTop: 8 }}
              >
                {(
                  [
                    { key: 'default', label: 'Mặc định' },
                    { key: 'rating_desc', label: '★ Đánh giá cao' },
                    { key: 'cost_asc', label: 'Giá tăng dần' },
                    { key: 'cost_desc', label: 'Giá giảm dần' },
                    { key: 'name_asc', label: 'Tên A → Z' },
                  ] as const
                ).map((opt) => {
                  const active = sortBy === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.filterPill,
                        { backgroundColor: theme.bg, borderColor: theme.border },
                        active && {
                          backgroundColor: theme.secondary,
                          borderColor: theme.secondary,
                        },
                      ]}
                      onPress={() => setSortBy(opt.key)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          { color: active ? '#fff' : theme.textMuted },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Thanh tiện ích quản trị: Xuất CSV & Khôi phục mẫu */}
              <View style={styles.adminUtilsRow}>
                <TouchableOpacity
                  style={[
                    styles.adminUtilBtn,
                    { backgroundColor: theme.emeraldLight, borderColor: theme.emerald },
                  ]}
                  onPress={handleExportCSV}
                  activeOpacity={0.8}
                >
                  <Ionicons name="download-outline" size={14} color={theme.emerald} />
                  <Text style={[styles.adminUtilBtnText, { color: theme.emerald }]}>
                    Xuất Excel / CSV ({filteredPlaces.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.adminUtilBtn,
                    { backgroundColor: theme.amberLight, borderColor: theme.amber },
                  ]}
                  disabled={resetting}
                  onPress={handleResetDemoData}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh-outline" size={14} color={theme.secondary} />
                  <Text style={[styles.adminUtilBtnText, { color: theme.secondary }]}>
                    {resetting ? 'Đang khôi phục...' : 'Khôi phục mẫu gốc'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Places List */}
            <View style={styles.placesList}>
              {filteredPlaces.map((place) => (
                <View
                  key={place.id}
                  style={[
                    styles.adminPlaceCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <Image source={{ uri: place.image }} style={styles.placeThumb} />

                  <View style={styles.placeMainInfo}>
                    <View style={styles.placeHeaderLine}>
                      <Text style={[styles.placeIdTag, { color: theme.primaryLight }]}>
                        #{place.id}
                      </Text>
                      <View
                        style={[
                          styles.areaBadgeSmall,
                          {
                            backgroundColor:
                              place.area === 'danang' ? theme.blueLight : theme.amberLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.areaBadgeSmallText,
                            {
                              color:
                                place.area === 'danang'
                                  ? theme.primaryLight
                                  : theme.secondary,
                            },
                          ]}
                        >
                          {place.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.placeTitle, { color: theme.text }]} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <Text style={[styles.placeSub, { color: theme.textMuted }]} numberOfLines={1}>
                      {place.type} • {formatCurrency(place.avg_cost)}
                    </Text>
                    <Text style={[styles.placeCoords, { color: theme.textSub }]}>
                      Tọa độ: {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                    </Text>

                    {/* AI Status Toggle & Actions */}
                    <View style={[styles.placeActionRow, { borderTopColor: theme.border }]}>
                      <View style={styles.aiToggleWrap}>
                        <Switch
                          value={place.is_active}
                          onValueChange={() => { void togglePlaceActive(place.id).catch(showError); }}
                          trackColor={{ false: theme.border, true: theme.emerald }}
                          thumbColor="#fff"
                        />
                        <Text
                          style={[
                            styles.aiToggleText,
                            {
                              color: place.is_active ? theme.emerald : theme.textSub,
                            },
                          ]}
                        >
                          {place.is_active ? 'Cho phép AI chọn' : 'Ẩn khỏi AI'}
                        </Text>
                      </View>

                      <View style={styles.btnActionGroup}>
                        <TouchableOpacity
                          style={[styles.smallActionBtn, { backgroundColor: theme.blueLight }]}
                          onPress={() => openEditModal(place)}
                        >
                          <Ionicons name="pencil" size={13} color={theme.primaryLight} />
                          <Text style={[styles.smallActionText, { color: theme.primaryLight }]}>
                            Sửa
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.smallActionBtn, { backgroundColor: theme.roseLight }]}
                          onPress={() => handleDeletePlace(place)}
                        >
                          <Ionicons name="trash-outline" size={13} color={theme.rose} />
                          <Text style={[styles.smallActionText, { color: theme.rose }]}>
                            Xóa
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 2: QUẢN LÝ NGƯỜI DÙNG (USERS LOCK / UNLOCK) */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <View>
            <View style={styles.metricsRow}>
              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.metricLabel, { color: theme.textSub }]}>Tổng tài khoản</Text>
                <Text style={[styles.metricVal, { color: theme.text }]}>{users.length}</Text>
                <Text style={[styles.metricSub, { color: theme.textMuted }]}>
                  1 Admin • {users.length - 1} Khách
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.metricLabel, { color: theme.textSub }]}>Đang hoạt động</Text>
                <Text style={[styles.metricVal, { color: theme.emerald }]}>
                  {users.length - lockedUsersCount}
                </Text>
                <Text style={[styles.metricSub, { color: theme.emerald }]}>Bình thường</Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.metricLabel, { color: theme.textSub }]}>Bị khóa</Text>
                <Text style={[styles.metricVal, { color: theme.rose }]}>
                  {lockedUsersCount}
                </Text>
                <Text style={[styles.metricSub, { color: theme.rose }]}>Đã hạn chế</Text>
              </View>
            </View>

            <View style={styles.usersList}>
              {users.map((u) => (
                <View
                  key={u.id}
                  style={[
                    styles.userCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
                    <Ionicons
                      name={u.role === 'admin' ? 'shield' : 'person'}
                      size={18}
                      color="#fff"
                    />
                  </View>

                  <View style={styles.userInfo}>
                    <View style={styles.userNameLine}>
                      <Text style={[styles.userNameText, { color: theme.text }]}>
                        {u.name}
                      </Text>
                      <View
                        style={[
                          styles.roleBadge,
                          {
                            backgroundColor:
                              u.role === 'admin' ? theme.roseLight : theme.blueLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleBadgeText,
                            { color: u.role === 'admin' ? theme.rose : theme.primaryLight },
                          ]}
                        >
                          {u.role.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.userEmailText, { color: theme.textMuted }]}>
                      {u.email}
                    </Text>
                    <Text style={[styles.userCreatedText, { color: theme.textSub }]}>
                      Ngày tạo: {u.created_at}
                    </Text>
                  </View>

                  {u.role !== 'admin' && (
                    <TouchableOpacity
                      style={[
                        styles.lockBtn,
                        {
                          backgroundColor: u.is_locked ? theme.emeraldLight : theme.roseLight,
                          borderColor: u.is_locked ? theme.emerald : theme.rose,
                        },
                      ]}
                      onPress={() => { void toggleUserLock(u.id).catch(showError); }}
                    >
                      <Ionicons
                        name={u.is_locked ? 'lock-open-outline' : 'lock-closed-outline'}
                        size={14}
                        color={u.is_locked ? theme.emerald : theme.rose}
                      />
                      <Text
                        style={[
                          styles.lockBtnText,
                          { color: u.is_locked ? theme.emerald : theme.rose },
                        ]}
                      >
                        {u.is_locked ? 'Mở khóa' : 'Khóa'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TRUNG TÂM KIỂM DUYỆT CỘNG ĐỒNG (MODERATION) */}
        {/* ========================================================= */}
        {activeTab === 'reviews' && (
          <View style={{ gap: 10 }}>
            {/* SUB-TABS KIỂM DUYỆT */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: theme.surface,
                borderRadius: 12,
                padding: 4,
                gap: 6,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              {[
                {
                  id: 'reviews' as const,
                  label: `Đánh giá (${pendingReviews.length})`,
                  icon: 'star-outline',
                },
                {
                  id: 'suggestions' as const,
                  label: `Đề xuất mới (${pendingSuggestions.length})`,
                  icon: 'bulb-outline',
                },
                {
                  id: 'reports' as const,
                  label: `Báo đóng cửa (${openReports.length})`,
                  icon: 'alert-circle-outline',
                },
              ].map((sub) => {
                const isSelected = moderationTab === sub.id;
                return (
                  <TouchableOpacity
                    key={sub.id}
                    onPress={() => setModerationTab(sub.id)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 8,
                      paddingHorizontal: 4,
                      borderRadius: 8,
                      backgroundColor: isSelected ? theme.primary : 'transparent',
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name={sub.icon as any}
                      size={13}
                      color={isSelected ? '#fff' : theme.textMuted}
                    />
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: isSelected ? '#fff' : theme.textMuted,
                      }}
                      numberOfLines={1}
                    >
                      {sub.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* SUB-TAB 1: ĐÁNH GIÁ NGƯỜI DÙNG */}
            {moderationTab === 'reviews' && (
              <>
                <View
                  style={[
                    styles.promptInspectorCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.promptTitle, { color: theme.text }]}>
                    Chờ duyệt: {pendingReviews.length} • Tổng đánh giá: {reviews.length}
                  </Text>
                  <Text style={[styles.promptDesc, { color: theme.textMuted, marginBottom: 0 }]}>
                    Chỉ đánh giá đã duyệt mới hiển thị cho du khách. Xóa các nội dung spam hoặc vi phạm.
                  </Text>
                </View>

                {reviews.length === 0 && (
                  <Text style={{ textAlign: 'center', color: theme.textMuted, padding: 24 }}>
                    Chưa có đánh giá nào.
                  </Text>
                )}

                {reviews.map((r) => {
                  const place = places.find((p) => p.id === r.place_id);
                  const statusColor =
                    r.status === 'approved'
                      ? theme.emerald
                      : r.status === 'pending'
                      ? theme.amber
                      : theme.rose;
                  return (
                    <View
                      key={r.id}
                      style={[
                        styles.userCard,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: 6,
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={[styles.userNameText, { color: theme.text }]}
                          numberOfLines={1}
                        >
                          {r.user_name} • {'★'.repeat(r.rating)}
                        </Text>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: statusColor }}>
                          {r.status === 'approved'
                            ? 'ĐÃ DUYỆT'
                            : r.status === 'pending'
                            ? 'CHỜ DUYỆT'
                            : 'TỪ CHỐI'}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 10, color: theme.textSub }}>
                        {place?.name ?? r.place_id} • {r.created_at}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.textMuted, lineHeight: 18 }}>
                        {r.content}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        {r.status !== 'approved' && (
                          <TouchableOpacity
                            style={[styles.smallActionBtn, { backgroundColor: theme.emeraldLight }]}
                            onPress={() => setReviewStatus(r.id, 'approved')}
                          >
                            <Ionicons name="checkmark" size={13} color={theme.emerald} />
                            <Text style={[styles.smallActionText, { color: theme.emerald }]}>
                              Duyệt
                            </Text>
                          </TouchableOpacity>
                        )}
                        {r.status !== 'rejected' && (
                          <TouchableOpacity
                            style={[styles.smallActionBtn, { backgroundColor: theme.amberLight }]}
                            onPress={() => setReviewStatus(r.id, 'rejected')}
                          >
                            <Ionicons name="close" size={13} color={theme.amber} />
                            <Text style={[styles.smallActionText, { color: theme.amber }]}>
                              Từ chối
                            </Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.smallActionBtn, { backgroundColor: theme.roseLight }]}
                          onPress={() =>
                            Alert.alert('Xóa đánh giá', 'Xóa vĩnh viễn đánh giá này?', [
                              { text: 'Hủy', style: 'cancel' },
                              {
                                text: 'Xóa',
                                style: 'destructive',
                                onPress: () => deleteReview(r.id),
                              },
                            ])
                          }
                        >
                          <Ionicons name="trash-outline" size={13} color={theme.rose} />
                          <Text style={[styles.smallActionText, { color: theme.rose }]}>Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {/* SUB-TAB 2: ĐỀ XUẤT ĐỊA ĐIỂM TỪ NGƯỜI DÙNG */}
            {moderationTab === 'suggestions' && (
              <>
                <View
                  style={[
                    styles.promptInspectorCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.promptTitle, { color: theme.text }]}>
                    Chờ duyệt: {pendingSuggestions.length} • Tổng đề xuất: {suggestions.length}
                  </Text>
                  <Text style={[styles.promptDesc, { color: theme.textMuted, marginBottom: 0 }]}>
                    Khi duyệt, địa điểm sẽ được tự động thêm vào danh sách ở trạng thái Tạm ẩn để Admin kiểm tra và bổ sung thông tin trước khi mở cho AI lập lịch.
                  </Text>
                </View>

                {suggestions.length === 0 && (
                  <Text style={{ textAlign: 'center', color: theme.textMuted, padding: 24 }}>
                    Chưa có đề xuất địa điểm nào từ người dùng.
                  </Text>
                )}

                {suggestions.map((s) => {
                  const statusColor =
                    s.status === 'approved'
                      ? theme.emerald
                      : s.status === 'pending'
                      ? theme.amber
                      : theme.rose;
                  return (
                    <View
                      key={s.id}
                      style={[
                        styles.userCard,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: 6,
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                          <Text
                            style={[styles.userNameText, { color: theme.text, fontSize: 13 }]}
                            numberOfLines={1}
                          >
                            {s.name}
                          </Text>
                          <View
                            style={{
                              backgroundColor: s.area === 'danang' ? theme.blueLight : theme.amberLight,
                              paddingHorizontal: 6,
                              paddingVertical: 1,
                              borderRadius: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 9,
                                fontWeight: '700',
                                color: s.area === 'danang' ? theme.primaryLight : theme.secondary,
                              }}
                            >
                              {s.area === 'danang' ? 'Đà Nẵng' : 'Hội An'}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: statusColor }}>
                          {s.status === 'approved'
                            ? 'ĐÃ DUYỆT'
                            : s.status === 'pending'
                            ? 'CHỜ DUYỆT'
                            : 'TỪ CHỐI'}
                        </Text>
                      </View>

                      <Text style={{ fontSize: 10, color: theme.textSub }}>
                        Người gửi: <Text style={{ color: theme.text, fontWeight: '600' }}>{s.user_name}</Text> • Ngày gửi: {s.created_at}
                      </Text>

                      {s.lat && s.lng && (
                        <Text style={{ fontSize: 10, color: theme.primaryLight }}>
                          📍 Tọa độ GPS: {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                        </Text>
                      )}

                      <View
                        style={{
                          backgroundColor: theme.bg,
                          padding: 8,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: theme.border,
                        }}
                      >
                        <Text style={{ fontSize: 10, color: theme.textSub, marginBottom: 2, fontWeight: '600' }}>
                          Lý do đề xuất / Điểm đặc sắc:
                        </Text>
                        <Text style={{ fontSize: 11, color: theme.text, lineHeight: 16 }}>
                          {s.note || 'Không có ghi chú thêm.'}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        {s.status !== 'approved' && (
                          <TouchableOpacity
                            style={[styles.smallActionBtn, { backgroundColor: theme.emeraldLight }]}
                            onPress={() => {
                              approveSuggestion(s.id);
                              Alert.alert(
                                'Thành công',
                                `Đã duyệt "${s.name}" và thêm vào danh sách địa điểm ở trạng thái Tạm ẩn!`
                              );
                            }}
                          >
                            <Ionicons name="checkmark-done" size={13} color={theme.emerald} />
                            <Text style={[styles.smallActionText, { color: theme.emerald }]}>
                              Duyệt vào DS
                            </Text>
                          </TouchableOpacity>
                        )}
                        {s.status !== 'rejected' && (
                          <TouchableOpacity
                            style={[styles.smallActionBtn, { backgroundColor: theme.amberLight }]}
                            onPress={() => rejectSuggestion(s.id)}
                          >
                            <Ionicons name="close" size={13} color={theme.amber} />
                            <Text style={[styles.smallActionText, { color: theme.amber }]}>
                              Từ chối
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {/* SUB-TAB 3: BÁO CÁO QUÁN ĐÓNG CỬA */}
            {moderationTab === 'reports' && (
              <>
                <View
                  style={[
                    styles.promptInspectorCard,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.promptTitle, { color: theme.text }]}>
                    Chờ xử lý: {openReports.length} • Tổng báo cáo: {reports.length}
                  </Text>
                  <Text style={[styles.promptDesc, { color: theme.textMuted, marginBottom: 0 }]}>
                    Báo cáo từ du khách về quán đã ngừng hoạt động hoặc đổi địa điểm. Khi xác nhận, quán sẽ tự động bị tắt khỏi danh sách AI chọn.
                  </Text>
                </View>

                {reports.length === 0 && (
                  <Text style={{ textAlign: 'center', color: theme.textMuted, padding: 24 }}>
                    Không có báo cáo nào.
                  </Text>
                )}

                {reports.map((rp) => {
                  const place = places.find((p) => p.id === rp.place_id);
                  const isClosed = rp.status === 'closed_confirmed';
                  const isDismissed = rp.status === 'dismissed';
                  const statusColor = isClosed
                    ? theme.rose
                    : isDismissed
                    ? theme.textSub
                    : theme.amber;

                  return (
                    <View
                      key={rp.id}
                      style={[
                        styles.userCard,
                        {
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          gap: 6,
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={[styles.userNameText, { color: theme.text, fontSize: 13 }]}
                          numberOfLines={1}
                        >
                          {place?.name ?? rp.place_id}
                        </Text>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: statusColor }}>
                          {isClosed
                            ? 'ĐÃ ĐÓNG CỬA (ẨN AI)'
                            : isDismissed
                            ? 'ĐÃ BÁC BỎ'
                            : 'CHỜ XÁC NHẬN'}
                        </Text>
                      </View>

                      <Text style={{ fontSize: 10, color: theme.textSub }}>
                        Người báo: <Text style={{ color: theme.text, fontWeight: '600' }}>{rp.user_name}</Text> • Ngày gửi: {rp.created_at}
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          backgroundColor: theme.bg,
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Ionicons
                          name={place?.is_active ? 'checkmark-circle' : 'close-circle'}
                          size={14}
                          color={place?.is_active ? theme.emerald : theme.rose}
                        />
                        <Text style={{ fontSize: 10, color: theme.textMuted }}>
                          Trạng thái hiện tại: {place?.is_active ? 'Đang bật cho AI chọn' : 'Đang tạm ẩn'}
                        </Text>
                      </View>

                      {rp.status === 'open' && (
                        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                          <TouchableOpacity
                            style={[styles.smallActionBtn, { backgroundColor: theme.roseLight }]}
                            onPress={() => {
                              resolveReport(rp.id, true);
                              Alert.alert(
                                'Xác nhận đóng cửa',
                                `Đã tắt "${place?.name}" khỏi danh sách AI lập lịch!`
                              );
                            }}
                          >
                            <Ionicons name="trash-bin-outline" size={13} color={theme.rose} />
                            <Text style={[styles.smallActionText, { color: theme.rose }]}>
                              Xác nhận đóng (Ẩn khỏi AI)
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.smallActionBtn, { backgroundColor: theme.blueLight }]}
                            onPress={() => {
                              resolveReport(rp.id, false);
                              Alert.alert('Bác bỏ báo cáo', 'Quán vẫn hoạt động bình thường.');
                            }}
                          >
                            <Ionicons name="checkmark-circle-outline" size={13} color={theme.primaryLight} />
                            <Text style={[styles.smallActionText, { color: theme.primaryLight }]}>
                              Bác bỏ (Quán vẫn mở)
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}

        {activeTab === 'overview' && (
          <View>
            <View style={styles.metricsRow}>
              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.metricLabel, { color: theme.textSub }]}>Lượt gọi AI</Text>
                <Text style={[styles.metricVal, { color: theme.accent }]}>
                  {aiStats.total_calls.toLocaleString()}
                </Text>
                <Text style={[styles.metricSub, { color: theme.emerald }]}>
                  {aiStats.success_rate}% Thành công
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.metricLabel, { color: theme.textSub }]}>Thời gian TB</Text>
                <Text style={[styles.metricVal, { color: theme.text }]}>
                  {aiStats.avg_time_sec}s
                </Text>
                <Text style={[styles.metricSub, { color: theme.emerald }]}>Phản hồi nhanh</Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.metricLabel, { color: theme.textSub }]}>Tokens Ước tính</Text>
                <Text style={[styles.metricVal, { color: theme.secondary }]}>
                  ~142k
                </Text>
                <Text style={[styles.metricSub, { color: theme.textMuted }]}>Gemini Flash</Text>
              </View>
            </View>

            {/* BIỂU ĐỒ LỊCH TRÌNH THEO NGÀY */}
            <View style={[styles.promptInspectorCard, { backgroundColor: theme.surface, borderColor: theme.border, marginBottom: 12 }]}>
              <Text style={[styles.promptTitle, { color: theme.text, marginBottom: 10 }]}>
                📈 Lượt tạo lịch trình trong tuần
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 8 }}>
                {WEEK.map((w) => (
                  <View key={w.d} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <Text style={{ fontSize: 9, color: theme.textMuted, marginBottom: 2 }}>{w.v}</Text>
                    <View
                      style={{
                        width: '70%',
                        height: Math.max(6, (w.v / weekMax) * 80),
                        backgroundColor: w.v === weekMax ? theme.secondary : theme.primary,
                        borderRadius: 5,
                      }}
                    />
                    <Text style={{ fontSize: 9, color: theme.textSub, marginTop: 4 }}>{w.d}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ĐỊA ĐIỂM HOT */}
            <View style={[styles.promptInspectorCard, { backgroundColor: theme.surface, borderColor: theme.border, marginBottom: 12 }]}>
              <Text style={[styles.promptTitle, { color: theme.text, marginBottom: 10 }]}>
                🔥 Địa điểm được quan tâm nhất
              </Text>
              {hotPlaces.map((p, i) => (
                <View key={p.id} style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                    <Text style={{ fontSize: 11, color: theme.text, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                      {i + 1}. {p.name}
                    </Text>
                    <Text style={{ fontSize: 10, color: theme.textMuted }}>{p.review_count}</Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.border }}>
                    <View
                      style={{
                        height: 6,
                        borderRadius: 3,
                        width: `${(p.review_count / hotMax) * 100}%`,
                        backgroundColor: p.area === 'danang' ? theme.primary : theme.secondary,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Prompt Template Inspector */}
            <View
              style={[
                styles.promptInspectorCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.promptHeader}>
                <Ionicons name="code-slash" size={16} color={theme.accent} />
                <Text style={[styles.promptTitle, { color: theme.text }]}>
                  Cấu trúc Prompt Mẫu (Backend Injection)
                </Text>
              </View>
              <Text style={[styles.promptDesc, { color: theme.textMuted }]}>
                Backend chỉ nhúng danh sách {activePlacesCount} địa điểm có `is_active: true` vào
                prompt để chống AI bịa điểm.
              </Text>

              <View style={[styles.codeBox, { backgroundColor: theme.bg }]}>
                <Text style={[styles.codeText, { color: theme.primaryLight }]}>
                  {`Bạn là hướng dẫn viên du lịch Đà Nẵng - Hội An.
Chỉ được chọn địa điểm trong danh sách dưới đây (dùng đúng id).
Yêu cầu: {{days}} ngày, {{people}} người, sở thích: {{interests}}, ngân sách: {{budget}}đ.
Mỗi ngày 4-5 điểm, sắp xếp theo vị trí gần nhau, có giờ cụ thể.
Chỉ trả về JSON theo mẫu:
{"days":[{"day":1,"items":[{"place_id":"p12","time":"07:30","note":"...","est_cost":50000}]}]}

Danh sách địa điểm active: [
  ${places
    .filter((p) => p.is_active)
    .slice(0, 3)
    .map((p) => `{id:"${p.id}", name:"${p.name}", area:"${p.area}"}`)
    .join(',\n  ')}
  ... và ${Math.max(0, activePlacesCount - 3)} địa điểm khác
]`}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ========================================================= */}
      {/* MODAL THÊM / SỬA ĐỊA ĐIỂM */}
      {/* ========================================================= */}
      <Modal visible={isPlaceModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalSheetHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalSheetTitle, { color: theme.text }]}>
                {editingPlaceId ? 'Chỉnh Sửa Địa Điểm' : 'Thêm Địa Điểm Mới'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsPlaceModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalFormContent}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textMuted }]}>
                  Tên địa điểm (*)
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text },
                  ]}
                  placeholder="VD: Cơm Gà Bà Buội"
                  placeholderTextColor={theme.textSub}
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              {/* ẢNH ĐỊA ĐIỂM: XEM TRƯỚC + CHỌN FILE TỪ MÁY + LINK URL + ẢNH MẪU */}
              <View style={styles.formGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.formLabel, { color: theme.textMuted }]}>
                    Ảnh địa điểm (URL hoặc tải từ máy)
                  </Text>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: theme.blueLight,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                    onPress={handlePickLocalImage}
                  >
                    <Ionicons name="cloud-upload-outline" size={12} color={theme.primaryLight} />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primaryLight }}>
                      Chọn ảnh từ máy
                    </Text>
                  </TouchableOpacity>
                </View>

                {formImage.trim().length > 0 && (
                  <View
                    style={{
                      height: 130,
                      borderRadius: 12,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: theme.border,
                      backgroundColor: theme.bg,
                      marginTop: 4,
                    }}
                  >
                    <Image
                      source={{ uri: formImage.trim() }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  </View>
                )}

                <TextInput
                  style={[
                    styles.formInput,
                    { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text, marginTop: 4 },
                  ]}
                  placeholder="Dán link ảnh https://..."
                  placeholderTextColor={theme.textSub}
                  value={formImage}
                  onChangeText={setFormImage}
                  autoCapitalize="none"
                />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 6, marginTop: 4 }}
                >
                  {PRESET_IMAGES.map((preset) => (
                    <TouchableOpacity
                      key={preset.label}
                      style={{
                        paddingHorizontal: 9,
                        paddingVertical: 5,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: formImage === preset.url ? theme.primary : theme.border,
                        backgroundColor: formImage === preset.url ? theme.blueLight : theme.bg,
                      }}
                      onPress={() => setFormImage(preset.url)}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: formImage === preset.url ? theme.primaryLight : theme.textMuted,
                        }}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={[styles.formLabel, { color: theme.textMuted }]}>Khu vực</Text>
                  <View style={styles.selectorRow}>
                    <TouchableOpacity
                      style={[
                        styles.selectorBtn,
                        { backgroundColor: theme.bg, borderColor: theme.border },
                        formArea === 'danang' && { backgroundColor: theme.primary },
                      ]}
                      onPress={() => setFormArea('danang')}
                    >
                      <Text
                        style={[
                          styles.selectorBtnText,
                          { color: formArea === 'danang' ? '#fff' : theme.textMuted },
                        ]}
                      >
                        Đà Nẵng
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.selectorBtn,
                        { backgroundColor: theme.bg, borderColor: theme.border },
                        formArea === 'hoian' && { backgroundColor: theme.secondary },
                      ]}
                      onPress={() => setFormArea('hoian')}
                    >
                      <Text
                        style={[
                          styles.selectorBtnText,
                          { color: formArea === 'hoian' ? '#fff' : theme.textMuted },
                        ]}
                      >
                        Hội An
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formCol}>
                  <Text style={[styles.formLabel, { color: theme.textMuted }]}>Danh mục</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text },
                    ]}
                    placeholder="food, beach, checkin, culture, cafe"
                    placeholderTextColor={theme.textSub}
                    value={formCategory}
                    onChangeText={(val) => setFormCategory(val as Category)}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={[styles.formLabel, { color: theme.textMuted }]}>Vĩ độ (Lat)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text },
                    ]}
                    value={formLat}
                    onChangeText={setFormLat}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={[styles.formLabel, { color: theme.textMuted }]}>Kinh độ (Lng)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text },
                    ]}
                    value={formLng}
                    onChangeText={setFormLng}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={[styles.formLabel, { color: theme.textMuted }]}>Giá TB (VNĐ)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text },
                    ]}
                    value={formCost}
                    onChangeText={setFormCost}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={[styles.formLabel, { color: theme.textMuted }]}>Giờ mở cửa</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text },
                    ]}
                    value={formHours}
                    onChangeText={setFormHours}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textMuted }]}>Mô tả</Text>
                <TextInput
                  style={[
                    styles.formInputMultiline,
                    { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text },
                  ]}
                  value={formDesc}
                  onChangeText={setFormDesc}
                  multiline
                  numberOfLines={3}
                  placeholder="Mô tả ngắn gọn về địa điểm..."
                  placeholderTextColor={theme.textSub}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textMuted }]}>Tags (phân cách bằng dấu phẩy)</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text },
                  ]}
                  value={formTags}
                  onChangeText={setFormTags}
                  placeholder="ẩm thực, đặc sản, sống ảo"
                  placeholderTextColor={theme.textSub}
                />
              </View>

              <TouchableOpacity
                style={[styles.savePlaceBtn, { backgroundColor: theme.primary }]}
                disabled={saving}
                    onPress={handleSavePlace}
                activeOpacity={0.85}
              >
                <Ionicons name="save-outline" size={18} color="#fff" />
                <Text style={styles.savePlaceBtnText}>Lưu Địa Điểm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  adminPillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerSub: { fontSize: 10, marginTop: 1 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  previewBtnText: { fontSize: 11, fontWeight: '700' },
  logoutAdminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  logoutAdminBtnText: { fontSize: 11, fontWeight: '700' },
  subTabsWrap: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  subTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 9,
    gap: 5,
  },
  subTabBtnText: { fontSize: 11, fontWeight: '700' },
  scrollContent: { padding: 14, paddingBottom: 30 },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricLabel: { fontSize: 9, fontWeight: '600', marginBottom: 2 },
  metricVal: { fontSize: 18, fontWeight: '800' },
  metricSub: { fontSize: 8, marginTop: 2, fontWeight: '600' },
  filterCard: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 36,
    gap: 6,
  },
  searchInput: { flex: 1, fontSize: 11 },
  filterPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  pillsGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  filterPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 9, fontWeight: '600' },
  placesList: { gap: 10 },
  adminPlaceCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    gap: 10,
  },
  placeThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
  },
  placeMainInfo: { flex: 1 },
  placeHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeIdTag: { fontSize: 10, fontWeight: '800', fontFamily: 'monospace' },
  areaBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  areaBadgeSmallText: { fontSize: 8, fontWeight: '700' },
  placeTitle: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  placeSub: { fontSize: 10, marginTop: 1 },
  placeCoords: { fontSize: 8, marginTop: 2, fontFamily: 'monospace' },
  placeActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  aiToggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiToggleText: { fontSize: 9, fontWeight: '700' },
  btnActionGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  smallActionText: { fontSize: 9, fontWeight: '700' },
  usersList: { gap: 8 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: { flex: 1 },
  userNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userNameText: { fontSize: 12, fontWeight: '700' },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  roleBadgeText: { fontSize: 8, fontWeight: '800' },
  userEmailText: { fontSize: 10, marginTop: 1 },
  userCreatedText: { fontSize: 8, marginTop: 2 },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  lockBtnText: { fontSize: 10, fontWeight: '700' },
  promptInspectorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  promptTitle: { fontSize: 12, fontWeight: '700' },
  promptDesc: { fontSize: 10, lineHeight: 14, marginBottom: 10 },
  codeBox: {
    padding: 10,
    borderRadius: 10,
  },
  codeText: {
    fontSize: 9,
    fontFamily: 'monospace',
    lineHeight: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalSheet: {
    width: '100%',
    maxWidth: 640,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalSheetTitle: { fontSize: 15, fontWeight: '800' },
  modalCloseBtn: { padding: 4 },
  modalFormContent: { padding: 16, gap: 10 },
  formGroup: { gap: 4 },
  formLabel: { fontSize: 10, fontWeight: '600' },
  formInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    fontSize: 11,
  },
  formInputMultiline: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: 70,
    fontSize: 11,
    textAlignVertical: 'top',
  },
  formRow: { flexDirection: 'row', gap: 10 },
  formCol: { flex: 1, gap: 4 },
  selectorRow: { flexDirection: 'row', gap: 6 },
  selectorBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectorBtnText: { fontSize: 10, fontWeight: '700' },
  savePlaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  savePlaceBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  adminUtilsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
  adminUtilBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  adminUtilBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
