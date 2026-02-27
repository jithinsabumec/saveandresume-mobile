package com.timestampsaver.share;

import android.content.Intent;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ShareIntentModule extends ReactContextBaseJavaModule {
  private static final String MODULE_NAME = "ShareIntentModule";
  private static final String EVENT_NAME = "onShareText";

  private static ReactApplicationContext reactContext;
  private static String initialSharedText = null;

  public ShareIntentModule(ReactApplicationContext context) {
    super(context);
    reactContext = context;
    if (initialSharedText != null && !initialSharedText.trim().isEmpty()) {
      emitShareEvent(initialSharedText);
    }
  }

  @NonNull
  @Override
  public String getName() {
    return MODULE_NAME;
  }

  @ReactMethod
  public void getInitialSharedText(Promise promise) {
    promise.resolve(initialSharedText);
  }

  @ReactMethod
  public void clearInitialSharedText() {
    initialSharedText = null;
  }

  static void handleIntent(Intent intent) {
    if (intent == null) {
      return;
    }

    String action = intent.getAction();
    String type = intent.getType();

    if (!Intent.ACTION_SEND.equals(action) || type == null || !"text/plain".equals(type)) {
      return;
    }

    String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
    if (sharedText == null || sharedText.trim().isEmpty()) {
      return;
    }

    initialSharedText = sharedText;
    emitShareEvent(sharedText);
  }

  private static void emitShareEvent(String value) {
    if (reactContext == null || !reactContext.hasActiveCatalystInstance()) {
      return;
    }

    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
      .emit(EVENT_NAME, value);
  }
}
