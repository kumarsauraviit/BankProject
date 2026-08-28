import {
  CartModel,
  ProductModel,
  PostModel,
  CommentModel,
  type Cart,
  type CreateProductDTO,
  type CreatePostDTO,
  type Product,
  type addToCartDTO,
  type Post,
  type Comment,
  type CreateCommentDTO,
} from '@project/mongodb';

import v2 from '../config/cloudinary.js';
import type { UploadApiResponse } from "cloudinary";
type HttpError = Error & { statusCode?: number };

function createHttpError(message: string, statusCode: number): HttpError {
  const error: HttpError = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export class ProductService {
  async addProduct(data: CreateProductDTO): Promise<Product> {
    return ProductModel.create(data);
  }

  async removeProduct(id: string): Promise<Product> {
    const product = await ProductModel.findByIdAndDelete(id).exec();
    if (!product) {
      throw createHttpError('Product not found', 404);
    }

    return product;
  }

  async addToCart(data: addToCartDTO): Promise<Cart> {
    const userEmail = data.userEmailId.trim().toLowerCase();
    const product = await ProductModel.findById(data.productId).exec();

    if (!product) {
      throw createHttpError('Product not found', 404);
    }

    if (!product.isAvailable) {
      throw createHttpError('Product is currently unavailable', 409);
    }

    let cart = await CartModel.findOne({ userEmail }).exec();

    if (!cart) {
      const subtotal = product.price * data.quantity;
      return CartModel.create({
        userEmail,
        items: [
          {
            productId: data.productId,
            name: product.name,
            price: product.price,
            quantity: data.quantity,
            ...(product.image !== undefined ? { image: product.image } : {}),
            subtotal,
          },
        ],
        subtotal,
        deliveryFee: 0,
        tax: 0,
        discount: 0,
        totalAmount: subtotal,
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === data.productId.toString(),
    );

    if (existingItem) {
      existingItem.quantity += data.quantity;
      existingItem.subtotal = existingItem.price * existingItem.quantity;
    } else {
      cart.items.push({
        productId: data.productId,
        name: product.name,
        price: product.price,
        quantity: data.quantity,
        ...(product.image !== undefined ? { image: product.image } : {}),
        subtotal: product.price * data.quantity,
      });
    }

    cart.subtotal = cart.items.reduce((total, item) => total + item.subtotal, 0);
    cart.totalAmount = cart.subtotal + cart.deliveryFee + cart.tax - cart.discount;

    await cart.save();
    return cart;
  }

  async FetchCart(email: string): Promise<Cart> {
    const cart = await CartModel.findOne({
      userEmail: email.trim().toLowerCase(),
    }).exec();

    if (!cart) {
      throw createHttpError('Cart not found', 404);
    }

    return cart;
  }
  async FindByName(name: string): Promise<Product[]> {
    const words = name.trim().split(/\s+/);

    const products = await ProductModel.find({
      name: {
        $regex: `^${words.map(word => `(?=.*${word})`).join('')}`,
        $options: "i"
      }
    }).exec();

    if (products.length === 0) {
      throw createHttpError("Product not found", 404);
    }

    return products;
  }
  async PostImages(data: CreatePostDTO): Promise<Post> {
    const post = await PostModel.create(data);
    return post;
  }

  // this upload the file on the cloudinary and return the url of the file
  async UploadOnCloudinary(
    buffer: Buffer
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          folder: "posts",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          if (!result) {
            reject(new Error("Cloudinary upload failed"));
            return;
          }

          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });
  }
  async addComment(data: CreateCommentDTO): Promise<Comment> {
    const comment = await CommentModel.create(data);
    return comment;
  }

}

export const productService = new ProductService();
