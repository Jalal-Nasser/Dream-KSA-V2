import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(Dimensions.get('window').width < 768);

  useEffect(() => {
    const onChange = ({ window }) => {
      setIsMobile(window.width < 768);
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);

  return isMobile;
};

export default useMobile;