import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * #3 Scale Press & #4 Spring Animation
 * Nút bấm co giãn đàn hồi tự nhiên khi chạm vào (1-to-1 replacement cho TouchableOpacity)
 */
interface ScalePressProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
}

export const ScalePress: React.FC<ScalePressProps> = ({
  children,
  onPress,
  disabled = false,
  scaleTo = 0.96,
  style,
  activeOpacity = 0.88,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: scaleTo,
      useNativeDriver: USE_NATIVE_DRIVER,
      speed: 35,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: USE_NATIVE_DRIVER,
      friction: 4,
      tension: 120,
    }).start();
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={activeOpacity}
      style={[style, { transform: [{ scale: scaleAnim }] }]}
    >
      {children}
    </AnimatedTouchable>
  );
};

/**
 * #1 Fade In, #2 Slide Transition & #8 Stagger List
 * Hiệu ứng xuất hiện mượt mà từ dưới lên, hỗ trợ delay theo index để tạo hiệu ứng Stagger
 */
interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  slideOffset?: number;
  style?: StyleProp<ViewStyle>;
  triggerKey?: string | number;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 320,
  slideOffset = 14,
  style,
  triggerKey,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideOffset)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(slideOffset);

    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]);

    anim.start();
    return () => anim.stop();
  }, [delay, duration, slideOffset, triggerKey, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/**
 * #5 Skeleton Shimmer / Pulse Loading
 * Hiệu ứng nhịp thở cho khung xương chờ AI hoặc huy hiệu đang hoạt động
 */
interface PulseViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  minOpacity?: number;
  maxOpacity?: number;
  duration?: number;
}

export const PulseView: React.FC<PulseViewProps> = ({
  children,
  style,
  minOpacity = 0.45,
  maxOpacity = 1,
  duration = 850,
}) => {
  const opacity = useRef(new Animated.Value(maxOpacity)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: minOpacity,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(opacity, {
          toValue: maxOpacity,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [duration, maxOpacity, minOpacity, opacity]);

  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
};

/**
 * #10 AI Radar Laser Sweep
 * Tia laser quét dọc khung ngắm camera Gemini Vision AI
 */
interface LaserSweepProps {
  color?: string;
  height?: number;
  fast?: boolean;
}

export const LaserSweep: React.FC<LaserSweepProps> = ({
  color = '#38BDF8',
  height = 210,
  fast = false,
}) => {
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    const d = fast ? 750 : 1900;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: height - 12,
          duration: d,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(translateY, {
          toValue: 8,
          duration: d,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fast, height, translateY]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.laserLine,
        {
          backgroundColor: color,
          shadowColor: color,
          transform: [{ translateY }],
        },
      ]}
    />
  );
};

/**
 * #12 Accordion Mở rộng / Thu gọn nội dung
 */
interface AccordionBoxProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  defaultExpanded?: boolean;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}

export const AccordionBox: React.FC<AccordionBoxProps> = ({
  title,
  subtitle,
  icon = 'information-circle-outline',
  accentColor = '#F59E0B',
  bgColor = '#FFFFFF',
  borderColor = '#E2E8F0',
  textColor = '#0F172A',
  defaultExpanded = true,
  rightAction,
  children,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    Animated.spring(rotateAnim, {
      toValue: next ? 1 : 0,
      useNativeDriver: USE_NATIVE_DRIVER,
      friction: 6,
      tension: 120,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View
      style={[
        styles.accordionContainer,
        { backgroundColor: bgColor, borderColor },
      ]}
    >
      <View style={styles.accordionHeader}>
        <TouchableOpacity
          style={styles.accordionTitleTouch}
          activeOpacity={0.75}
          onPress={toggle}
        >
          <Ionicons name={icon} size={16} color={accentColor} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.accordionTitle, { color: textColor }]}>
              {title}
            </Text>
            {subtitle && !expanded && (
              <Text style={styles.accordionSub} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="chevron-down" size={15} color={accentColor} />
          </Animated.View>
        </TouchableOpacity>
        {rightAction && <View style={{ marginLeft: 8 }}>{rightAction}</View>}
      </View>

      {expanded && (
        <FadeInView duration={220} slideOffset={6} style={{ marginTop: 8 }}>
          {children}
        </FadeInView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  laserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 0,
    height: 2.5,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  accordionContainer: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 14,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionTitleTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accordionTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  accordionSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
});
