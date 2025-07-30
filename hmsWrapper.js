import { Platform } from 'react-native';

let HMS = {};
if (Platform.OS !== 'web') {
  HMS = require('@100mslive/react-native-hms');
}

export default HMS;