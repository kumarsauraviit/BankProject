import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { type addToCartDTO, type CreatePostDTO, type PostMedia, type CreateCommentDTO } from '@project/mongodb';
import { productService } from '../services/product.service.js';

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

  async postImages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id, caption } = req.body;

      const files = req.files as Express.Multer.File[];

      if (!id) {
        res.status(400).json({
          success: false,
          error: "Please provide user id",
        });
        return;
      }

      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          error: "Please provide a valid user id",
        });
        return;
      }

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: "Please provide at least one image",
        });
        return;
      }

      if (caption !== undefined && typeof caption !== "string") {
        res.status(400).json({
          success: false,
          error: "Caption must be a string",
        });
        return;
      }

      const uploadedFiles: PostMedia[] = await Promise.all(
        files.map(async (file) => {
          const result =
            await productService.UploadOnCloudinary(file.buffer);

          return {
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
          };
        })
      );

      const postData: CreatePostDTO = {
        userId: id,
        caption,
        media: uploadedFiles,
      };

      const post = await productService.PostImages(postData);

      res.status(201).json({
        success: true,
        data: {
          post,
        },
      });
    } catch (error) {
      next(error);
    }
  }


  async findProduct(req: Request<{ postId: string }>, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.body;
      if (!isRecord(name)) {
        res.status(400).json({
          success: false,
          error: 'Invalid product data'
        })
        return;
      }
      const product = await productService.FindByName(name.toString().trim().toLocaleLowerCase());
      res.status(200).json({
        success: true,
        data: { product },
      })

    }
    catch (error) {
      next(error)
    }
  }

  async comment(req: Request, res: Response, next: NextFunction): Promise<void> {


    try {
      const { userId, comment } = req.body;
      if (comment.length() == 0) {
        res.status(400).json({
          success: false,
          error: "Comment is required",
        })
        return;
      }
      const postId = Array.isArray(req.query.productId)
        ? req.query.productId[0]
        : req.query.productId;
      if (typeof postId !== 'string' || !Types.ObjectId.isValid(postId)) {
        res.status(400).json({
          success: false,
          error: 'Valid Product ID is required',
        });
        return;
      }

      const Comment: CreateCommentDTO = {
        postId: new Types.ObjectId(postId),
        userId: new Types.ObjectId(userId),
        text: comment,
      }
      const post = await productService.addComment(Comment);

      res.status(201).json({
        success: true,
        data: {
          post,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
