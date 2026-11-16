import React, { useEffect, useState } from 'react';
import {
  Alert,
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

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC = () => {
  const { theme } = useTheme();
  const {
    isAuthModalVisible,
    authModalInitialTab,
    closeAuthModal,
    login,
    register,
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
                  ? 'Đăng nhập để lưu lịch trình & đồng bộ đa thiết bị'
                  : mode === 'register'
                  ? 'Tạo tài khoản mới để trải nghiệm trọn vẹn'
                  : 'Nhập email của bạn để đặt lại mật khẩu'}
              </Text>
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

            {/* Quick Demo Logins */}
            {mode === 'login' && (
              <View style={[styles.demoBox, { borderTopColor: theme.border }]}>
                <Text style={[styles.demoTitle, { color: theme.textSub }]}>
                  Đăng nhập nhanh để test (Demo):
                </Text>
                <View style={styles.demoBtnRow}>
                  <TouchableOpacity
                    style={[
                      styles.demoBtn,
                      { backgroundColor: theme.blueLight, borderColor: theme.primary },
                    ]}
                    onPress={() => login('dukhach@vivuai.vn', '123456', 'user')}
                  >
                    <Ionicons name="person" size={13} color={theme.primaryLight} />
                    <Text style={[styles.demoBtnText, { color: theme.primaryLight }]}>
                      Tài khoản User
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.demoBtn,
                      { backgroundColor: theme.roseLight, borderColor: theme.rose },
                    ]}
                    onPress={() => login('admin@vivuai.vn', '123456', 'admin')}
                  >
                    <Ionicons name="shield" size={13} color={theme.rose} />
                    <Text style={[styles.demoBtnText, { color: theme.rose }]}>
                      Tài khoản Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Continue as Guest */}
            <TouchableOpacity style={styles.guestBtn} onPress={closeAuthModal}>
              <Text style={[styles.guestBtnText, { color: theme.textMuted }]}>
                Tiếp tục dùng thử với tư cách Khách →
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
    marginTop: 8,
    marginBottom: 18,
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  brandSub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  tabSwitcher: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
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
    gap: 12,
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
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 11,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 13,
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
  demoBox: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  demoTitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
  },
  demoBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  guestBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 6,
  },
  guestBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
