export type TableStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING'

export interface Table {
  id: string
  name: string          // Ví dụ: "B01", "VIP-01"
  capacity: number
  floor: number         // Tầng / khu vực
  zone: string          // "INDOOR" | "OUTDOOR" | "VIP"
  status: TableStatus
  currentOrderId: string | null
  xPosition: number     // Vị trí trong sơ đồ 2D
  yPosition: number
  createdAt: string
  updatedAt: string
}

export interface TableMapData {
  tables: Table[]
  floors: number[]
  zones: string[]
}

/** Payload dùng cho Waiter khi merge/split bàn */
export interface MergeTablesPayload {
  sourceTableIds: string[]
  targetTableId: string
}
