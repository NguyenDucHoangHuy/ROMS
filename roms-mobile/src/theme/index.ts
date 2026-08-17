export const theme = {
  colors: {
    primary: '#f97316',       // Orange 500
    primaryDark: '#ea580c',   // Orange 600
    primaryLight: '#ffedd5',  // Orange 100
    background: '#0f172a',   // Slate 900
    surface: '#1e293b',      // Slate 800
    card: '#334155',         // Slate 700
    border: '#475569',       // Slate 600
    text: '#f8fafc',         // Slate 50
    textMuted: '#94a3b8',    // Slate 400
    
    // Status colors
    available: '#22c55e',    // Green 500 (Bàn trống)
    reserved: '#eab308',     // Yellow 500 (Đã đặt)
    occupied: '#ef4444',     // Red 500 (Có khách)
    cleaning: '#3b82f6',     // Blue 500 (Cần dọn)

    priorityHigh: '#dc2626',
    success: '#10b981',
    error: '#f43f5e',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
  },
} as const
