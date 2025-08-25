// Typography constants using the font configuration
import { FONT_FAMILIES, FONT_WEIGHTS, FONT_SIZES, LINE_HEIGHTS } from '../fonts';

// Typography configuration matching web design exactly
export const TYPOGRAPHY = {
  // Font families (matching web font-cabin, etc.)
  fontFamily: {
    primary: FONT_FAMILIES.primary,
    secondary: FONT_FAMILIES.secondary,
    monospace: FONT_FAMILIES.monospace,
  },
  
  // Font sizes (matching web text-* classes)
  fontSize: FONT_SIZES,
  
  // Line heights (matching web leading-* classes)
  lineHeight: LINE_HEIGHTS,
  
  // Font weights (matching web font-* classes)
  fontWeight: FONT_WEIGHTS,
} as const;

export default TYPOGRAPHY;
