import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Svg, Rect } from 'react-native-svg';

const Chart = ({ data, ...props }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <View style={styles.container} {...props}>
      <Svg height="100%" width="100%">
        {data.map((d, index) => (
          <Rect
            key={index}
            x={(index * 20) + (index * 10)}
            y={100 - (d.value / max) * 100}
            width="20"
            height={(d.value / max) * 100}
            fill="#3b82f6"
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 150,
  },
});

export default Chart;