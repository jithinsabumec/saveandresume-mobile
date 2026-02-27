import { Alert, Platform, ToastAndroid } from 'react-native';

const GENERIC_SAVE_ERROR = 'Unable to save right now. Please try again.';

export function showGenericSaveErrorToast(): void {
  if (Platform.OS === 'android') {
    ToastAndroid.show(GENERIC_SAVE_ERROR, ToastAndroid.SHORT);
    return;
  }

  Alert.alert('Save Failed', GENERIC_SAVE_ERROR);
}
