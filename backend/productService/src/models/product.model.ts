import { model, models, Schema, type Types } from 'mongoose';

export interface Product {
  restaurantId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  restaurantId: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
}

const productSchema = new Schema<Product>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ restaurantId: 1 });

export const ProductModel = models.Product || model<Product>('Product', productSchema);
