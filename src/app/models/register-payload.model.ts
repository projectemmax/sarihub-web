export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    gender?: string | null;
    password: string;
}