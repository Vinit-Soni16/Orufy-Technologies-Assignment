const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, productController.createProduct);
router.get('/', protect, productController.getProducts);
router.put('/:id', protect, productController.updateProduct);
router.delete('/:id', protect, productController.deleteProduct);
router.patch('/:id/publish', protect, productController.togglePublish);

module.exports = router;
