import { api } from './api';

export interface TableItem {
  id: string;
  tableNumber: string;
  capacity: number;
  floor: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
}

export interface ReservationItemData {
  id: string;
  reservationId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  menuItem?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
  };
}

export interface ReservationData {
  id: string;
  guestName: string;
  guestPhone: string;
  reservationTime: string;
  partySize: number;
  specialRequest?: string;
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';
  depositAmount?: number;
  depositStatus?: 'NONE' | 'PENDING' | 'PAID' | 'REFUNDED';
  tableId?: string | null;
  table?: TableItem | null;
  createdAt: string;
  reservationItems?: ReservationItemData[];
}

export const reservationService = {
  // Lấy chi tiết đơn đặt bàn theo ID
  getById: async (id: string): Promise<ReservationData> => {
    const res = await api.get(`/reservations/${id}`);
    return res.data?.data || res.data;
  },

  // Tìm đơn đặt bàn theo mã (ID hoặc tiền tố hoặc SĐT)
  getByCode: async (code: string): Promise<ReservationData> => {
    const res = await api.get(`/reservations/code/${encodeURIComponent(code)}`);
    return res.data?.data || res.data;
  },

  // Gán bàn cho đơn đặt
  assignTable: async (id: string, tableId: string): Promise<ReservationData> => {
    const res = await api.patch(`/reservations/${id}/table`, { tableId });
    return res.data?.data || res.data;
  },

  // Check-in khách vào bàn (bắt đầu phiên ăn và cập nhật trạng thái bàn sang OCCUPIED)
  checkIn: async (id: string, tableId?: string): Promise<any> => {
    const res = await api.post('/reservations/check-in', { id, tableId });
    return res.data?.data || res.data;
  },

  // Lấy danh sách tất cả các bàn trong nhà hàng
  getTables: async (): Promise<TableItem[]> => {
    const res = await api.get('/tables');
    return res.data?.data || res.data;
  },
};
