import { ProductModel, type CreateProductDTO, type Product } from '../models/product.model.js';
import { CartModel, type addToCartDTO, type Cart } from '../models/cart.model.js';


export class ProductService {
  async addProduct(data: CreateProductDTO): Promise<Product> {
    return ProductModel.create(data);
  }

  async addToCart(data: addToCartDTO) {
    const {
      userEmailId,
      productId,
      quantity,
    } = data;

    // 1. Find product
    const product = await ProductModel.findById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // 2. Check availability
    if (!product.isAvailable) {
      throw new Error('Product is currently unavailable');
    }

    // 3. Find user cart
    let cart = await CartModel.findOne({
      userEmail: userEmailId.trim().toLowerCase().toString(),
    });

    // 4. Create cart if not exists
    if (!cart) {
      const subtotal = product.price * quantity;

      cart = await CartModel.create({
        userEmail: userEmailId.trim().toLowerCase(),
        items: [
          {
            productId,
            name: product.name,
            price: product.price,
            quantity,
            ...(product.image !== undefined && {
              image: product.image,
            }),
            subtotal,
          },
        ],

        subtotal,
        deliveryFee: 0,
        tax: 0,
        discount: 0,
        totalAmount: subtotal,
      });

      return cart;
    }

    // 6. Check if product exists in cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId.toString()
    );
    if (existingItem) {
      existingItem.quantity += quantity;

      existingItem.subtotal =
        existingItem.price * existingItem.quantity;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        ...(product.image !== undefined && {
          image: product.image,
        }),
        subtotal: product.price * quantity,
      });
    }

    // 7. Recalculate totals
    cart.subtotal = cart.items.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    cart.totalAmount =
      cart.subtotal + cart.deliveryFee + cart.tax - cart.discount;

    await cart.save();

    return cart;
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

  async FetchCart(email: string): Promise<Cart> {
    const cart = await CartModel.findOne({
      userEmail: email.trim().toLowerCase().toString(),
    })
    if (!cart) {
      throw new Error('Cart not found');
    }
    return cart;
  }
}

export const productService = new ProductService();
