const express = require('express');
const bodyParser = require('body-parser');
const {
  pool,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
} = require('./db');

const app = express();
app.use(bodyParser.json());

app.get('/api/users', async (req, res) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id/favorites', async (req, res) => {
  const { id } = req.params;
  try {
    const favorites = await fetchFavorites(id);
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/:id/favorites', async (req, res) => {
  const { id } = req.params;
  const { product_id } = req.body;
  try {
    const favorite = await createFavorite(id, product_id);
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:userId/favorites/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await destroyFavorite(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const init = async () => {
  try {
    await createTables();
    console.log('Tables created');
  } catch (error) {
    console.error('Error creating tables', error);
  }

  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
};

init();
