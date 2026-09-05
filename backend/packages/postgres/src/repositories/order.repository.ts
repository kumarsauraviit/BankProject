import type { PoolClient } from 'pg';
import { getPostgresPool } from '../connection.js';
import type { Order, OrderStatus, CreateOrderDTO } from '../models/order.model.js';

export class OrderRepository {
    async createOrder(data: CreateOrderDTO, client?: PoolClient): Promise<Order> {
        const query = `
            INSERT INTO orders (user_id, cart_id, order_date, status, total_amount, discount_percentage, total_to_pay_after_discount)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, cart_id, user_id, order_date, status, total_amount, discount_percentage, total_to_pay_after_discount, created_at, updated_at;
        `;
        const values = [data.user_id, data.cart_id, data.order_date, data.status, data.total_amount, data.discount_percentage, data.total_to_pay_after_discount];
        const db = client || getPostgresPool();
        const result = await db.query<Order>(query, values);
        const order = result.rows[0];
        if (!order) {
            throw new Error('Failed to create order record');
        }
        return order;
    }

    async findById(id: string, client?: PoolClient): Promise<Order | null> {
        const query = `
            SELECT id, cart_id, user_id, order_date, status, total_amount, discount_percentage, total_to_pay_after_discount, created_at, updated_at
            FROM orders
            WHERE id = $1
            LIMIT 1;
        `;
        const db = client || getPostgresPool();
        const result = await db.query<Order>(query, [id]);
        return result.rows[0] || null;
    }

    async findByUserId(userId: string, client?: PoolClient): Promise<Order[] | null> {
        const query = `
            SELECT id, cart_id, user_id, order_date, status, total_amount, discount_percentage, total_to_pay_after_discount, created_at, updated_at
            FROM orders
            WHERE user_id = $1
            ORDER BY order_date DESC;
        `;
        const db = client || getPostgresPool();
        const result = await db.query<Order>(query, [userId]);
        return result.rows || null;
    }

    async updateStatus(id: string, status: OrderStatus, client?: PoolClient): Promise<Order | null> {
        const query = `
            UPDATE orders
            SET status = $1,
                updated_at = (NOW() AT TIME ZONE 'UTC')
            WHERE id = $2
            RETURNING id, cart_id, user_id, order_date, status, total_amount, discount_percentage, total_to_pay_after_discount, created_at, updated_at;
        `;
        const db = client || getPostgresPool();
        const result = await db.query<Order>(query, [status, id]);
        return result.rows[0] || null;
    }
}

export const orderRepository = new OrderRepository();
// Alias for backward compatibility if needed
export { OrderRepository as OrderResetRepository, orderRepository as oderResetRepository };
