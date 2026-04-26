export interface ProductImage {
  id?: string;          // ✅ FIX
  file?: File | null;   // ✅ FIX
  preview: string;
  isPrimary: boolean;
  order?: number;
  isNew?: boolean;      // ✅ FIX
}