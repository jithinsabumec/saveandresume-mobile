import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

type ShareIntentModuleType = {
  getInitialSharedText: () => Promise<string | null>;
  clearInitialSharedText: () => Promise<void> | void;
};

const nativeModule = NativeModules.ShareIntentModule as ShareIntentModuleType | undefined;
const eventEmitter = nativeModule ? new NativeEventEmitter(NativeModules.ShareIntentModule) : null;

export const shareIntentService = {
  isSupported(): boolean {
    return Platform.OS === 'android' && Boolean(nativeModule);
  },

  async getInitialSharedText(): Promise<string | null> {
    if (!nativeModule) return null;
    return nativeModule.getInitialSharedText();
  },

  async clearInitialSharedText(): Promise<void> {
    if (!nativeModule?.clearInitialSharedText) return;
    await nativeModule.clearInitialSharedText();
  },

  subscribe(handler: (value: string) => void): () => void {
    if (!eventEmitter) return () => {};

    const subscription = eventEmitter.addListener('onShareText', handler);
    return () => subscription.remove();
  }
};
