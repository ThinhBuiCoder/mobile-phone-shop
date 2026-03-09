import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variantSku: { type: String, required: true },
  model: String,
  color: String,
  storage: String,
  condition: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  addressLine: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  note: { type: String, default: '' },
});

const orderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
    required: true,
  },
  changedAt: { type: Date, default: Date.now },
  note: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    shippingAddress: { type: shippingAddressSchema, required: true },
    payment: {
      method: { type: String, enum: ['cod', 'bank_transfer', 'card'], required: true },
      status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
      transactionId: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: { type: [orderStatusHistorySchema], default: [] },
    idempotencyKey: { type: String, required: true },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });

export default mongoose.model('Order', orderSchema);
