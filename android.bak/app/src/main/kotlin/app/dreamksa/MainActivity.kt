package com.dreamska.app

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import expo.modules.devlauncher.DevLauncherController

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // IMPORTANT: pass null to super.onCreate to avoid early ReactContext creation
    super.onCreate(null)
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    // Let the DevLauncher wrap the delegate. This prevents the "App react context shouldn't be created before" crash.
    val baseDelegate = object : ReactActivityDelegate(this, mainComponentName) {
      override fun createRootView(): ReactRootView {
        return ReactRootView(this@MainActivity)
      }
    }
    return DevLauncherController.wrapReactActivityDelegate(this, baseDelegate)
  }
}
