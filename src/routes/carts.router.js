
import express from 'express';
import { CartModel } from '../models/cart.js';
import { ProductModel } from '../models/products.js';
import mongoose from 'mongoose';

const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const nuevoCart = await CartModel.create({});
    res.status(201).json({ message: 'Carrito creado', cart: nuevoCart });
  } catch (error) {
    console.error('Error al crear carrito:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { limit = 10, page = 1, sort = null } = req.query;

  try {
    if (!mongoose.Types.ObjectId.isValid(cid)) {
      return res.status(400).json({ error: 'ID de carrito no valido' });
    }

    const cart = await CartModel.findById(cid)
      .populate({
        path: 'products.product',
        options: {
          limit: parseInt(limit),
          skip: (parseInt(page) - 1) * parseInt(limit),
          sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined
        }
      })
      .lean();

    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    res.status(200).json({
      products: cart.products,
      pagination: { limit: +limit, page: +page, sort }
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


router.post('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    const cart = await CartModel.findById(cid);
    const product = await ProductModel.findById(pid);

    if (!cart || !product) return res.status(404).json({ error: 'Carrito o producto no encontrado' });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (item) {
      item.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    res.status(200).json({ message: 'Producto agregado', cart });
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });


    const validProducts = [];
    for (const item of products) {
      const productExists = await ProductModel.findById(item.product);
      if (!productExists) {
        return res.status(404).send({ status: 'error', message: `Producto no encontrado: ${item.product}` });
      }
      validProducts.push({ product: item.product, quantity: item.quantity });
    }

    cart.products = validProducts;
    await cart.save();

    res.send({ status: 'success', message: 'Carrito actualizado correctamente', cart });

  } catch (error) {
    console.error(error);
    res.status(500).send({ status: 'error', message: 'Error al actualizar el carrito' });
  }
});


router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(cid) || !mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Cantidad invalida' });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) return res.status(404).json({ error: 'Producto no esta en el carrito' });

    item.quantity = quantity;
    await cart.save();
    res.status(200).json({ message: 'Cantidad actualizada', cart });
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const initialLength = cart.products.length;
    cart.products = cart.products.filter(p => p.product.toString() !== pid);

    if (cart.products.length === initialLength) {
      return res.status(404).json({ error: 'Producto no estaba en el carrito' });
    }

    await cart.save();
    res.status(200).json({ message: 'Producto eliminado', cart });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


router.delete('/:cid', async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    cart.products = [];
    await cart.save();

    res.status(200).json({ message: 'Carrito vaciado' });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;
