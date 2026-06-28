import React from 'react'
import { TextInput, StyleSheet } from 'react-native'
import { card, textPrimary, textSecondary, mutedBorder, radius } from '../../theme/colors'

const Input = React.forwardRef(({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  style,
  returnKeyType = 'done',
  maxLength,
}, ref) => {
  return (
    <TextInput
      ref={ref}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={textSecondary}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      returnKeyType={returnKeyType}
      maxLength={maxLength}
      style={[styles.input, style]}
    />
  )
})

export default Input;

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

