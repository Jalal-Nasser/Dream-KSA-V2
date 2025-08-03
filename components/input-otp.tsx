import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View, Pressable, Text } from 'react-native';

const InputOTP = ({ maxLength, ...props }) => {
  const [otp, setOtp] = useState('');
  const inputRef = useRef(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleTextChange = (text) => {
    setOtp(text.slice(0, maxLength));
  };

  const renderBoxes = () => {
    const boxes = [];
    for (let i = 0; i < maxLength; i++) {
      const char = otp[i] || '';
      boxes.push(
        <View key={i} style={[styles.box, char && styles.activeBox]}>
          <Text style={styles.boxText}>{char}</Text>
        </View>
      );
    }
    return boxes;
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.boxesContainer}>
        {renderBoxes()}
      </Pressable>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={otp}
        onChangeText={handleTextChange}
        maxLength={maxLength}
        keyboardType="number-pad"
        caretHidden={true}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Styles for the container if needed
  },
  boxesContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
  },
  box: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#4b5563',
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBox: {
    borderColor: '#3b82f6',
  },
  boxText: {
    color: 'white',
    fontSize: 24,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default InputOTP;