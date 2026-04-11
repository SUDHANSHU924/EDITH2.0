/**
 * EDITH Design System - Figma Tokens
 * Complete design token system extracted from Figma design
 * Color palette, typography, spacing, and component styles
 */

// ════════════════════════════════════════════════════════════════
// COLOR PALETTE - EDITH Core Colors
// ════════════════════════════════════════════════════════════════

export const COLORS = {
  // Primary Background & Void
  void: '#050505',          // Main dark background - pure black void
  
  // Primary Accents
  cyan: '#00F0FF',          // EDITH response accent, primary highlight
  red: '#FF2A4B',           // Hacker mode, alerts, danger states
  violet: '#7B61FF',        // System/data streams, secondary accent
  blue: '#0066CC',          // Deep blue for secondary info
  
  // Text Colors
  white: '#FFFFFF',         // Primary text, COMMANDER responses
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.5)',
  textTertiary: 'rgba(255,255,255,0.3)',
  textCyan: '#00F0FF',
  
  // Panel & Surface Colors
  surface: 'rgba(10,20,40,0.8)',          // Glassmorphism panels
  surfaceLight: 'rgba(10,20,40,0.6)',     // Lighter surface overlay
  surfaceDark: 'rgba(5,5,5,0.95)',        // Darker surface for sidebar
  
  // Border Colors
  border: 'rgba(0,240,255,0.15)',         // Default cyan border
  borderActive: '#00F0FF',                // Active/focused border
  borderSecondary: 'rgba(255,255,255,0.1)',
  borderRed: '#FF2A4B',
  
  // Status Colors
  statusGreen: '#00CC88',
  statusYellow: '#FFB800',
  statusRed: '#FF2A4B',
  statusViolet: '#7B61FF',
  
  // Semantic Colors
  success: '#00CC88',
  warning: '#FFB800',
  error: '#FF2A4B',
  info: '#00F0FF',
  
  // Special Effects
  glowCyan: 'rgba(0,240,255,0.2)',
  glowRed: 'rgba(255,42,75,0.2)',
  glowViolet: 'rgba(123,97,255,0.2)',
} as const;

// ════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ════════════════════════════════════════════════════════════════

export const FONTS = {
  mono: ["'JetBrains Mono'", "'Geist Mono'", 'monospace'],
  sans: ["'Inter'", "'SF Pro Text'", 'sans-serif'],
} as const;

export const TYPOGRAPHY = {
  // Display sizes
  display: {
    xl: { fontSize: '32px', lineHeight: '1.2', fontWeight: 700 },
    lg: { fontSize: '28px', lineHeight: '1.3', fontWeight: 700 },
  },
  
  // Heading sizes
  heading: {
    xl: { fontSize: '24px', lineHeight: '1.3', fontWeight: 600 },
    lg: { fontSize: '20px', lineHeight: '1.4', fontWeight: 600 },
    md: { fontSize: '16px', lineHeight: '1.4', fontWeight: 600 },
    sm: { fontSize: '14px', lineHeight: '1.5', fontWeight: 600 },
  },
  
  // Body text
  body: {
    lg: { fontSize: '16px', lineHeight: '1.6', fontWeight: 400 },
    md: { fontSize: '14px', lineHeight: '1.6', fontWeight: 400 },
    sm: { fontSize: '12px', lineHeight: '1.5', fontWeight: 400 },
    xs: { fontSize: '11px', lineHeight: '1.5', fontWeight: 400 },
  },
  
  // Monospace (code, logs, mono text)
  mono: {
    lg: { fontSize: '14px', lineHeight: '1.6', fontWeight: 500 },
    md: { fontSize: '13px', lineHeight: '1.5', fontWeight: 500 },
    sm: { fontSize: '12px', lineHeight: '1.5', fontWeight: 500 },
    xs: { fontSize: '11px', lineHeight: '1.5', fontWeight: 500 },
  },
  
  // Small caps
  caps: {
    sm: { fontSize: '10px', lineHeight: '1.4', fontWeight: 600, textTransform: 'uppercase' as const },
    xs: { fontSize: '9px', lineHeight: '1.3', fontWeight: 600, textTransform: 'uppercase' as const },
  },
} as const;

