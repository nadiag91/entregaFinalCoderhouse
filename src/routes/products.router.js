import express from 'express';
import { ProductModel } from '../models/products.js';

const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;


    let filter = {};
    if (query) {
      if (query === 'disponible') {
        filter.status = true;
      } else {
        filter.category = query;
      }
    }


    const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};


    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOption,
      lean: true,
    };

    const result = await ProductModel.paginate(filter, options);

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const makeLink = (pageNum) => {
      if (!pageNum) return null;
      const queryParams = new URLSearchParams({ ...req.query, page: pageNum });
      return `${baseUrl}?${queryParams.toString()}`;
    };

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.hasPrevPage ? result.prevPage : null,
      nextPage: result.hasNextPage ? result.nextPage : null,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: makeLink(result.prevPage),
      nextLink: makeLink(result.nextPage),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'error',
      error: 'Error al obtener productos',
    });
  }
});


router.get('/:pid', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();
    if (!product) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', product });
  } catch {
    res.status(400).json({ status: 'error', error: 'ID invalido' });
  }
});


router.post('/', async (req, res) => {
  try {
    const nuevo = await ProductModel.create(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Producto creado correctamente',
      product: nuevo,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ status: 'error', error: 'Error al crear producto' });
  }
});


router.put('/:pid', async (req, res) => {
  try {
    const actualizado = await ProductModel.findByIdAndUpdate(req.params.pid, req.body, { new: true });
    if (!actualizado) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', product: actualizado });
  } catch {
    res.status(400).json({ status: 'error', error: 'ID invalido o error al actualizar' });
  }
});


router.delete('/:pid', async (req, res) => {
  try {
    const eliminado = await ProductModel.findByIdAndDelete(req.params.pid);
    if (!eliminado) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', message: 'Producto eliminado correctamente' });
  } catch {
    res.status(400).json({ status: 'error', error: 'ID invalido o error al eliminar' });
  }
});

export default router;
