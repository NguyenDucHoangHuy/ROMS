/**
 * Format ISO date string thành ngày theo locale vi-VN.
 * @example formatDate("2024-01-15T10:30:00Z") → "15/01/2024"
 */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

/**
 * Format ISO datetime string thành ngày + giờ.
 * @example formatDateTime("2024-01-15T10:30:00Z") → "15/01/2024, 17:30"
 */
export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

/**
 * Format thời gian ngắn (chỉ giờ:phút).
 * @example formatTime("2024-01-15T10:30:00Z") → "17:30"
 */
export function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

/**
 * Tính thời gian đã trôi qua dạng relative (dùng cho KDS).
 * @example timeAgo(new Date(Date.now() - 5 * 60 * 1000)) → "5 phút trước"
 */
export function timeAgo(date: Date | string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return `${diffSec}s`
  if (diffMin < 60) return `${diffMin} phút`
  return formatTime(new Date(date).toISOString())
}
