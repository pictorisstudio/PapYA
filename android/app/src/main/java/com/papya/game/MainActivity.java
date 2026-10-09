package com.papya.game;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import androidx.activity.OnBackPressedCallback;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (bridge == null || bridge.getWebView() == null) {
                    finish();
                    return;
                }
                bridge.getWebView().evaluateJavascript(
                    "!window.dispatchEvent(new Event('papya:back', {cancelable:true}))",
                    handled -> { if (!"true".equals(handled)) finish(); }
                );
            }
        });
    }

    @Override
    public void onPause() {
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().evaluateJavascript(
                "window.dispatchEvent(new Event('papya:suspend'))", null
            );
        }
        super.onPause();
    }
}
