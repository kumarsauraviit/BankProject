import mongoose, { type Types, type Model } from 'mongoose';

const { model, models, Schema } = mongoose;

export interface CartItem {
  productId: Types.ObjectId;

  // Snapshot from Product
  name: string;
  price: number;
  quantity: number;
  image?: string;

  subtotal: number;
}
export interface addToCartDTO {
  userEmailId: string;
  productId: Types.ObjectId;
  quantity: number;
}

export interface Cart {
  userEmail: string;

  items: CartItem[];

  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;

  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<CartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    image: {
      type: String,
      trim: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

export const cartSchema = new Schema<Cart>(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    discount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index(
  { userEmail: 1 },
  { unique: true }
);

export const CartModel: Model<Cart> =
  models.Cart || model<Cart>('Cart', cartSchema);
