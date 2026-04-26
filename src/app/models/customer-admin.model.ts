export interface AdminCustomer {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;

  customer: {
    firstName: string;
    lastName: string;
    mobileNo: string;
    city?: string;
    province?: string;
  } | null;
}

export interface AdminCustomerResponse {
  result: boolean;
  data: AdminCustomer[];
}
