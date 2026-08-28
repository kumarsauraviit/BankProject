import mongoose, { type Types, type Model } from 'mongoose';

const { model, models, Schema } = mongoose;

/* -------------------- Interface -------------------- */

export interface CreateCommentDTO {
    postId: Types.ObjectId;
    userId: Types.ObjectId; // or string
    text: string;
}

export interface Comment {
    _id: Types.ObjectId;
    postId: Types.ObjectId;
    userId: Types.ObjectId; // or string
    text: string;

    createdAt: Date;
    updatedAt: Date;
}

export const commentSchema = new Schema<Comment>(
    {
        postId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        userId: {
            type: Schema.Types.ObjectId, // or Schema.Types.String
            required: true,
            index: true,
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

/* -------------------- Indexes -------------------- */

// Get comments of a post, newest first
commentSchema.index({
    postId: 1,
    createdAt: -1,
});

/* -------------------- Model -------------------- */

export const CommentModel: Model<Comment> =
    models.Comment || model<Comment>('Comment', commentSchema);
