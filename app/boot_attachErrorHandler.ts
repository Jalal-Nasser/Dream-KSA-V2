import { Alert, Platform } from "react-native";

function getStack(err: any) {
  if (!err) return String(err);
  if (err.stack) return err.stack;
  if (err.message) return err.message;
  return JSON.stringify(err);
}

function logAndAlert(err: any, isFatal: boolean) {
  try {
    const stack = getStack(err);
    // Send to console (Metro and device logs)
    console.error("[GLOBAL_ERROR_HANDLER] fatal:", !!isFatal, stack);

    // Show a short in-app alert so you notice it on device/emulator
    if (__DEV__) {
      let short = (err && err.message) ? `${err.message}` : "JS Error";
      // limit length shown in alert
      if (short.length > 200) short = short.slice(0, 200) + "...";
      // show a button that logs full stack to console
      Alert.alert(
        "Runtime Error",
        `${short}\n\nOpen Metro/console for full stack.`,
        [
          { text: "OK" },
        ],
        { cancelable: true }
      );
    }
  } catch (e) {
    // swallow
  }
}

// Attach global handler (React Native exposes ErrorUtils)
try {
  // keep existing handler
  // @ts-ignore
  const prev = (global as any).ErrorUtils && (global as any).ErrorUtils.getGlobalHandler ? (global as any).ErrorUtils.getGlobalHandler() : null;
  // @ts-ignore
  (global as any).ErrorUtils && (global as any).ErrorUtils.setGlobalHandler && (global as any).ErrorUtils.setGlobalHandler((err: any, isFatal: boolean) => {
    logAndAlert(err, isFatal);
    if (prev) {
      try { prev(err, isFatal); } catch (e) {}
    }
  });
} catch (e) {
  // best-effort
  console.warn("[attachErrorHandler] couldn't attach global handler", e);
}

// Also surface uncaught promise rejections
if (typeof (global as any).process !== "undefined" && (global as any).process.on) {
  try {
    (global as any).process.on("unhandledRejection", (reason: any) => {
      console.error("[UNHANDLED_REJECTION]", reason && reason.stack ? reason.stack : reason);
      if (__DEV__) {
        Alert.alert("Unhandled Promise Rejection", String(reason?.message || reason));
      }
    });
  } catch (e) {}
}



