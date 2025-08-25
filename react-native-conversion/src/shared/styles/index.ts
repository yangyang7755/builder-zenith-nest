// React Native StyleSheet system matching web design exactly
import { StyleSheet, Dimensions } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from "../constants";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Common styles matching web CSS classes
export const globalStyles = StyleSheet.create({
  // Container styles (matching web .react-native-container)
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    maxWidth: 428, // Mobile width constraint like web
    alignSelf: "center",
    width: "100%",
  },

  // Flex utilities (matching web Tailwind)
  flex1: { flex: 1 },
  flexRow: { flexDirection: "row" },
  flexColumn: { flexDirection: "column" },
  justifyCenter: { justifyContent: "center" },
  justifyBetween: { justifyContent: "space-between" },
  justifyAround: { justifyContent: "space-around" },
  justifyEvenly: { justifyContent: "space-evenly" },
  alignCenter: { alignItems: "center" },
  alignStart: { alignItems: "flex-start" },
  alignEnd: { alignItems: "flex-end" },

  // Text styles (matching web font-cabin, etc.)
  textBase: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
  },
  textSm: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
  },
  textLg: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
  },
  textXl: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
  },
  text2xl: {
    fontSize: TYPOGRAPHY.fontSize["2xl"],
    color: COLORS.text,
  },
  text3xl: {
    fontSize: TYPOGRAPHY.fontSize["3xl"],
    color: COLORS.text,
  },
  text4xl: {
    fontSize: TYPOGRAPHY.fontSize["4xl"],
    color: COLORS.text,
  },

  // Font weights
  fontNormal: { fontWeight: TYPOGRAPHY.fontWeight.normal },
  fontMedium: { fontWeight: TYPOGRAPHY.fontWeight.medium },
  fontSemibold: { fontWeight: TYPOGRAPHY.fontWeight.semibold },
  fontBold: { fontWeight: TYPOGRAPHY.fontWeight.bold },

  // Text colors (matching web text-* classes)
  textPrimary: { color: COLORS.primary },
  textSecondary: { color: COLORS.textSecondary },
  textLight: { color: COLORS.textLight },
  textInverse: { color: COLORS.textInverse },
  textSuccess: { color: COLORS.success },
  textWarning: { color: COLORS.warning },
  textError: { color: COLORS.error },

  // Padding/Margin utilities (matching web p-*, m-* classes)
  p0: { padding: 0 },
  p1: { padding: SPACING.xs },
  p2: { padding: SPACING.sm },
  p3: { padding: SPACING.md },
  p4: { padding: SPACING.lg },
  p5: { padding: SPACING.xl },
  p6: { padding: SPACING["2xl"] },
  p8: { padding: SPACING["3xl"] },

  px1: { paddingHorizontal: SPACING.xs },
  px2: { paddingHorizontal: SPACING.sm },
  px3: { paddingHorizontal: SPACING.md },
  px4: { paddingHorizontal: SPACING.lg },
  px5: { paddingHorizontal: SPACING.xl },
  px6: { paddingHorizontal: SPACING["2xl"] },

  py1: { paddingVertical: SPACING.xs },
  py2: { paddingVertical: SPACING.sm },
  py3: { paddingVertical: SPACING.md },
  py4: { paddingVertical: SPACING.lg },
  py5: { paddingVertical: SPACING.xl },
  py6: { paddingVertical: SPACING["2xl"] },

  m0: { margin: 0 },
  m1: { margin: SPACING.xs },
  m2: { margin: SPACING.sm },
  m3: { margin: SPACING.md },
  m4: { margin: SPACING.lg },
  m5: { margin: SPACING.xl },
  m6: { margin: SPACING["2xl"] },

  mx1: { marginHorizontal: SPACING.xs },
  mx2: { marginHorizontal: SPACING.sm },
  mx3: { marginHorizontal: SPACING.md },
  mx4: { marginHorizontal: SPACING.lg },
  mx5: { marginHorizontal: SPACING.xl },
  mx6: { marginHorizontal: SPACING["2xl"] },

  my1: { marginVertical: SPACING.xs },
  my2: { marginVertical: SPACING.sm },
  my3: { marginVertical: SPACING.md },
  my4: { marginVertical: SPACING.lg },
  my5: { marginVertical: SPACING.xl },
  my6: { marginVertical: SPACING["2xl"] },

  mb1: { marginBottom: SPACING.xs },
  mb2: { marginBottom: SPACING.sm },
  mb3: { marginBottom: SPACING.md },
  mb4: { marginBottom: SPACING.lg },
  mb5: { marginBottom: SPACING.xl },
  mb6: { marginBottom: SPACING["2xl"] },
  mb8: { marginBottom: SPACING["3xl"] },

  mt1: { marginTop: SPACING.xs },
  mt2: { marginTop: SPACING.sm },
  mt3: { marginTop: SPACING.md },
  mt4: { marginTop: SPACING.lg },
  mt5: { marginTop: SPACING.xl },
  mt6: { marginTop: SPACING["2xl"] },

  // Background colors (matching web bg-* classes)
  bgWhite: { backgroundColor: COLORS.background },
  bgGray50: { backgroundColor: COLORS.backgroundSecondary },
  bgPrimary: { backgroundColor: COLORS.primary },
  bgSuccess: { backgroundColor: COLORS.success },
  bgWarning: { backgroundColor: COLORS.warning },
  bgError: { backgroundColor: COLORS.error },

  // Border radius (matching web rounded-* classes)
  roundedNone: { borderRadius: BORDER_RADIUS.none },
  roundedSm: { borderRadius: BORDER_RADIUS.sm },
  rounded: { borderRadius: BORDER_RADIUS.md },
  roundedLg: { borderRadius: BORDER_RADIUS.lg },
  roundedXl: { borderRadius: BORDER_RADIUS.xl },
  roundedFull: { borderRadius: BORDER_RADIUS.full },

  // Border styles
  border: { borderWidth: 1, borderColor: COLORS.border },
  border2: { borderWidth: 2, borderColor: COLORS.border },
  borderPrimary: { borderWidth: 1, borderColor: COLORS.primary },
  border2Primary: { borderWidth: 2, borderColor: COLORS.primary },

  // Shadow styles (matching web shadow classes)
  shadow: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Android
  },
  shadowLg: {
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6, // Android
  },

  // Position utilities
  absolute: { position: "absolute" },
  relative: { position: "relative" },

  // Width/Height utilities
  wFull: { width: "100%" },
  hFull: { height: "100%" },
  w12: { width: 48 },
  h12: { height: 48 },
  w16: { width: 64 },
  h16: { height: 64 },
  w20: { width: 80 },
  h20: { height: 80 },

  // Text alignment
  textCenter: { textAlign: "center" },
  textLeft: { textAlign: "left" },
  textRight: { textAlign: "right" },

  // Overflow
  hidden: { overflow: "hidden" },
});

