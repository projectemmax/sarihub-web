export interface BreadcrumbItem {
  label: string;
  url?: string | any[];
  queryParams?: Record<string, any>;
}