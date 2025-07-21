export interface NotificationModel {
  _id: string;
  type: string;
  title: string;
  body: string;
  ref_id: string;
  ref_link: string;
  image: string;
  receiver: string;
  isRead: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
