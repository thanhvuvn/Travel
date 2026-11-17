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
import { usePlaces } from '../context/PlacesContext';
import { useTheme } from '../context/ThemeContext';
import { Area, Category } from '../types';
import { Alert } from '../utils/dialog';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'food', label: '🍜 Ẩm thực' },
  { key: 'beach', label: '🏖️ Bãi biển' },
  { key: 'checkin', label: '📸 Check-in' },
  { key: 'culture', label: '🏮 Văn hóa' },
  { key: 'cafe', label: '☕ Cà phê' },
];

export const SuggestPlaceModal: React.FC<Props> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { addSuggestion } = usePlaces();

  const [name, setName] = useState('');
  const [area, setArea] = useState<Area>('danang');
  const [category, setCategory] = useState<Category>('food');
  const [note, setNote] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setName('');
      setNote('');
      setLat('');
      setLng('');
      setError('');
    }
  }, [visible]);

  const submit = () => {
    if (!user) return;
    if (name.trim().length < 3) {
      setError('Vui lòng nhập tên địa điểm (ít nhất 3 ký tự).');
      return;
    }
    const la = lat.trim() ? parseFloat(lat) : null;
    const ln = lng.trim() ? parseFloat(lng) : null;
    if ((lat.trim() && Number.isNaN(la)) || (lng.trim() && Number.isNaN(ln))) {
      setError('Tọa độ không hợp lệ. Có thể để trống nếu bạn không biết.');
      return;
    }
    addSuggestion(user.name, { name: name.trim(), area, category, note: note.trim(), lat: la, lng: ln });
    onClose();
    Alert.alert('Cảm ơn bạn!', 'Đề xuất đã được gửi tới Admin. Địa điểm sẽ xuất hiện sau khi được duyệt.');
  };

  const input = [styles.input, { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>Đề xuất địa điểm mới</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            <Text style={{ fontSize: 12, color: theme.textMuted, lineHeight: 18 }}>
              Bạn biết một nơi hay ở Đà Nẵng - Hội An mà chưa có trong app? Gửi cho Admin xem xét nhé.
            </Text>

            <View>
              <Text style={[styles.label, { color: theme.textMuted }]}>Tên địa điểm (*)</Text>
              <TextInput style={input} value={name} onChangeText={setName} placeholder="VD: Bánh xèo Bà Dưỡng" placeholderTextColor={theme.textSub} />
            </View>

            <View>
              <Text style={[styles.label, { color: theme.textMuted }]}>Khu vực</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {([
                  { k: 'danang', l: 'Đà Nẵng' },
                  { k: 'hoian', l: 'Hội An' },
                ] as { k: Area; l: string }[]).map((a) => (
                  <TouchableOpacity
                    key={a.k}
                    style={[styles.chip, { backgroundColor: theme.bg, borderColor: theme.border }, area === a.k && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    onPress={() => setArea(a.k)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: area === a.k ? '#fff' : theme.textMuted }}>{a.l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: theme.textMuted }]}>Loại địa điểm</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    style={[styles.chip, { backgroundColor: theme.bg, borderColor: theme.border }, category === c.key && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    onPress={() => setCategory(c.key)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: category === c.key ? '#fff' : theme.textMuted }}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: theme.textMuted }]}>Ghi chú (địa chỉ, món nổi bật...)</Text>
              <TextInput style={[...input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]} value={note} onChangeText={setNote} multiline placeholder="Mô tả ngắn về địa điểm" placeholderTextColor={theme.textSub} />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textMuted }]}>Vĩ độ (tùy chọn)</Text>
                <TextInput style={input} value={lat} onChangeText={setLat} keyboardType="numeric" placeholder="16.0583" placeholderTextColor={theme.textSub} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: theme.textMuted }]}>Kinh độ (tùy chọn)</Text>
                <TextInput style={input} value={lng} onChangeText={setLng} keyboardType="numeric" placeholder="108.2161" placeholderTextColor={theme.textSub} />
              </View>
            </View>

            {error ? (
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: theme.roseLight, padding: 10, borderRadius: 10 }}>
                <Ionicons name="alert-circle" size={15} color={theme.rose} />
                <Text style={{ color: theme.rose, fontSize: 12, fontWeight: '600', flex: 1 }}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={[styles.submit, { backgroundColor: theme.primary }]} onPress={submit} activeOpacity={0.85}>
              <Ionicons name="paper-plane" size={16} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>Gửi đề xuất</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 16, fontWeight: '800' },
  label: { fontSize: 11, fontWeight: '600', marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 42, fontSize: 13 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1 },
  submit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: 14, marginTop: 4 },
});
