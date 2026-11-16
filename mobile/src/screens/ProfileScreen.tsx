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
import { colors } from '../theme/colors';

type UserRole = 'guest' | 'user' | 'admin';

export const ProfileScreen: React.FC = () => {
  const [role, setRole] = useState<UserRole>('user');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isVietnamese, setIsVietnamese] = useState(true);

  const roleLabels = {
    guest: { name: 'Khách Vãng Lai', badge: 'Dùng thử', color: colors.textMuted },
    user: { name: 'Du Khách Đã Đăng Nhập', badge: 'Thành viên', color: colors.primaryLight },
    admin: { name: 'Quản Trị Viên (Admin)', badge: 'Toàn quyền', color: colors.rose },
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài Khoản & Cài Đặt</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={28} color="#fff" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {role === 'guest'
                ? 'Du khách khám phá'
                : role === 'user'
                ? 'Nguyễn Văn Du Khách'
                : 'Admin Hệ Thống Vivu'}
            </Text>
            <Text style={styles.userEmail}>
              {role === 'guest' ? 'guest@vivuai.vn' : 'thanhvu@vivuai.vn'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.blueLight }]}>
              <Text style={[styles.roleBadgeText, { color: roleLabels[role].color }]}>
                Vai trò: {roleLabels[role].name}
              </Text>
            </View>
          </View>
        </View>

        {/* DEMO ROLE SWITCHER (FOR COURSE DEMO) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Chuyển Đổi Quyền Thử Nghiệm (Demo Role)</Text>
          <Text style={styles.sectionDesc}>
            Dùng để demo phân quyền 3 cấp (Khách, Người dùng, Admin) cho giảng viên chấm điểm:
          </Text>
          <View style={styles.roleToggleRow}>
            {(['guest', 'user', 'admin'] as UserRole[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                  {r === 'guest' ? 'Khách' : r === 'user' ? 'Người Dùng' : 'Admin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PERMISSIONS PREVIEW */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quyền hạn hiện tại ({roleLabels[role].name}):</Text>
          <View style={styles.permList}>
            <View style={styles.permRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.emerald}
              />
              <Text style={styles.permText}>Xem danh sách địa điểm, bản đồ & GPS</Text>
            </View>
            <View style={styles.permRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.emerald}
              />
              <Text style={styles.permText}>
                Tạo lịch trình bằng Gemini AI ({role === 'guest' ? 'Giới hạn 1-2 lần' : 'Không giới hạn'})
              </Text>
            </View>
            <View style={styles.permRow}>
              <Ionicons
                name={role !== 'guest' ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={role !== 'guest' ? colors.emerald : colors.rose}
              />
              <Text style={styles.permText}>Lưu & xuất PDF lịch trình</Text>
            </View>
            <View style={styles.permRow}>
              <Ionicons
                name={role === 'admin' ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={role === 'admin' ? colors.emerald : colors.rose}
              />
              <Text style={styles.permText}>Trang Web Quản trị CRUD địa điểm & thống kê</Text>
            </View>
          </View>
        </View>

        {/* SETTINGS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tùy chọn hệ thống</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={18} color={colors.textLight} />
              <Text style={styles.settingLabel}>Giao diện tối (Dark Mode)</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: colors.bgDark, true: colors.primary }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="language-outline" size={18} color={colors.textLight} />
              <Text style={styles.settingLabel}>Ngôn ngữ (Tiếng Việt)</Text>
            </View>
            <Switch
              value={isVietnamese}
              onValueChange={setIsVietnamese}
              trackColor={{ false: colors.bgDark, true: colors.primary }}
            />
          </View>
        </View>

        {/* APP INFO */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>Vivu AI Đà Nẵng - Hội An v1.0.0</Text>
          <Text style={styles.footerSubText}>Đồ án môn học: Lập trình đa nền tảng</Text>
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
    paddingBottom: 12,
    backgroundColor: colors.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textLight,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDark,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
    gap: 14,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textLight,
  },
  userEmail: {
    fontSize: 11,
    color: colors.textSub,
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
  sectionCard: {
    marginTop: 16,
    backgroundColor: colors.surfaceDark,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 6,
  },
  sectionDesc: {
    fontSize: 10,
    color: colors.textSub,
    marginBottom: 10,
    lineHeight: 14,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: colors.bgDark,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  roleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleBtnText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  roleBtnTextActive: {
    color: '#fff',
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
    color: colors.textMuted,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  footerSubText: {
    fontSize: 9,
    color: colors.textSub,
    marginTop: 2,
  },
});
