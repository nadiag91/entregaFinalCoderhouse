
import mongoose from 'mongoose'; 


const MONGO_URI = process.env.MONGO_URI_ATLAS;

export const connectDB = async () => {
  try {
    
    if (!MONGO_URI) {
      throw new Error('varibale no definida');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Conectado');
  } catch (err) {
    console.error('error conectando', err.message);
    process.exit(1); 
  }
};