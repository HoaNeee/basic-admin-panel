export interface PromotionModel {
  _id: string;
  title: string;
  description: string;
  code: string;
  startAt?: string | Date;
  endAt?: string | Date;
  promotionType: string;
  value: number;
  maxUse: number;
  thumbnail: string;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
