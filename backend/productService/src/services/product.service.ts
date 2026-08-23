import { ProductModel, type CreateProductDTO, type Product } from '../models/product.model.js';

export class ProductService {
  async addProduct(data: CreateProductDTO): Promise<Product> {
    return ProductModel.create(data);
  }

  async removeProduct(id: string): Promise<Product> {
    const product = await ProductModel.findByIdAndDelete(id).exec();
    if (!product) {
      const error = new Error('Product not found');
      (error as Error & { statusCode?: number }).statusCode = 404;
      throw error;
    }

    return product;
  }
}

export const productService = new ProductService();
