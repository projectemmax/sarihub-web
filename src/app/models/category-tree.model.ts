export interface CategoryNode {
  id: string;
  name: string;
  children: CategoryNode[];
}

export interface AdminCategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;

  childCount: number;
  descendantCount: number;

  children: AdminCategoryNode[];
}

export interface CategoryTreeRow {
    id: string;
    name: string;
    isActive: boolean;

    level: number;

    expanded: boolean;
    hasChildren: boolean;

    childCount: number;
    descendantCount: number;

    parentName?: string;
    fullPath?: string;
}

export interface CategoryOption {
    id: string;
    label: string;
}