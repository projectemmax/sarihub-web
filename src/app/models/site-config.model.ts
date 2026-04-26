// models/site-config.model.ts
export interface SiteConfig {
  siteName: string;
  logoUrl: string;
  enableCheckout: boolean;
  enableCOD: boolean;
  currency: string;
}