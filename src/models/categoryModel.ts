export interface CategoryModel {
  _id: string;
  title: string;
  description: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  slug: string;
  __v: number;
  parent_id: string;
}
