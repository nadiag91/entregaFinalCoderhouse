import { Router } from 'express';
import { ProductModel } from '../models/products.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await ProductModel.find().lean(); 
    res.render('index', { products });
  } catch (error) {
    res.status(500).send('Error al cargar la pagina principal');
  }
});

router.get('/home', async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
    res.render('home', { products });
  } catch (error) {
    res.status(500).send('Error al cargar productos en la vista');
  }
});


router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await ProductModel.find().lean(); 
    res.render('realTimeProducts', { products });
  } catch (error) {
    res.status(500).send('Error al cargar productos en tiempo real');
  }
});

export default router;
