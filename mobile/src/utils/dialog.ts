import { Alert as RNAlert, Platform } from 'react-native';

type DialogButton = {
  text?: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

/**
 * Alert chạy được cả trên Mobile lẫn Web.
 * (Alert.alert của React Native KHÔNG hoạt động trên react-native-web)
 */
export const Alert = {
  alert(title: string, message?: string, buttons?: DialogButton[]) {
    if (Platform.OS !== 'web') {
      RNAlert.alert(title, message, buttons);
      return;
    }

    const g: any = globalThis;
    const text = message ? `${title}\n\n${message}` : title;
    const action = buttons?.find((b) => b.style !== 'cancel' && b.onPress);
    const hasCancel = buttons?.some((b) => b.style === 'cancel');

    if (action && hasCancel) {
      if (g.confirm(text)) action.onPress?.();
      return;
    }

    g.alert(text);
    buttons?.find((b) => b.onPress)?.onPress?.();
  },
};
