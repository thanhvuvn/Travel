import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Alert } from '../utils/dialog';

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC = () => {
  const { theme } = useTheme();
  const {
    isAuthModalVisible,
    authModalInitialTab,
    closeAuthModal,
    login,
    register,
    setDemoRole,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(authModalInitialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isAuthModalVisible) {
      setMode(authModalInitialTab);
      setErrorMsg('');
    }
  }, [isAuthModalVisible, authModalInitialTab]);

  const handleSubmit = () => {
    setErrorMsg('');

    if (mode === 'login') {
      const res = login(email, password);
      if (!res.ok && res.error) {
        setErrorMsg(res.error);
      }
    } else if (mode === 'register') {
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không khớp.');
        return;
      }
      const res = register(name, email, password);
      if (!res.ok && res.error) {
        setErrorMsg(res.error);
      }
    } else if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Vui lòng nhập email hợp lệ để khôi phục mật khẩu.');
        return;
      }
      Alert.alert(
        'Đã gửi email khôi phục',
        `Hướng dẫn đặt lại mật khẩu đã được gửi tới ${email.trim()}.`
      );
      setMode('login');
    }
  };

  const handleSelectDemo = (role: 'guest' | 'user' | 'admin') => {
    setDemoRole(role);
    closeAuthModal();
  };

  return (
    <Modal
      visible={isAuthModalVisible}
      animationType="slide"
      transparent
      onRequestClose={closeAuthModal}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.bg }]}
            onPress={closeAuthModal}
          >
            <Ionicons name="close" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Brand Header */}
            <View style={styles.brandHeader}>
              <View style={[styles.logoBox, { backgroundColor: theme.primary }]}>
                <Ionicons name="compass" size={28} color="#fff" />
              </View>
              <Text style={[styles.brandTitle, { color: theme.text }]}>
                Vivu AI Travel
              </Text>
              <Text style={[styles.brandSub, { color: theme.textMuted }]}>
                {mode === 'login'
                  ? 'Đăng nhập để lưu lịch trình & đồng bộ dữ liệu'
                  : mode === 'register'
                  ? 'Tạo tài khoản mới để trải nghiệm đầy đủ chức năng'
                  : 'Nhập email của bạn để đặt lại mật khẩu'}
              </Text>
            </View>

            {/* CHUYỂN ĐỔI QUYỀN NHANH (DEMO ĐỒ ÁN) - ĐƯỢC ĐẶT NỔI BẬT TẠI ĐÂY */}
            <View
              style={[
                styles.quickDemoCard,
                { backgroundColor: theme.bg, borderColor: theme.border },
              ]}
            >
              <View style={styles.quickDemoHeader}>
                <Ionicons name="flash" size={14} color={theme.amber} />
                <Text style={[styles.quickDemoTitle, { color: theme.text }]}>
                  Chuyển Đổi Quyền Nhanh (Demo Đồ Án)
                </Text>
              </View>
              <Text style={[styles.quickDemoDesc, { color: theme.textSub }]}>
                Bấm 1 chạm để chuyển ngay sang vai trò mong muốn khi thuyết trình:
              </Text>

              <View style={styles.quickDemoBtnRow}>
                {/* 1. KHÁCH */}
                <TouchableOpacity
                  style={[
                    styles.quickDemoBtn,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                  onPress={() => handleSelectDemo('guest')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-outline" size={14} color={theme.textMuted} />
                  <Text style={[styles.quickDemoBtnText, { color: theme.text }]}>
                    Khách
                  </Text>
                  <Text style={[styles.quickDemoBadge, { color: theme.textSub }]}>
                    Dùng thử
                  </Text>
                </TouchableOpacity>

                {/* 2. USER */}
                <TouchableOpacity
                  style={[
                    styles.quickDemoBtn,
                    { backgroundColor: theme.blueLight, borderColor: theme.primaryLight },
                  ]}
                  onPress={() => handleSelectDemo('user')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person" size={14} color={theme.primaryLight} />
                  <Text style={[styles.quickDemoBtnText, { color: theme.primaryLight }]}>
                    Người Dùng
                  </Text>
                  <Text style={[styles.quickDemoBadge, { color: theme.primaryLight }]}>
                    Đầy đủ
                  </Text>
                </TouchableOpacity>

                {/* 3. ADMIN */}
                <TouchableOpacity
                  style={[
                    styles.quickDemoBtn,
                    { backgroundColor: theme.roseLight, borderColor: theme.rose },
                  ]}
                  onPress={() => handleSelectDemo('admin')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="shield-checkmark" size={14} color={theme.rose} />
                  <Text style={[styles.quickDemoBtnText, { color: theme.rose }]}>
                    Admin
                  </Text>
                  <Text style={[styles.quickDemoBadge, { color: theme.rose }]}>
                    Quản trị
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textSub }]}>
                HOẶC ĐĂNG NHẬP THƯỜNG
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Mode Tabs (Login / Register) */}
            {mode !== 'forgot' && (
              <View style={[styles.tabSwitcher, { backgroundColor: theme.bg }]}>
                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    mode === 'login' && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: mode === 'login' ? '#fff' : theme.textMuted },
                    ]}
                  >
                    Đăng nhập
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabBtn,
                    mode === 'register' && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: mode === 'register' ? '#fff' : theme.textMuted },
                    ]}
                  >
                    Đăng ký
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Error Alert */}
            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: theme.roseLight }]}>
                <Ionicons name="alert-circle" size={16} color={theme.rose} />
                <Text style={[styles.errorText, { color: theme.rose }]}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Form Inputs */}
            <View style={styles.form}>
              {mode === 'register' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                    Họ và tên
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: theme.inputBg, borderColor: theme.border },
                    ]}
                  >
                    <Ionicons name="person-outline" size={17} color={theme.textSub} />
                    <TextInput
                      style={[styles.input, { color: theme.inputText }]}
                      placeholder="VD: Nguyễn Văn A"
                      placeholderTextColor={theme.textSub}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                  Email
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    { backgroundColor: theme.inputBg, borderColor: theme.border },
                  ]}
                >
                  <Ionicons name="mail-outline" size={17} color={theme.textSub} />
                  <TextInput
                    style={[styles.input, { color: theme.inputText }]}
                    placeholder="email@example.com"
                    placeholderTextColor={theme.textSub}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {mode !== 'forgot' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                    Mật khẩu
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: theme.inputBg, borderColor: theme.border },
                    ]}
                  >
                    <Ionicons name="lock-closed-outline" size={17} color={theme.textSub} />
                    <TextInput
                      style={[styles.input, { color: theme.inputText }]}
                      placeholder="Tối thiểu 6 ký tự"
                      placeholderTextColor={theme.textSub}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={theme.textSub}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {mode === 'register' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                    Xác nhận mật khẩu
                  </Text>
                  <View
                    style={[
                      styles.inputWrap,
                      { backgroundColor: theme.inputBg, borderColor: theme.border },
                    ]}
                  >
                    <Ionicons name="shield-checkmark-outline" size={17} color={theme.textSub} />
                    <TextInput
                      style={[styles.input, { color: theme.inputText }]}
                      placeholder="Nhập lại mật khẩu"
                      placeholderTextColor={theme.textSub}
                      secureTextEntry={!showPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>
                </View>
              )}

              {mode === 'login' && (
                <TouchableOpacity
                  style={styles.forgotLink}
                  onPress={() => {
                    setMode('forgot');
                    setErrorMsg('');
                  }}
                >
                  <Text style={[styles.forgotText, { color: theme.primaryLight }]}>
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                onPress={handleSubmit}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>
                  {mode === 'login'
                    ? 'Đăng Nhập'
                    : mode === 'register'
                    ? 'Tạo Tài Khoản'
                    : 'Gửi Yêu Cầu Khôi Phục'}
                </Text>
              </TouchableOpacity>

              {mode === 'forgot' && (
                <TouchableOpacity
                  style={styles.backToLoginBtn}
                  onPress={() => setMode('login')}
                >
                  <Text style={[styles.backToLoginText, { color: theme.textMuted }]}>
                    ← Quay lại Đăng nhập
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Continue as Guest */}
            <TouchableOpacity style={styles.guestBtn} onPress={closeAuthModal}>
              <Text style={[styles.guestBtnText, { color: theme.textMuted }]}>
                Đóng cửa sổ và tiếp tục trải nghiệm →
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '92%',
    paddingTop: 14,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  brandSub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 3,
    paddingHorizontal: 16,
  },
  quickDemoCard: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  quickDemoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  quickDemoTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  quickDemoDesc: {
    fontSize: 10,
    marginBottom: 10,
  },
  quickDemoBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickDemoBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 2,
  },
  quickDemoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  quickDemoBadge: {
    fontSize: 8,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  form: {
    gap: 11,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 12,
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  backToLoginBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backToLoginText: {
    fontSize: 12,
    fontWeight: '600',
  },
  guestBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 6,
  },
  guestBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
