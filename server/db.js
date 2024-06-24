const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'acme_store',
  password: 'password',
  port: 5432,
});

const createTables = async () => {
  await pool.query(`
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;

    CREATE TABLE users (
      id UUID PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE products (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE favorites (
      id UUID PRIMARY KEY,
      product_id UUID REFERENCES products(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
    );
  `);
};

const createUser = async (username, password) => {
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (id, username, password) VALUES ($1, $2, $3) RETURNING *',
    [id, username, hashedPassword]
  );
  return result.rows[0];
};

const createProduct = async (name) => {
  const id = uuidv4();
  const result = await pool.query(
    'INSERT INTO products (id, name) VALUES ($1, $2) RETURNING *',
    [id, name]
  );
  return result.rows[0];
};

const fetchUsers = async () => {
  const result = await pool.query('SELECT * FROM users');
  return result.rows;
};

const fetchProducts = async () => {
  const result = await pool.query('SELECT * FROM products');
  return result.rows;
};

const createFavorite = async (user_id, product_id) => {
  const id = uuidv4();
  const result = await pool.query(
    'INSERT INTO favorites (id, user_id, product_id) VALUES ($1, $2, $3) RETURNING *',
    [id, user_id, product_id]
  );
  return result.rows[0];
};

const fetchFavorites = async (user_id) => {
  const result = await pool.query(
    'SELECT * FROM favorites WHERE user_id = $1',
    [user_id]
  );
  return result.rows;
};

const destroyFavorite = async (id) => {
  await pool.query('DELETE FROM favorites WHERE id = $1', [id]);
};

module.exports = {
  pool,
  createTables,
  createUser,
  createProduct,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
