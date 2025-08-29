import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import LoginScreen from './login';

/**
 * Temporary debug layout:
 * - Stubs deep-linking / Linking handlers during startup to prevent automatic redirects/loops.
 * - Renders login UI directly so we can verify the screen reliably.
 *
 * Remove or tighten this guard after debugging by deleting the stub block below.
 */

function disableDeepLinkingInDev() {
  try {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // keep originals in case we want to restore later
      // @ts-ignore
      global.__ORIG_LINKING__ = global.__ORIG_LINKING__ || {
        openURL: Linking.openURL,
        getInitialURL: Linking.getInitialURL,
        addEventListener: Linking.addEventListener?.bind(Linking),
      };

      // stub implementations: log and noop
      Linking.openURL = async (url: string) => {
        console.log('[DEV] Blocking Linking.openURL ->', url);
        return false;
      };

      Linking.getInitialURL = async () => {
        console.log('[DEV] Blocking Linking.getInitialURL -> returning null');
        return null;
      };

      // addEventListener signature differs across RN versions; provide a safe noop handler
      // @ts-ignore
      Linking.addEventListener = (type: string, handler: (...args: any[]) => void) => {
        console.log('[DEV] Blocking Linking.addEventListener for event:', type);
        return {
          remove: () => {
            console.log('[DEV] removed blocked Linking listener for', type);
          },
        };
      };
    }
  } catch (e) {
    console.warn('Failed to stub Linking safely:', e);
  }
}

export default function RootLayout() {
  useEffect(() => {
    disableDeepLinkingInDev();
    return () => {
      // we intentionally do not restore originals here — keep stubbed until you remove this file or revert.
    };
  }, []);

  return <LoginScreen />;
}

