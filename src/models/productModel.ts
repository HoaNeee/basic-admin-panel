import type { RcFile } from "antd/es/upload";
import type { CategoryModel } from "./categoryModel";

export interface ProductModel {
  _id: string;
  title: string;
  content?: string;
  shortDescription?: string;
  categories: string[];
  price?: number | string;
  cost?: number | string;
  stock?: number | string;
  productType: "simple" | "variations";
  images?: string[];
  supplier_id: string;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  slug: string;
  thumbnail?: string;
  SKU?: string;
  variation_ids?: string[];
  rangeStock?: number;
  rangePrice?: {
    min: number;
    max: number;
  };
}

export interface SubProductModel {
  product_id?: string;
  price?: number | string;
  thumbnail?: string | RcFile | File;
  stock?: number | string;
  SKU?: string;
  key_combi?: string;
  sub_product_id?: string;
  discountedPrice?: number | string;
  cost?: number | string;
}

export interface SubProductOptionModel {
  sub_product_id: string;
  variation_option_id: string;
}

export interface ITopSell extends ProductModel {
  soldQuantity: number;
  orderedPrice: number;
  SKU: string;
  options: string[];
  title: string;
  remaining: number;
  product_id: string;
  categories_info: CategoryModel[];
}
