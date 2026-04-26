export interface CustomerProfile {
  id: string;
  userId: string;

  firstName: string;
  lastName: string;
  email: string;

  mobileNo?: string;
  birthdate?: string;
  gender?: string;

  address?: string;
  city?: string;
  province?: string;

  avatar?: string;

  createdAt: string;
  updatedAt: string;
}