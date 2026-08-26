import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { type addToCartDTO, type CreateProductDTO } from '@project/mongodb';
import { ProductService, productService } from '../services/product.service.js';

const { Types } = mongoose;


function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export class ProductController {


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

  async findProduct(req:Request,res:Response,next:NextFunction):Promise<void>{
    try{
       const {name} = req.body;
       if(!isRecord(name)){
        res.status(400).json({
          success:false,
          error:'Invalid product data'
        })
        return;
       }
       const product = await productService.FindByName(name.toString().trim().toLocaleLowerCase());
       res.status(200).json({
        success: true,
        data: { product },
       })

    }
    catch(error){
      next(error)
    }
  }
}

export const productController = new ProductController();
