import type { CustomerModel } from "./customerModel";
import type { ProductModel } from "./productModel";

export interface ReviewModel {
  images: string[];
  _id: string;
  user_id: string;
  product_id: string;
  title: string;
  content: string;
  star: number;
  customer: CustomerModel;
  product: ProductModel;
  commentCount: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentModel {
  _id: string;
  user_id: string;
  product_id: string;
  review_id: string;
  parent_id: string;
  content: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  customer: CustomerModel;
}
