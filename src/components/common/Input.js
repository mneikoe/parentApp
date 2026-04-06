import React from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { card, textPrimary, textSecondary, mutedBorder, radius } from '../../theme/colors'

export default function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  style,
  returnKeyType = 'done',
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={textSecondary}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      returnKeyType={returnKeyType}
      style={[styles.input, style]}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: card,
    borderColor: mutedBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: textPrimary,
    fontSize: 15,
  },
})

