const socket = io();
const form = document.getElementById('product-form');
const list = document.getElementById('product-list');


form.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = form.elements['title'].value;
  const price = parseFloat(form.elements['price'].value);

  socket.emit('newProduct', { title, price });
  console.log('Producto enviado:', title, price);

  form.reset();
});


socket.on('updateProducts', (products) => {
  console.log('Lista actualizada desde el servidor:', products);
  list.innerHTML = '';
  products.forEach(product => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${product.title} - $${product.price}
      
    `;
    list.appendChild(li);
  });
});
