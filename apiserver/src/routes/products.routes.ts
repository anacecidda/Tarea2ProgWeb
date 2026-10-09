import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, changePrice } from '../controllers/products.controllers';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/price', changePrice);
router.delete('/:id', deleteProduct);

export default router;