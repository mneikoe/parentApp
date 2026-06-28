/**
 * STRAX Mobile Design System — Typography Tokens (v1.0 Specifications)
 */

export const fontSizes = {
  display: 32,   // Display Large
  h1:      24,   // Heading 1
  h2:      20,   // Heading 2
  h3:      16,   // Heading 3 / Body Large
  body:    14,   // Body
  sub:     12,   // Body Small
  caption: 11,   // Caption
  label:   10,   // Label
};

export const fontWeights = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  black:    '800',
};

export const lineHeights = {
  display: 40,
  h1:      32,
  h2:      28,
  h3:      24,
  body:    20,
  sub:     16,
  caption: 16,
  label:   14,
};

export const letterSpacing = {
  display: -0.5,
  h1:      -0.3,
  h2:      -0.2,
  h3:      0,
  body:    0,
  sub:     0.2,
  caption: 0.3,
  label:   0.5,
};

export const textStyles = {
  display: {
    fontSize:      fontSizes.display,
    fontWeight:    fontWeights.black,
    lineHeight:    lineHeights.display,
    letterSpacing: letterSpacing.display,
  },
  h1: {
    fontSize:      fontSizes.h1,
    fontWeight:    fontWeights.bold,
    lineHeight:    lineHeights.h1,
    letterSpacing: letterSpacing.h1,
  },
  h2: {
    fontSize:      fontSizes.h2,
    fontWeight:    fontWeights.semibold,
    lineHeight:    lineHeights.h2,
    letterSpacing: letterSpacing.h2,
  },
  h3: {
    fontSize:      fontSizes.h3,
    fontWeight:    fontWeights.semibold,
    lineHeight:    lineHeights.h3,
    letterSpacing: letterSpacing.h3,
  },
  bodyLarge: {
    fontSize:   fontSizes.h3,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.h3,
  },
  body: {
    fontSize:   fontSizes.body,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.body,
  },
  sub: {
    fontSize:      fontSizes.sub,
    fontWeight:    fontWeights.regular,
    lineHeight:    lineHeights.sub,
    letterSpacing: letterSpacing.sub,
  },
  caption: {
    fontSize:      fontSizes.caption,
    fontWeight:    fontWeights.medium,
    lineHeight:    lineHeights.caption,
    letterSpacing: letterSpacing.caption,
  },
  label: {
    fontSize:      fontSizes.label,
    fontWeight:    fontWeights.bold,
    lineHeight:    lineHeights.label,
    letterSpacing: letterSpacing.label,
    textTransform: 'uppercase',
  },
};
