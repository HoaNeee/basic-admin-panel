export interface PurchaseOrderModel {
  _id: string;
  products: POProduct[];
  status: string;
  supplier_id: string;
  typePurchase: string;
  templateProduct?: POProduct;
  totalCost: number;
  expectedDelivery: Date;
  receivedAt: Date;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface POProduct {
  SKU: string;
  quantity: number;
  unitCost: number;
  title: string;
  price: number;
  _id: string;
}
