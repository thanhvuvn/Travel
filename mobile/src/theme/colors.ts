export interface ThemeColors {
  isDark: boolean;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;

  bg: string;
  surface: string;
  card: string;
  border: string;
  navBg: string;
  headerBg: string;
  inputBg: string;
  inputText: string;

  text: string;
  textMuted: string;
  textSub: string;

  emerald: string;
  emeraldLight: string;
  amber: string;
  amberLight: string;
  rose: string;
  roseLight: string;
  blueLight: string;
}

export const darkColors: ThemeColors = {
  isDark: true,
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  secondary: '#F59E0B',
  accent: '#0EA5E9',

  bg: '#0B1120',
  surface: '#1E293B',
  card: '#1E293B',
  border: '#334155',
  navBg: '#070D18',
  headerBg: '#1E3A8A',
  inputBg: '#0F172A',
  inputText: '#F8FAFC',

  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textSub: '#64748B',

  emerald: '#10B981',
  emeraldLight: 'rgba(16, 185, 129, 0.15)',
  amber: '#F59E0B',
  amberLight: 'rgba(245, 158, 11, 0.15)',
  rose: '#F43F5E',
  roseLight: 'rgba(244, 63, 94, 0.12)',
  blueLight: 'rgba(37, 99, 235, 0.15)',
};

export const lightColors: ThemeColors = {
  isDark: false,
  primary: '#2563EB',
  primaryLight: '#2563EB',
  primaryDark: '#1E40AF',
  secondary: '#D97706',
  accent: '#0284C7',

  bg: '#F1F5F9',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  navBg: '#FFFFFF',
  headerBg: '#2563EB',
  inputBg: '#F8FAFC',
  inputText: '#0F172A',

  text: '#0F172A',
  textMuted: '#475569',
  textSub: '#64748B',

  emerald: '#059669',
  emeraldLight: 'rgba(5, 150, 105, 0.12)',
  amber: '#D97706',
  amberLight: 'rgba(217, 119, 6, 0.12)',
  rose: '#E11D48',
  roseLight: 'rgba(225, 29, 72, 0.1)',
  blueLight: 'rgba(37, 99, 235, 0.1)',
};

export const colors = darkColors;
