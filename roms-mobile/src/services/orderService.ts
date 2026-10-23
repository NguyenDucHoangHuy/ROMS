import { api } from './api';

export type OrderItemStatus = 'PENDING' | 'COOKING' | 'READY' | 'SERVED' | 'REJECTED';

export interface OrderItemData {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  itemStatus: OrderItemStatus;
  notes?: string;
  menuItem: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    description?: string;
  };
}

export interface ActiveOrderData {
  id: string;
  sessionId: string;
  status: 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  orderItems: OrderItemData[];
  session?: {
    id: string;
    sessionCode: string;
    customerCount: number;
    status: string;
    table?: {
      id: string;
      tableNumber: string;
      floor: number;
    };
  };
}

export const orderService = {
  // Lấy đơn hàng đang hoạt động của bàn
  getActiveByTable: async (tableId: string): Promise<ActiveOrderData | null> => {
    try {
      const res = await api.get(`/orders/table/${tableId}/active`);
      return res.data?.data || res.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  // Tạo đơn gọi món mới cho bàn (tự động mở session nếu chưa mở)
  create: async (data: {
    tableId: string;
    items: { menuItemId: string; quantity: number; notes?: string }[];
  }): Promise<ActiveOrderData> => {
    const res = await api.post('/orders', data);
    return res.data?.data || res.data;
  },

  // Thêm món vào đơn hàng đang có
  addItems: async (
    orderId: string,
    items: { menuItemId: string; quantity: number; notes?: string }[]
  ): Promise<ActiveOrderData> => {
    const res = await api.post(`/orders/${orderId}/items`, { items });
    return res.data?.data || res.data;
  },

  // Cập nhật trạng thái món (ví dụ: nhân viên phục vụ bấm SERVE)
  updateItemStatus: async (
    orderId: string,
    itemId: string,
    status: OrderItemStatus
  ): Promise<any> => {
    const res = await api.patch(`/orders/${orderId}/items/${itemId}/status`, {
      status,
    });
    return res.data?.data || res.data;
  },
};

