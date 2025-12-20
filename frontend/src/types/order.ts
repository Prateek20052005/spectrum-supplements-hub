export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid";

export interface OrderItem {
  productId: string;
  name?: string;
  flavour?: string | null;
  price?: number;
  quantity: number;
}

export interface DeliveryAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Order {
  _id: string;
  userId?: {
    _id: string;
    fullName?: string;
    email?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress?: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress?: DeliveryAddress;
}
