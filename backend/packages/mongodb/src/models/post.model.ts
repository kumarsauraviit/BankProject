import mongoose, { Types, type Model } from 'mongoose';

const { model, models, Schema } = mongoose;

/* -------------------- Interfaces -------------------- */

export interface PostMedia {
  publicId: string;
  url: string;
  width: number;
  height: number;
}

export interface CreatePostDTO {
  userId: string;
  caption?: string;
  media: PostMedia[];
}

export interface Post {
  _id: Types.ObjectId;
  userId: number;

  caption?: string;

  media: PostMedia[];
  likesCount: number;
  commentsCount: number;

  createdAt: Date;
  updatedAt: Date;
}


const postMediaSchema = new Schema<PostMedia>(
  {
    publicId: {
      type: String,
      required: true,
      trim: true,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    width: {
      type: Number,
      required: true,
      min: 1,
    },

    height: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

/* -------------------- Post Schema -------------------- */

export const postSchema = new Schema<Post>(
  {
    _id: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: Number,
      required: true,
      index: true,
    },

    caption: {
      type: String,
      trim: true,
      maxlength: 2200,
    },

    media: {
      type: [postMediaSchema],
      required: true,
      validate: {
        validator: (value: PostMedia[]) => value.length > 0,
        message: 'Post must contain at least one media file',
      },
    },

    likesCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    commentsCount: {
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

/* -------------------- Indexes -------------------- */

// Useful for user's posts
postSchema.index({
  userId: 1,
  createdAt: -1,
});

// Useful for global/latest feed
postSchema.index({
  createdAt: -1,
});

/* -------------------- Model -------------------- */
// backend/packages/mongodb/src/index.ts
export const PostModel: Model<Post> =
  models.Post || model<Post>('Post', postSchema);