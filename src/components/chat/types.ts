export interface ProductType {
  id: string;
  title: string;
  price: string;
  category: string;
  brand: string;
  features: string;
  ageRange: string;
  topCategory: string;
  secondaryCategory: string;
  fullDescription: string;
  image?: string;
  url?: string;
}

export interface ApiRelatedProduct {
  sku: string;
  name: string;
  description: string;
  brand_default_store: string;
  features: string;
  recom_age: string;
  top_category: string;
  secondary_category: string;
  action: string;
  url: string;
  image: string;
  objectID: string;
  price?: string;
}

export interface ApiResponse {
  answer: string;
  relatedProducts: ApiRelatedProduct[];
} 