/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

/**
 * Full Order database entity
 */
export interface Order {
  id: string;
  cart_id: string;
  user_id: string;
  order_date: Date;
  status: OrderStatus;
  total_amount: number;
  discount_percentage: number;
  total_to_pay_after_discount: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Data Transfer Object for creating a new order
 */
export interface CreateOrderDTO {
  user_id: string;
  cart_id: string;
  order_date: Date;
  status: OrderStatus;
  total_amount: number;
  discount_percentage: number;
  total_to_pay_after_discount: number;
}
