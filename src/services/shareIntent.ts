import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

type ShareIntentModuleType = {
  getInitialSharedText: () => Promise<string | null>;
  clearInitialSharedText: () => Promise<void> | void;
};

type ShareMenuItem = {
  data?: string;
  mimeType?: string;
};

type ShareMenuListener = {
  remove: () => void;
};

type ShareMenuModuleType = {
  getInitialShare: (callback: (item: ShareMenuItem | null) => void) => void;
  clearInitialShare?: () => void;
  clearSharedData?: () => void;
  addNewShareListener: (callback: (item: ShareMenuItem | null) => void) => ShareMenuListener | (() => void);
};

const nativeModule = NativeModules.ShareIntentModule as ShareIntentModuleType | undefined;
const eventEmitter = nativeModule ? new NativeEventEmitter(NativeModules.ShareIntentModule) : null;

let shareMenuModule: ShareMenuModuleType | null = null;

try {
  const loaded = require('react-native-share-menu');
  const candidate = (loaded?.default ?? loaded) as ShareMenuModuleType | undefined;
  if (candidate && typeof candidate.getInitialShare === 'function' && typeof candidate.addNewShareListener === 'function') {
    shareMenuModule = candidate;
  }
} catch {
  shareMenuModule = null;
}

function extractSharedText(item: ShareMenuItem | null): string | null {
  if (!item?.data || typeof item.data !== 'string') {
    return null;
  }

  const text = item.data.trim();
  return text ? text : null;
}

export const shareIntentService = {
  isSupported(): boolean {
    return Platform.OS === 'android' && Boolean(shareMenuModule || nativeModule);
  },

  async getInitialSharedText(): Promise<string | null> {
    if (shareMenuModule) {
      return new Promise((resolve) => {
        shareMenuModule?.getInitialShare((item) => {
          resolve(extractSharedText(item));
        });
      });
    }

    if (!nativeModule) return null;
    return nativeModule.getInitialSharedText();
  },

  async clearInitialSharedText(): Promise<void> {
    if (shareMenuModule?.clearInitialShare) {
      shareMenuModule.clearInitialShare();
      return;
    }

    if (shareMenuModule?.clearSharedData) {
      shareMenuModule.clearSharedData();
      return;
    }

    if (!nativeModule?.clearInitialSharedText) return;
    await nativeModule.clearInitialSharedText();
  },

  subscribe(handler: (value: string) => void): () => void {
    if (shareMenuModule) {
      const subscription = shareMenuModule.addNewShareListener((item) => {
        const text = extractSharedText(item);
        if (text) {
          handler(text);
        }
      });

      if (typeof subscription === 'function') {
        return () => subscription();
      }

      return () => subscription.remove();
    }

    if (!eventEmitter) return () => {};

    const subscription = eventEmitter.addListener('onShareText', handler);
    return () => subscription.remove();
  }
};
