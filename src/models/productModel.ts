export interface ProductModel {
  _id: string;
  title: string;
  content?: string;
  shortDescription?: string;
  categories: string[];
  price?: number;
  stock?: number;
  productType: string;
  images?: string[];
  supplier_id: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  thumbnail?: string;
  SKU?: string;
  variation_ids?: string[];
}

export interface SubProductModel {
  product_id: string;
  price: number;
  thumbnail: string;
  stock?: number;
  SKU?: string;
}

export interface SubProductOptionModel {
  sub_product_id: string;
  variation_option_id: string;
}
