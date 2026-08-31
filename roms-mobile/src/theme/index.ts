// ROMS Brand Palette & Design Tokens — Flavoro Vibrant Warm Orange
export const theme = {
  colors: {
    // Primary Brand (Màu cam chính xác từ bản thiết kế)
    primary: '#EB5A24',        // Cam tươi rực rỡ
    primaryDark: '#f16734ff',    // Cam đậm tương phản cao cho Button chính
    primaryLight: '#FFF4ED',   // Cam kem nhạt cho thẻ Occupied & Active Tab
    primaryMid: '#F57842',     // Cam sáng bổ trợ

    // Surfaces & Backgrounds
    background: '#F9F8F5',    // Nền kem sứ ngọc trai
    surface: '#FFFFFF',        // Nền thẻ trắng tinh khiết
    surfaceSubtle: '#FCFAF7',  // Nền thẻ phụ
    surfaceAlt: '#F5F0E8',     // Nền button phụ
    overlay: 'rgba(28, 25, 23, 0.5)',

    // Text Colors
    text: '#1C1917',           // Đen than đá tương phản cao
    textSecondary: '#57534E',  // Xám trầm
    textMuted: '#A8A29E',      // Xám khói
    textOnPrimary: '#FFFFFF',  // Trắng trên nền cam

    // Borders & Dividers
    border: '#E7E5E4',
    borderLight: '#F5F5F4',
    borderDark: '#D6D3D1',

    // Table Status
    occupied: '#EB5A24',       // Cam — Bàn có khách
    occupiedBg: '#FFF4ED',
    occupiedBorder: '#FED2BA',

    available: '#16A34A',      // Xanh lá — Bàn trống
    availableBg: '#F0FDF4',
    availableBorder: '#BBF7D0',

    reserved: '#2563EB',       // Xanh dương — Bàn đặt trước
    reservedBg: '#EFF6FF',
    reservedBorder: '#BFDBFE',

    cleaning: '#78716C',       // Xám khói — Bàn đang dọn
    cleaningBg: '#F5F5F4',
    cleaningBorder: '#E7E5E4',

    // Semantic Status
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#0284C7',

    // Navigation Tabs
    tabActive: '#EB5A24',
    tabInactive: '#78716C',
  },

  // Hệ màu trạng thái món ăn bằng Tiếng Anh (Order Item Statuses)
  dishStatus: {
    PENDING: {
      label: 'Pending',
      text: '#D97706',
      bg: '#FEF3C7',
      border: '#FDE68A',
    },
    COOKING: {
      label: 'Cooking',
      text: '#EB5A24',
      bg: '#FFF4ED',
      border: '#FED2BA',
    },
    READY: {
      label: 'Ready',
      text: '#15803D',
      bg: '#DCFCE7',
      border: '#86EFAC',
    },
    SERVED: {
      label: 'Served',
      text: '#78716C',
      bg: '#F5F5F4',
      border: '#E7E5E4',
    },
    REJECTED: {
      label: 'Rejected',
      text: '#DC2626',
      bg: '#FEE2E2',
      border: '#FECACA',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 26,
    full: 9999,
  },

  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  shadow: {
    sm: {
      shadowColor: '#1C1917',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#EB5A24',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.14,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#1C1917',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
      elevation: 6,
    },
  },
} as const;