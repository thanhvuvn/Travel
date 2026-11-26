import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  CHECKLIST_GROUPS,
  EMERGENCY_HOTLINES,
  LOCAL_SURVIVAL_TIPS,
  PACKING_CHECKLIST,
} from '../data/mockSurvivalKit';
import { Alert } from '../utils/dialog';
import { FadeInView, ScalePress } from './AnimatedUI';

const CHECKLIST_STORAGE_KEY = 'vivu_checklist_v1';

type KitTab = 'checklist' | 'hotline' | 'tips';

export const SurvivalKitSection: React.FC = () => {
  const { theme } = useTheme();
  const { isVietnamese, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<KitTab>('checklist');
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CHECKLIST_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setCheckedIds(parsed);
        }
      })
      .catch(() => {});
  }, []);

  const persistChecked = (next: string[]) => {
    setCheckedIds(next);
    AsyncStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  };

  const toggleItem = (id: string) => {
    const exists = checkedIds.includes(id);
    const next = exists ? checkedIds.filter((i) => i !== id) : [...checkedIds, id];
    persistChecked(next);
  };

  const resetChecklist = () => {
    persistChecked([]);
  };

  const callPhone = (phone: string, title: string, displayPhone: string) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(title, `Số đường dây nóng: ${displayPhone}`);
        }
      })
      .catch(() => {
        Alert.alert(title, `Số đường dây nóng: ${displayPhone}`);
      });
  };

  const totalCount = PACKING_CHECKLIST.length;
  const doneCount = checkedIds.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>{t('kit_title')}</Text>
          <Text style={[styles.sub, { color: theme.textSub }]}>{t('kit_sub')}</Text>
        </View>
      </View>

      {/* 3 Sub-tabs */}
      <View style={[styles.tabsRow, { backgroundColor: theme.bg, borderColor: theme.border }]}>
        {(
          [
            { key: 'checklist', label: `${t('kit_tab_packing')} (${doneCount}/${totalCount})`, icon: 'checkbox-outline' },
            { key: 'hotline', label: t('kit_tab_hotline'), icon: 'call-outline' },
            { key: 'tips', label: t('kit_tab_tips'), icon: 'bulb-outline' },
          ] as { key: KitTab; label: string; icon: keyof typeof Ionicons.glyphMap }[]
        ).map((tabItem) => {
          const active = activeTab === tabItem.key;
          return (
            <TouchableOpacity
              key={tabItem.key}
              style={[
                styles.tabBtn,
                active && { backgroundColor: theme.primary },
              ]}
              onPress={() => setActiveTab(tabItem.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={tabItem.icon}
                size={13}
                color={active ? '#fff' : theme.textMuted}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: active ? '#fff' : theme.textMuted },
                  active && { fontWeight: '700' },
                ]}
                numberOfLines={1}
              >
                {tabItem.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TAB 1: CHECKLIST */}
      {activeTab === 'checklist' && (
        <FadeInView triggerKey="kit-checklist" duration={220} slideOffset={6}>
          <View style={styles.progressHeader}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.textMuted }}>
              {t('kit_progress')} {progressPct}%
            </Text>
            {doneCount > 0 && (
              <TouchableOpacity onPress={resetChecklist}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: theme.rose }}>
                  {t('kit_reset')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPct}%`,
                  backgroundColor: progressPct === 100 ? theme.emerald : theme.primary,
                },
              ]}
            />
          </View>

          <View style={{ gap: 10, marginTop: 10 }}>
            {CHECKLIST_GROUPS.map((grp) => {
              const items = PACKING_CHECKLIST.filter((i) => i.group === grp.key);
              return (
                <View key={grp.key}>
                  <Text style={[styles.groupTitle, { color: theme.text }]}>
                    {isVietnamese ? grp.title : grp.titleEn}
                  </Text>
                  <View style={{ gap: 6, marginTop: 4 }}>
                    {items.map((item) => {
                      const checked = checkedIds.includes(item.id);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.checkRow,
                            {
                              backgroundColor: checked ? theme.emeraldLight : theme.bg,
                              borderColor: checked ? theme.emerald : theme.border,
                            },
                          ]}
                          onPress={() => toggleItem(item.id)}
                          activeOpacity={0.75}
                        >
                          <Ionicons
                            name={checked ? 'checkbox' : 'square-outline'}
                            size={17}
                            color={checked ? theme.emerald : theme.textSub}
                          />
                          <Text
                            style={[
                              styles.checkLabel,
                              { color: checked ? theme.emerald : theme.text },
                              checked && styles.checkLabelDone,
                            ]}
                          >
                            {isVietnamese ? item.label : item.labelEn}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </FadeInView>
      )}

      {/* TAB 2: HOTLINE */}
      {activeTab === 'hotline' && (
        <FadeInView triggerKey="kit-hotline" duration={220} slideOffset={6} style={{ gap: 8 }}>
          {EMERGENCY_HOTLINES.map((hl) => (
            <View
              key={hl.id}
              style={[
                styles.hotlineRow,
                { backgroundColor: theme.bg, borderColor: theme.border },
              ]}
            >
              <View style={[styles.hotlineIcon, { backgroundColor: theme.roseLight }]}>
                <Ionicons
                  name={hl.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={theme.rose}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.hotlineTitle, { color: theme.text }]}>
                  {isVietnamese ? hl.title : hl.titleEn}
                </Text>
                <Text style={[styles.hotlineDesc, { color: theme.textMuted }]}>
                  {isVietnamese ? hl.desc : hl.descEn}
                </Text>
              </View>
              <ScalePress
                style={[styles.callBtn, { backgroundColor: theme.emerald }]}
                onPress={() => callPhone(hl.phone, isVietnamese ? hl.title : hl.titleEn, hl.displayPhone)}
              >
                <Ionicons name="call" size={12} color="#fff" />
                <Text style={styles.callBtnText}>{hl.displayPhone}</Text>
              </ScalePress>
            </View>
          ))}
        </FadeInView>
      )}

      {/* TAB 3: TIPS */}
      {activeTab === 'tips' && (
        <FadeInView triggerKey="kit-tips" duration={220} slideOffset={6} style={{ gap: 8 }}>
          {LOCAL_SURVIVAL_TIPS.map((tip) => (
            <View
              key={tip.id}
              style={[
                styles.tipBox,
                { backgroundColor: theme.bg, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.tipTitle, { color: theme.text }]}>
                {tip.icon} {isVietnamese ? tip.title : tip.titleEn}
              </Text>
              <Text style={[styles.tipDetail, { color: theme.textMuted }]}>
                {isVietnamese ? tip.detail : tip.detailEn}
              </Text>
            </View>
          ))}
        </FadeInView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
  },
  sub: {
    fontSize: 10,
    marginTop: 2,
  },
  tabsRow: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderRadius: 9,
    gap: 4,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressTrack: {
    height: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  checkLabel: {
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  checkLabelDone: {
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  hotlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  hotlineIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  hotlineDesc: {
    fontSize: 9,
    lineHeight: 13,
    marginTop: 1,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
  },
  callBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  tipBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  tipDetail: {
    fontSize: 10,
    lineHeight: 15,
  },
});
