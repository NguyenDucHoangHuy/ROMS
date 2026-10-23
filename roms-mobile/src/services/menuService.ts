import { api } from './api';

export interface CategoryData {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MenuItemData {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  isAvailable: boolean;
  category?: CategoryData;
}

export const menuService = {
  // Lấy danh mục món ăn
  getCategories: async (): Promise<CategoryData[]> => {
    const res = await api.get('/categories');
    return res.data?.data || res.data || [];
  },

  // Lấy danh sách toàn bộ món ăn
  getMenuItems: async (categoryId?: string): Promise<MenuItemData[]> => {
    const params = categoryId ? { categoryId } : {};
    const res = await api.get('/menu-items', { params });
    return res.data?.data || res.data || [];
  },
};

