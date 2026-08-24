import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { type CreateProductDTO } from '../models/product.model.js';
import { type addToCartDTO } from '../models/cart.model.js';
import { productService } from '../services/product.service.js';


function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export class ProductController {
  async addProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body: unknown = req.body;
      if (!isRecord(body)) {
        res.status(400).json({ success: false, error: 'Invalid product data' });
        return;
      }

      const { restaurantId, name, description, price, category, image } = body;

      if (!restaurantId || !name || price === undefined || !category) {
        res.status(400).json({ success: false, error: 'Restaurant ID, name, price, and category are required' });
        return;
      }

      if (typeof restaurantId !== 'string' || !Types.ObjectId.isValid(restaurantId)) {
        res.status(400).json({ success: false, error: 'Restaurant ID must be a valid MongoDB ObjectId' });
        return;
      }

      if (typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ success: false, error: 'Name must be a non-empty string' });
        return;
      }

      if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
        res.status(400).json({ success: false, error: 'Price must be a number greater than or equal to 0' });
        return;
      }

      if (typeof category !== 'string' || category.trim() === '') {
        res.status(400).json({ success: false, error: 'Category must be a non-empty string' });
        return;
      }

      if (description !== undefined && typeof description !== 'string') {
        res.status(400).json({ success: false, error: 'Description must be a string' });
        return;
      }

      if (image !== undefined && typeof image !== 'string') {
        res.status(400).json({ success: false, error: 'Image must be a string' });
        return;
      }

      const productData: CreateProductDTO = {
        restaurantId: new Types.ObjectId(restaurantId),
        name: name.trim(),
        price,
        category: category.trim(),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(image !== undefined ? { image } : {}),
      };

      const product = await productService.addProduct(productData);
      res.status(201).json({ success: true, data: { product } });
    } catch (error) {
      next(error);
    }
  }

  async removeProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || !Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, error: 'Product ID must be a valid MongoDB ObjectId' });
        return;
      }

      await productService.removeProduct(id);
      res.status(200).json({ success: true, message: 'Product removed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async addToCart(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body: unknown = req.body;

      if (!isRecord(body)) {
        res.status(400).json({
          success: false,
          error: 'Invalid cart data',
        });
        return;
      }

      const {
        userEmailId,
        productId,
        quantity,
      } = body;

      // Validate email
      if (
        typeof userEmailId !== 'string' ||
        userEmailId.trim().length === 0
      ) {
        res.status(400).json({
          success: false,
          error: 'User Email is required',
        });
        return;
      }

      // Validate product ID
      if (
        typeof productId !== 'string' ||
        !Types.ObjectId.isValid(productId)
      ) {
        res.status(400).json({
          success: false,
          error: 'Product ID must be a valid MongoDB ObjectId',
        });
        return;
      }

      // Validate quantity
      if (
        typeof quantity !== 'number' ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isInteger(quantity)
      ) {
        res.status(400).json({
          success: false,
          error: 'Quantity must be a positive integer',
        });
        return;
      }

      const cartData: addToCartDTO = {
        userEmailId: userEmailId.trim().toLowerCase(),
        productId: new Types.ObjectId(productId),
        quantity,
      };

      const cart = await productService.addToCart(cartData);

      res.status(200).json({
        success: true,
        data: {
          cart,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string' || email.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Email is required'
        })
        return;
      }
      const cart = await productService.FetchCart(email.trim().toLowerCase());
      res.status(200).json({
        success: true,
        data: { cart }
      })
    }
    catch (error) {
      next(error);
    }
  }
  async postReel(req: Request, res: Response, next: NextFunction): Promise<void> {

    try {

    }
    catch (error) {
      next(error);
    }
  }

}

export const productController = new ProductController();
