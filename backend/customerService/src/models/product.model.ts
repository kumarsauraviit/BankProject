import {
  model,
  models,
  Schema,
  type Types,
  type Model,
} from 'mongoose';


export interface CreateProductDTO {
  restaurantId: Types.ObjectId;

  name: string;
  description?: string;

  price: number;

  category: string;

  image?: string;
}

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
      trim: true,
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

export const ProductModel: Model<Product> =
  models.Product || model<Product>('Product', productSchema);

