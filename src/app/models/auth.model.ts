export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;

  user: {
    id: string;
    email: string;

    role:
      | 'ADMIN'
      | 'SELLER'
      | 'CUSTOMER';
  };
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    role?: 'CUSTOMER' | 'ADMIN' | 'SELLER';
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER';
  exp: number;
}