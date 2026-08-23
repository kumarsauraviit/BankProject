import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, (req, res, next) => productController.addProduct(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => productController.removeProduct(req, res, next));

export const productRouter = router;
