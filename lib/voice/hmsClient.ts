import { Platform } from 'react-native';

export class HMSClientSafe {
  private instance: any | null = null;
  private isNative = Platform.OS === 'android' || Platform.OS === 'ios';

  async init() {
    if (!this.isNative) return null;
    const { HMSSDK } = await import('@100mslive/react-native-hms');
    this.instance = new HMSSDK();
    return this.instance;
  }

  get sdk() { return this.instance; }
}




