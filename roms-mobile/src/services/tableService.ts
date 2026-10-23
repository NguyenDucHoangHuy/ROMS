import { api } from './api';

export interface TableReservation {
  id: string;
  guestName: string;
  guestPhone: string;
  reservationTime: string;
  partySize: number;
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED';
  specialRequest?: string;
}

export interface TableDiningSession {
  id: string;
  sessionCode: string;
  customerCount: number;
  status: 'OPEN' | 'PAYING' | 'CLOSED';
  startTime: string;
}

export interface TableData {
  id: string;
  tableNumber: string;
  floor: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
  qrCodeToken?: string;
  diningSessions?: TableDiningSession[];
  reservations?: TableReservation[];
}

export const tableService = {
  // Lấy tất cả các bàn trong nhà hàng (kèm session và reservation đang hoạt động)
  getAll: async (): Promise<TableData[]> => {
    const res = await api.get('/tables');
    return res.data?.data || res.data || [];
  },

  // Lấy chi tiết một bàn
  getById: async (id: string): Promise<TableData> => {
    const res = await api.get(`/tables/${id}`);
    return res.data?.data || res.data;
  },

  // Cập nhật trạng thái bàn (AVAILABLE, OCCUPIED, RESERVED, CLEANING)
  updateStatus: async (
    id: string,
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING'
  ): Promise<TableData> => {
    const res = await api.patch(`/tables/${id}/status`, { status });
    return res.data?.data || res.data;
  },
};

