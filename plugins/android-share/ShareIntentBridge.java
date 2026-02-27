package com.timestampsaver.share;

import android.content.Intent;

public final class ShareIntentBridge {
  private ShareIntentBridge() {}

  public static void handleIntent(Intent intent) {
    ShareIntentModule.handleIntent(intent);
  }
}
