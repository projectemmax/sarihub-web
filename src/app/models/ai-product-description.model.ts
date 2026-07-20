export interface GenerateProductDescriptionRequest {
    name: string;
    category?: string;
    brand?: string;
    features?: string[];
    specifications?: string[];
}

export interface GeneratedProductDescription {
    description: string;
    shortDescription: string;
    seoDescription: string;
    tags: string[];
}
