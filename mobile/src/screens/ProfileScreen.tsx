import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, UserRole } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const ProfileScreen: React.FC = () => {
  const { isDark, theme, setDarkMode } = useTheme();
  const { user, role, openAuthModal, logout, setDemoRole } = useAuth();
  const [isVietnamese, setIsVietnamese] = useState(true);

  const roleLabels: Record<UserRole, { name: string; badge: string; color: string }> = {
    guest: { name: 'Khách Vãng Lai', badge: 'Dùng thử', color: theme.textMuted },
    user: { name: 'Du Khách Đã Đăng Nhập', badge: 'Thành viên', color: theme.primaryLight },
    admin: { name: 'Quản Trị Viên (Admin)', badge: 'Toàn quyền', color: theme.rose },
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Tài Khoản & Cài Đặt</Text>
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
              {user ? user.name : 'Khách vãng lai'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textSub }]}>
              {user ? user.email : 'Chưa đăng nhập • Chế độ xem thử'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: theme.blueLight }]}>
              <Text style={[styles.roleBadgeText, { color: roleLabels[role].color }]}>
                Vai trò: {roleLabels[role].name}
              </Text>
            </View>
          </View>
        </View>

        {/* AUTH ACTION BUTTONS (LOGIN / REGISTER / LOGOUT) */}
        {!user ? (
          <View style={styles.authButtonsRow}>
            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: theme.primary }]}
              onPress={() => openAuthModal('login')}
              activeOpacity={0.85}
            >
              <Ionicons name="log-in-outline" size={18} color="#fff" />
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
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
                Đăng ký
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
              Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi tài khoản hiện tại?', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng xuất', style: 'destructive', onPress: logout },
              ]);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color={theme.rose} />
            <Text style={[styles.logoutBtnText, { color: theme.rose }]}>Đăng xuất tài khoản</Text>
          </TouchableOpacity>
        )}

        {/* SETTINGS: DARK / LIGHT MODE & LANGUAGE */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Giao diện & Ngôn ngữ</Text>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={18}
                color={isDark ? theme.primaryLight : theme.amber}
              />
              <View>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Chế độ tối (Dark Mode)
                </Text>
                <Text style={[styles.settingSubLabel, { color: theme.textSub }]}>
                  {isDark ? 'Đang bật giao diện tối' : 'Đang bật giao diện sáng'}
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
                  Ngôn ngữ ({isVietnamese ? 'Tiếng Việt' : 'English'})
                </Text>
                <Text style={[styles.settingSubLabel, { color: theme.textSub }]}>
                  Đổi ngôn ngữ hiển thị
                </Text>
              </View>
            </View>
            <Switch
              value={isVietnamese}
              onValueChange={setIsVietnamese}
              trackColor={{ false: '#CBD5E1', true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* DEMO ROLE SWITCHER (FOR COURSE DEMO) */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Chuyển Đổi Quyền Nhanh (Demo Đồ Án)
          </Text>
          <Text style={[styles.sectionDesc, { color: theme.textSub }]}>
            Chuyển nhanh giữa 3 role (Khách, Người dùng, Admin) khi thuyết trình:
          </Text>
          <View style={styles.roleToggleRow}>
            {(['guest', 'user', 'admin'] as UserRole[]).map((r) => {
              const isSelected = role === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleBtn,
                    { backgroundColor: theme.bg, borderColor: theme.border },
                    isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setDemoRole(r)}
                >
                  <Text
                    style={[
                      styles.roleBtnText,
                      { color: isSelected ? '#fff' : theme.textMuted },
                    ]}
                  >
                    {r === 'guest' ? 'Khách' : r === 'user' ? 'Người Dùng' : 'Admin'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* PERMISSIONS PREVIEW */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quyền hạn hiện tại ({roleLabels[role].name}):
          </Text>
          <View style={styles.permList}>
            <View style={styles.permRow}>
              <Ionicons name="checkmark-circle" size={16} color={theme.emerald} />
              <Text style={[styles.permText, { color: theme.textMuted }]}>
                Xem danh sách địa điểm, bản đồ & GPS
              </Text>
            </View>
            <View style={styles.permRow}>
              <Ionicons name="checkmark-circle" size={16} color={theme.emerald} />
              <Text style={[styles.permText, { color: theme.textMuted }]}>
                Tạo lịch trình bằng Gemini AI ({role === 'guest' ? 'Giới hạn 1-2 lần' : 'Không giới hạn'})
              </Text>
            </View>
            <View style={styles.permRow}>
              <Ionicons
                name={role !== 'guest' ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={role !== 'guest' ? theme.emerald : theme.rose}
              />
              <Text style={[styles.permText, { color: theme.textMuted }]}>
                Lưu lịch trình, đánh giá & xuất PDF
              </Text>
            </View>
            <View style={styles.permRow}>
              <Ionicons
                name={role === 'admin' ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={role === 'admin' ? theme.emerald : theme.rose}
              />
              <Text style={[styles.permText, { color: theme.textMuted }]}>
                Trang Web Quản trị CRUD địa điểm & thống kê
              </Text>
            </View>
          </View>
        </View>

        {/* APP INFO */}
        <View style={styles.footerInfo}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Vivu AI Đà Nẵng - Hội An v1.0.0
          </Text>
          <Text style={[styles.footerSubText, { color: theme.textSub }]}>
            Đồ án môn học: Lập trình đa nền tảng
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
