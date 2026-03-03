import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  color: { type: String, required: true },
  colorHex: { type: String, required: true },
  storage: { type: String, required: true },
  condition: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  images: [{ type: String }]
});

const productSchema = new mongoose.Schema({
  model: { type: String, required: true },
  series: { type: String, required: true },
  type: { type: String, required: true },
  chip: { type: String },
  display: { type: String },
  camera: { type: String },
  description: { type: String, required: true },
  mainImage: { type: String, required: true },
  variants: [variantSchema]
}, { timestamps: true });

export default mongoose.model('Product', productSchema);