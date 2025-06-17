export interface Supplier {
  name: string;
  product: string;
  category: string[];
  price: number;
  contact: string;
  isTaking: number;
  email: string;
  deleted: boolean;
  _id: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  slug: string;
  __v: number;
}
