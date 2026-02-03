const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Product type is required'],
        enum: ['Food', 'Electronics', 'Clothes', 'Beauty Products', 'Others']
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: 0
    },
    mrp: {
        type: Number,
        required: [true, 'MRP is required'],
        min: 0
    },
    sellingPrice: {
        type: Number,
        required: [true, 'Selling Price is required'],
        min: 0
    },
    brand: {
        type: String,
        required: [true, 'Brand name is required'],
        trim: true
    },
    eligibility: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'Yes'
    },
    images: {
        type: [String], // Base64 strings
        default: []
    },
    published: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for now as per initial plan, can be strict later
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
