import type { RcFile } from "antd/es/upload";
import type { CategoryModel } from "./categoryModel";
import type { VariationOptionModel } from "./variationModel";

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
  status?: string;
  count_sub_product?: number;
  categories_info?: CategoryModel[];
  deletedAt?: string;
  supplierName?: string;
}

export interface SubProductModel {
  _id?: string;
  product_id?: string;
  price?: number | undefined;
  thumbnail?: string | RcFile | File;
  stock?: number | undefined;
  SKU?: string;
  key_combi?: string;
  createPurchaseOrder?: boolean;
  sub_product_id?: string;
  discountedPrice?: number | undefined;
  cost?: number | string;
  options?: VariationOptionModel[] | string;
  thumbnail_product?: string;
  title?: string;
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
