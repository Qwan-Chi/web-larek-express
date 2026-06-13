import mongoose, { Schema, Document } from 'mongoose';
import fs from 'fs';
import path from 'path';

export interface IProduct {
  title: string;
  image: {
    fileName: string;
    originalName: string;
  };
  category: string;
  description?: string;
  price?: number | null;
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
}

const productSchema = new Schema<IProductDocument>({
  title: {
    type: String,
    unique: true,
    required: [true, 'Поле "title" должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
  },
  image: {
    type: {
      fileName: { type: String, required: true },
      originalName: { type: String, required: true },
    },
    required: [true, 'Поле "image" должно быть заполнено'],
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    default: null,
  },
});

productSchema.post('findOneAndDelete', (doc: IProductDocument | null) => {
  if (doc && doc.image && doc.image.fileName) {
    const parts = doc.image.fileName.split('/');
    const name = parts[parts.length - 1];
    const filePath = path.join(__dirname, '..', 'public', 'images', name);
    fs.unlink(filePath, () => {});
  }
});

export default mongoose.model<IProductDocument>('product', productSchema);
