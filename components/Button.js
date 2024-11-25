import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Button({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    margin: 5,
    backgroundColor: '#6200ea',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    borderRadius: 5,
  },
  text: {
    fontSize: 24,
    color: '#fff',
  },
});
