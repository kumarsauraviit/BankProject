import multer from "multer";

const storage = multer.memoryStorage();

const multerUpload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 10,
    },

    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});

// This is the actual middleware
export const uploadPostImages = multerUpload.array("images", 10);