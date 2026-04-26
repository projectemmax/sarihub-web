export interface DashboardStats {
  sales: number;
  orders: number;
  customers: number;
  pendingReviews: number;
}

export interface Analytics {
  timeline: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  totalRevenue: number;
  totalOrders: number;
  growth: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  sold: number;
}

export interface LatestCustomer {
  id: string;
  email: string;

  customer: {
    firstName: string;
    lastName: string;
  };
}

export interface PendingReview {
  id: string;
  rating: number;
  comment?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';

  createdAt: string;

  product: {
    name: string;
  };

  user: {
    customer?: {
      firstName: string;
      lastName: string;
    };
  };

  images?: {
    url: string;
  }[];
}