import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variantSku: { type: String, required: true },
    model: String,
    color: String,
    storage: String,
    condition: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);