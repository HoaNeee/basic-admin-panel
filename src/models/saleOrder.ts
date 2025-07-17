export interface SaleOrder {
  _id: string;
  user_id: string;
  products: ProductSaleOrder[];
  promotion: Promotion;
  shippingAddress: ShippingAddress;
  totalPrice: number;
  status: string;
  orderNo: string;
  paymentMethod: string;
  estimatedDelivery: string;
  paymentStatus: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
}

export interface ProductSaleOrder {
  title: string;
  price: number;
  thumbnail: string;
  options: string[];
  quantity: number;
  cost: number;
  SKU: string;
  _id: string;
}

interface Promotion {
  promotionType: string;
  value: string;
  code: string;
  _id: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  phone: string;
  _id: string;
}

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
}
