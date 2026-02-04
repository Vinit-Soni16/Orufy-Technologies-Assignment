const Product = require('../models/Product');

// Middleware (authMiddleware in routes) ensures req.user is set

exports.createProduct = async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            userId: req.user._id // Bind product to logged-in user
        });
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { search } = req.query;
        // Strict Isolation: Only show products belonging to this user
        let query = { userId: req.user._id };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Ensure user owns the product they are updating
        const product = await Product.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        }
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOneAndDelete({ _id: id, userId: req.user._id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        }
        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.togglePublish = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({ _id: id, userId: req.user._id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found or unauthorized' });
        }
        product.published = !product.published;
        await product.save();
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

