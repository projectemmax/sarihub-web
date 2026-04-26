export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: 'ADMIN' | 'CUSTOMER';
  };
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    role?: 'CUSTOMER' | 'ADMIN';
}

export interface JwtPayload {
  sub: string; // ✅ JWT standard (user id)
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  exp: number;
}