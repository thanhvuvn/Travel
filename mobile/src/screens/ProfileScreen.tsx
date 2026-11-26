import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../context/AppDataContext';
import { useAuth, UserRole } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usePlaces } from '../context/PlacesContext';
import { useTheme } from '../context/ThemeContext';
import { SurvivalKitSection } from '../components/SurvivalKitSection';
import { Place } from '../types';
import { Alert } from '../utils/dialog';
import { formatCurrency } from '../utils/format';

interface ProfileScreenProps {
  onNavigateToAdmin?: () => void;
  onOpenPlace?: (place: Place) => void;
  onShowOnboarding?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToAdmin,
  onOpenPlace,
  onShowOnboarding,
}) => {
  const { isDark, theme, setDarkMode } = useTheme();
  const { isVietnamese, setLanguage, t } = useLanguage();
  const { user, role, openAuthModal, logout } = useAuth();
  const { places } = usePlaces();
  const { favorites, toggleFavorite, sim, setSim } = useAppData();

  const favoritePlaces = places.filter((p) => favorites.includes(p.id));

  const roleLabels: Record<UserRole, { name: string; badge: string; color: string }> = {
    guest: {
      name: isVietnamese ? 'Khách Vãng Lai' : 'Guest Visitor',
      badge: isVietnamese ? 'Dùng thử' : 'Trial',
      color: theme.textMuted,
    },
    user: {
      name: isVietnamese ? 'Du Khách Đã Đăng Nhập' : 'Signed-in Traveler',
      badge: isVietnamese ? 'Thành viên' : 'Member',
      color: theme.primaryLight,
    },
    admin: {
      name: isVietnamese ? 'Quản Trị Viên (Admin)' : 'Administrator',
      badge: isVietnamese ? 'Toàn quyền' : 'Full Access',
      color: theme.rose,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('profile_header')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={[styles.avatarWrap, { backgroundColor: theme.primary }]}>
            <Ionicons name={user ? 'person' : 'person-outline'} size={28} color="#fff" />
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user ? user.name : t('profile_guest')}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textSub }]}>
              {user ? user.email : t('profile_guest_sub')}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: theme.blueLight }]}>
              <Text style={[styles.roleBadgeText, { color: roleLabels[role].color }]}>
                {t('profile_role')} {roleLabels[role].name}
              </Text>
            </View>
          </View>
        </View>

        {/* ADMIN SHORTCUT BUTTON */}
        {role === 'admin' && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.rose,
              paddingVertical: 12,
              borderRadius: 14,
              marginTop: 10,
              gap: 8,
            }}
            onPress={onNavigateToAdmin}
            activeOpacity={0.85}
          >
            <Ionicons name="shield-checkmark" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>
              {t('profile_admin_btn')}
            </Text>
          </TouchableOpacity>
        )}

        {/* AUTH ACTION BUTTONS (LOGIN / REGISTER / LOGOUT) */}
        {!user ? (
          <View style={styles.authButtonsRow}>
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: theme.primary }]}
              onPress={() => openAuthModal('login')}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in-outline" size={18} color="#fff" />
              <Text style={styles.loginBtnText}>{t('profile_login')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.registerBtn,
                { backgroundColor: theme.surface, borderColor: theme.primary },
              ]}
              onPress={() => openAuthModal('register')}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add-outline" size={17} color={theme.primaryLight} />
              <Text style={[styles.registerBtnText, { color: theme.primaryLight }]}>
                {t('profile_register')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              { backgroundColor: theme.roseLight, borderColor: theme.rose },
            ]}
            onPress={() => {
              Alert.alert(
                isVietnamese ? 'Đăng xuất' : 'Sign Out',
                isVietnamese
                  ? 'Bạn muốn đăng xuất khỏi tài khoản hiện tại?'
                  : 'Are you sure you want to sign out?',
                [
                  { text: isVietnamese ? 'Hủy' : 'Cancel', style: 'cancel' },
                  {
                    text: isVietnamese ? 'Đăng xuất' : 'Sign Out',
                    style: 'destructive',
                    onPress: logout,
                  },
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={theme.rose} />
            <Text style={[styles.logoutBtnText, { color: theme.rose }]}>{t('profile_logout')}</Text>
          </TouchableOpacity>
        )}

        {/* SETTINGS: DARK / LIGHT MODE & LANGUAGE */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile_appearance')}</Text>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={18}
                color={isDark ? theme.primaryLight : theme.amber}
              />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t('profile_dark_mode')}
                </Text>
                <Text style={[styles.settingSubLabel, { color: theme.textSub }]}>
                  {isDark ? t('profile_dark_on') : t('profile_dark_off')}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={setDarkMode}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={18} color={theme.text} />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t('profile_language')} ({isVietnamese ? 'Tiếng Việt' : 'English'})
                </Text>
                <Text style={[styles.settingSubLabel, { color: theme.textSub }]}>
                  {t('profile_language_sub')}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: !isVietnamese ? theme.primary : theme.textSub }}>
                EN
              </Text>
              <Switch
                value={isVietnamese}
                onValueChange={(v) => setLanguage(v ? 'vi' : 'en')}
                trackColor={{ false: '#2563EB', true: theme.primary }}
                thumbColor="#FFFFFF"
              />
              <Text style={{ fontSize: 10, fontWeight: '800', color: isVietnamese ? theme.primary : theme.textSub }}>
                VI
              </Text>
            </View>
          </View>
        </View>

        {/* ĐỊA ĐIỂM YÊU THÍCH */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
              {t('profile_favorites')}
            </Text>
            {user && (
              <Text style={{ fontSize: 11, color: theme.textMuted }}>
                {favoritePlaces.length} {isVietnamese ? 'địa điểm' : 'places'}
              </Text>
            )}
          </View>

          {!user ? (
            <View style={{ alignItems: 'center', paddingVertical: 14, gap: 6 }}>
              <Ionicons name="heart-outline" size={32} color={theme.textSub} />
              <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', lineHeight: 18 }}>
                {isVietnamese
                  ? 'Đăng nhập để lưu và xem lại các địa điểm bạn yêu thích.'
                  : 'Sign in to save and revisit your favorite places.'}
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: theme.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12, marginTop: 4 }}
                onPress={() => openAuthModal('login')}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>
                  {t('profile_login')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : favoritePlaces.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 14, gap: 6 }}>
              <Ionicons name="heart-dislike-outline" size={32} color={theme.textSub} />
              <Text style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', lineHeight: 18 }}>
                {isVietnamese
                  ? 'Bạn chưa yêu thích địa điểm nào. Bấm biểu tượng ♡ ở thẻ địa điểm để lưu lại.'
                  : 'No favorite places yet. Tap ♡ on any place card to save it.'}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {favoritePlaces.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 12, backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border }}
                  activeOpacity={0.8}
                  onPress={() => onOpenPlace?.(p)}
                >
                  <Image source={{ uri: p.image }} style={{ width: 48, height: 48, borderRadius: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }} numberOfLines={1}>{p.name}</Text>
                    <Text style={{ fontSize: 10, color: theme.textSub, marginTop: 2 }}>
                      {p.area === 'danang' ? (isVietnamese ? 'Đà Nẵng' : 'Da Nang') : (isVietnamese ? 'Hội An' : 'Hoi An')} • {formatCurrency(p.avg_cost)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavorite(p.id)} hitSlop={8}>
                    <Ionicons name="heart" size={20} color={theme.rose} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* CẨM NANG BỎ TÚI & HOTLINE DU LỊCH */}
        <SurvivalKitSection />

        {/* MÔ PHỎNG TRẠNG THÁI (DEMO) */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile_demo_title')}</Text>
          <Text style={[styles.sectionDesc, { color: theme.textSub }]}>
            {t('profile_demo_sub')}
          </Text>
          {([
            { key: 'aiError', label: isVietnamese ? 'AI lập lịch bị lỗi' : 'Simulate AI planner error', icon: 'cloud-offline-outline' },
            { key: 'gpsDenied', label: isVietnamese ? 'Từ chối quyền GPS' : 'Simulate GPS denied', icon: 'location-outline' },
            { key: 'cameraDenied', label: isVietnamese ? 'Từ chối quyền Camera' : 'Simulate Camera denied', icon: 'videocam-off-outline' },
          ] as const).map((row) => (
            <View key={row.key} style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <View style={styles.settingInfo}>
                <Ionicons name={row.icon} size={18} color={theme.text} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>{row.label}</Text>
              </View>
              <Switch
                value={sim[row.key]}
                onValueChange={(v) => setSim({ [row.key]: v })}
                trackColor={{ false: '#CBD5E1', true: theme.rose }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, marginTop: 8, borderRadius: 10, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.bg }}
            onPress={onShowOnboarding}
          >
            <Ionicons name="play-circle-outline" size={16} color={theme.primaryLight} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: theme.primaryLight }}>
              {t('profile_replay_onboarding')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* PERMISSIONS PREVIEW */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
              {t('profile_perms_title')}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: theme.blueLight, marginTop: 0 }]}>
              <Text style={[styles.roleBadgeText, { color: roleLabels[role].color }]}>
                {roleLabels[role].name}
              </Text>
            </View>
          </View>
          <View style={styles.permList}>
            <View style={styles.permRow}>
              <Ionicons name="checkmark-circle" size={16} color={theme.emerald} />
              <Text style={[styles.permText, { color: theme.textMuted }]}>
                {isVietnamese
                  ? 'Xem danh sách địa điểm, bản đồ & GPS'
                  : 'Browse places, map & GPS nearby'}
              </Text>
            </View>
            <View style={styles.permRow}>
              <Ionicons name="checkmark-circle" size={16} color={theme.emerald} />
              <Text style={[styles.permText, { color: theme.textMuted }]}>
                {isVietnamese
                  ? `Tạo lịch trình bằng Gemini AI (${role === 'guest' ? 'Giới hạn 1-2 lần' : 'Không giới hạn'})`
                  : `Generate Gemini AI itineraries (${role === 'guest' ? 'Limit 2 trials' : 'Unlimited'})`}
              </Text>
            </View>
            <View style={styles.permRow}>
              <Ionicons
                name={role !== 'guest' ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={role !== 'guest' ? theme.emerald : theme.rose}
              />
              <Text style={[styles.permText, { color: theme.textMuted }]}>
                {isVietnamese
                  ? 'Lưu lịch trình, đánh giá & xuất PDF'
                  : 'Save itineraries, post reviews & export PDF'}
              </Text>
            </View>
            <View style={styles.permRow}>
              <Ionicons
                name={role === 'admin' ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={role === 'admin' ? theme.emerald : theme.rose}
              />
              <Text style={[styles.permText, { color: theme.textMuted }]}>
                {isVietnamese
                  ? 'Trang Web Quản trị CRUD địa điểm & thống kê'
                  : 'Admin Portal for CRUD places & analytics'}
              </Text>
            </View>
          </View>
        </View>

        {/* APP INFO */}
        <View style={styles.footerInfo}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            {isVietnamese ? 'Vivu AI Đà Nẵng - Hội An v1.0.0' : 'Vivu AI Da Nang - Hoi An v1.0.0'}
          </Text>
          <Text style={[styles.footerSubText, { color: theme.textSub }]}>
            {isVietnamese ? 'Đồ án môn học: Lập trình đa nền tảng' : 'Cross-Platform Programming Project'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  profileCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    gap: 14,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 11,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  authButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  loginBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  registerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  registerBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 10,
    marginBottom: 10,
    lineHeight: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingSubLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  permList: {
    gap: 8,
    marginTop: 6,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permText: {
    fontSize: 11,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 22,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
  },
  footerSubText: {
    fontSize: 9,
    marginTop: 2,
  },
});
