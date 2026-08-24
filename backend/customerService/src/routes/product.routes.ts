import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/addProduct', authMiddleware, (req, res, next) => productController.addProduct(req, res, next));
router.delete('/deleteproduct/:id', authMiddleware, (req, res, next) => productController.removeProduct(req, res, next));
router.post('/addToCart', authMiddleware, (req, res, next) => productController.addToCart(req, res, next));
router.post('/getCart', authMiddleware, (req, res, next) => productController.addToCart(req, res, next));

export const productRouter = router;
