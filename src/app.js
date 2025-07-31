import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';
import handlebars from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server } from 'socket.io';
import http from 'http';
import { ProductModel } from './models/products.js';

import productRoutes from './routes/products.router.js';
import cartRoutes from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 8080;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.resolve('./views'));


app.use('/api/products', productRoutes);
app.use('/api/carts', cartRoutes);
app.use('/', viewsRouter);


// Websockets
io.on('connection', async (socket) => {
  console.log('Nuevo cliente conectado');

  const products = await ProductModel.find().lean();
  socket.emit('updateProducts', products);


  socket.on('newProduct', async (data) => {
    const { title, price } = data;

    const newProduct = new ProductModel({
      title,
      price,
      description: '',
      code: `AUTO${Date.now()}`,
      stock: 0,
      category: 'sin-categoria',
      status: true,
    });

    await newProduct.save();


    const updatedProducts = await ProductModel.find().lean();
    io.emit('updateProducts', updatedProducts);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
