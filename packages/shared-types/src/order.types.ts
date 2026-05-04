export enum OrderStatus {
  PENDING = 'pending',
  PAYMENT_PROCESSING = 'payment_processing',
  PAID = 'paid',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTO = 'crypto',
}

export interface Order {
  id: string;
  lotId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  amount: number;
  paymentMethod: PaymentMethod | null;
  shippingAddress: ShippingAddress | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderDto {
  lotId: string;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
}