// ════════════════════════════════════════════════════════════════
// SPACING
// ════════════════════════════════════════════════════════════════

export const SPACING = {
  0: '0px',
  2: '2px',
  4: '4px',
  6: '6px',
  8: '8px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  28: '28px',
  32: '32px',
  40: '40px',
  48: '48px',
  56: '56px',
  64: '64px',
  72: '72px',
  80: '80px',
} as const;

// ════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ════════════════════════════════════════════════════════════════

export const BORDER_RADIUS = {
  none: '0px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  xxl: '16px',
  full: '9999px',
} as const;

// ════════════════════════════════════════════════════════════════
// LAYOUT DIMENSIONS
// ════════════════════════════════════════════════════════════════

export const LAYOUT = {
  // Sidebar (ORBIT)
  sidebarCollapsed: '72px',
  sidebarExpanded: '280px',
  sidebarTransition: '0.3s ease',
  
  // Right panel (PERIPHERY)
  peripheryWidth: '320px',
  
  // Top bar (HUD)
  topBarHeight: '48px',
  
  // Avatar/Badge sizes
  avatarLg: '48px',
  avatarMd: '36px',
  avatarSm: '32px',
  avatarXs: '24px',
  
  // Icon sizes
  iconLg: '24px',
  iconMd: '20px',
  iconSm: '16px',
  iconXs: '12px',
} as const;

// ════════════════════════════════════════════════════════════════
// SHADOWS & EFFECTS
// ════════════════════════════════════════════════════════════════

export const SHADOWS = {
  cyanGlow: '0 0 20px rgba(0,240,255,0.15), 0 0 40px rgba(0,240,255,0.05)',
  cyanGlowStrong: '0 0 20px rgba(0,240,255,0.3), 0 0 40px rgba(0,240,255,0.15)',
  redGlow: '0 0 20px rgba(255,42,75,0.2)',
  redGlowStrong: '0 0 20px rgba(255,42,75,0.4)',
  violetGlow: '0 0 20px rgba(123,97,255,0.2)',
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.15)',
  xl: '0 20px 25px rgba(0,0,0,0.2)',
} as const;

// ════════════════════════════════════════════════════════════════
// BACKDROP & GLASS EFFECTS
// ════════════════════════════════════════════════════════════════

export const GLASS = {
  blur: 'backdrop-filter: blur(16px)',
  blurStrong: 'backdrop-filter: blur(24px)',
  surface: {
    background: 'rgba(10, 20, 40, 0.8)',
    border: 'rgba(0, 240, 255, 0.15)',
  },
} as const;

// ════════════════════════════════════════════════════════════════
// ANIMATIONS
// ════════════════════════════════════════════════════════════════

export const ANIMATIONS = {
  // Standard durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
    slowest: '1000ms',
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ════════════════════════════════════════════════════════════════
// COMPONENT STYLES
// ════════════════════════════════════════════════════════════════

export const COMPONENTS = {
  button: {
    default: {
      background: 'transparent',
      border: `1px solid ${COLORS.border}`,
      color: 'rgba(255,255,255,0.8)',
      padding: '8px 16px',
      borderRadius: BORDER_RADIUS.lg,
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.3s ease',
    },
    hover: {
      background: 'rgba(0,240,255,0.08)',
      border: `1px solid ${COLORS.borderActive}`,
      color: COLORS.white,
    },
    active: {
      background: 'rgba(0,240,255,0.12)',
      border: `1px solid ${COLORS.borderActive}`,
      color: COLORS.white,
    },
    danger: {
      border: `1px solid ${COLORS.red}`,
      color: COLORS.red,
    },
    dangerHover: {
      background: 'rgba(255,42,75,0.1)',
    },
  },
  
  input: {
    background: 'rgba(10,20,40,0.5)',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: '8px 12px',
    fontSize: '14px',
    focusBorder: COLORS.borderActive,
    focusShadow: SHADOWS.cyanGlow,
  },
  
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: BORDER_RADIUS.lg,
    backdropFilter: 'blur(16px)',
  },
  
  badge: {
    background: 'rgba(0,240,255,0.1)',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.cyan,
    padding: '3px 8px',
    borderRadius: BORDER_RADIUS.sm,
    fontSize: '11px',
  },
  
  messageBubble: {
    commander: {
      background: 'transparent',
      border: `1px solid ${COLORS.borderSecondary}`,
      borderRadius: BORDER_RADIUS.lg,
      padding: '12px 16px',
      marginRight: '48px',
    },
    edith: {
      background: 'transparent',
      borderLeft: `1px solid ${COLORS.cyan}`,
      paddingLeft: '16px',
      marginLeft: '48px',
    },
  },
} as const;

