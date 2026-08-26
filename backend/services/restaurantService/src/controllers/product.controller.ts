import type { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { type addToCartDTO, type CreateProductDTO } from '@project/mongodb';
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


   
}

export const productController = new ProductController();
