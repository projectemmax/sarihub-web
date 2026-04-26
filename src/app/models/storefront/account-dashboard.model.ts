export interface OrderStats {
  total: number;
  toShip: number;
  shipped: number;
  delivered: number;
}

export interface RecentOrder {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export interface Address {
  id: string;
  customerId: string;

  name: string;
  phone: string;

  address: string;
  barangay: string;
  city: string;
  province: string;
  region: string;

  regionCode: string;
  provinceCode: string;
  cityCode: string;

  isDefault: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface AccountDashboard {
  orderStats: OrderStats;
  recentOrders: RecentOrder[];
  defaultAddress: Address | null;
}