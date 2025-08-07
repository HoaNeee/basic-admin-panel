export interface BlogModel {
  _id?: string;
  user_id?: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  slug?: string;
  tags: string[];
  readTime: number;
  status: "draft" | "published";
  deleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