// ════════════════════════════════════════════════════════════════
// MODULE CONFIGURATIONS
// ════════════════════════════════════════════════════════════════

export const MODULES = [
  { number: '01', name: 'AURA CORE', subtitle: 'Conversational AI', icon: '⊙' },
  { number: '02', name: 'AGENT HUB', subtitle: 'Agentic Reasoning', icon: '◎' },
  { number: '03', name: 'CODE FORGE', subtitle: 'Code Engineering', icon: '</' },
  { number: '04', name: 'FILE VAULT', subtitle: 'Document Engineering', icon: '▣' },
  { number: '05', name: 'DEEP SEARCH', subtitle: 'Research & Intel', icon: '⊕' },
  { number: '06', name: 'SELF-LEARN', subtitle: 'Knowledge Engine', icon: '⚡' },
  { number: '07', name: 'DATA LAB', subtitle: 'Data Science & ML', icon: '∿' },
  { number: '08', name: 'IoT CONTROL', subtitle: 'Smart Home & Devices', icon: '⊞' },
  { number: '09', name: 'VISION LENS', subtitle: 'Vision & Multimodal', icon: '◉' },
  { number: '10', name: 'VOICE OPS', subtitle: 'Voice Interface', icon: '♪' },
  { number: '11', name: 'PERSONALIZE', subtitle: 'Human Intelligence', icon: '◈' },
  { number: '12', name: 'SECURITY', subtitle: 'Privacy & Ethics', icon: '⌬' },
  { number: '13', name: 'DAILY OPS', subtitle: 'Everyday Tasks', icon: '☰' },
  { number: '14', name: 'HACKER MODE', subtitle: 'Restricted Access', icon: '⚠', locked: true },
  { number: '15', name: 'SATELLITE', subtitle: 'Classified Access', icon: '⬡', locked: true },
] as const;

// ════════════════════════════════════════════════════════════════
// QUICK ACTION SUGGESTIONS
// ════════════════════════════════════════════════════════════════

export const QUICK_ACTIONS = [
  'Summarize this conversation',
  'Translate to Spanish',
  'Clarify this concept',
] as const;

// ════════════════════════════════════════════════════════════════
// STATUS BADGES
// ════════════════════════════════════════════════════════════════

export const STATUS_BADGES = {
  online: { color: COLORS.statusGreen, label: 'ONLINE' },
  offline: { color: COLORS.statusRed, label: 'OFFLINE' },
  processing: { color: COLORS.cyan, label: 'PROCESSING' },
  locked: { color: COLORS.red, label: 'LOCKED' },
} as const;

// ════════════════════════════════════════════════════════════════
// EXPORT TYPE DEFINITIONS
// ════════════════════════════════════════════════════════════════

export type ColorKey = keyof typeof COLORS;
export type FontKey = keyof typeof FONTS;
export type SpacingKey = keyof typeof SPACING;
export type BorderRadiusKey = keyof typeof BORDER_RADIUS;
export type ModuleConfig = (typeof MODULES)[number];
