import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  thumbnail: { type: String, default: "" },
  code: { type: String, unique: true },
  stock: { type: Number, default: 0 },
  category: { type: String },
  status: { type: Boolean, default: true, required: true }, 
});

productSchema.plugin(mongoosePaginate);

export const ProductModel = mongoose.model('Product', productSchema);

