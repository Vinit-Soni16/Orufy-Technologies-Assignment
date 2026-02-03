const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        // If we want to link user: product.userId = req.user.id;
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                name: { $regex: search, $options: 'i' } // Case-insensitive search
            };
        }

        // Sort by createdAt desc
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.togglePublish = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        product.published = !product.published;
        await product.save();
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