// Component-specific styles matching web components exactly
export const componentStyles = StyleSheet.create({
  // Button styles (matching web button classes)
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  buttonTextPrimary: {
    color: COLORS.textInverse,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
  },

  // Card styles (matching web cards)
  card: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardBordered: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Input styles (matching web input classes)
  input: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },

  // Status bar (matching web exactly)
  statusBar: {
    height: 44,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  statusTime: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Tab styles (matching web tabs)
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flex: 1,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    width: "100%",
    maxWidth: 400,
    padding: SPACING["2xl"],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },

  // Activity card styles (matching web ActivityCard)
  activityCard: {
    width: 288,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginRight: SPACING.sm,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  activityMeta: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  // Section styles (matching web sections)
  section: {
    marginBottom: SPACING["4xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textDecorationLine: "underline",
  },

  // Filter styles (matching web FilterSystem)
  filterBar: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING["2xl"],
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.text,
    borderRadius: 24,
    paddingHorizontal: SPACING.lg,
    height: 48,
    gap: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text,
  },
  filterButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 24,
    paddingHorizontal: SPACING.md,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "relative",
  },

  // Badge styles
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: COLORS.textInverse,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Tag styles
  tag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  tagText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Empty state styles
  emptyState: {
    alignItems: "center",
    paddingVertical: SPACING["5xl"],
    paddingHorizontal: SPACING["4xl"],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize["2xl"],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: SPACING["2xl"],
  },
});

// Layout helpers
export const layoutStyles = StyleSheet.create({
  // Safe area (accounting for notches, etc.)
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Scroll view with padding
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 80, // Account for tab bar
  },

  // Screen dimensions
  fullScreen: {
    width: screenWidth,
    height: screenHeight,
  },
  screenWidth: {
    width: screenWidth,
  },

  // Native-like components
  nativeCard: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  nativeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  nativeButtonText: {
    color: COLORS.textInverse,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  nativeButtonSecondary: {
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nativeButtonTextSecondary: {
    color: COLORS.text,
  },
  nativeButtonDisabled: {
    backgroundColor: COLORS.textLight,
    opacity: 0.6,
  },

  // Horizontal scroll containers
  horizontalScroll: {
    paddingRight: SPACING.lg,
    gap: SPACING.sm,
  },

  // Grid layouts
  gridRow: {
    flexDirection: "row",
    gap: SPACING.lg,
  },
  gridCol2: {
    width: "45%",
  },
  gridCol3: {
    width: "30%",
  },
});

// Combine all styles for easy import
export const styles = {
  global: globalStyles,
  component: componentStyles,
  layout: layoutStyles,
};

export default styles;
