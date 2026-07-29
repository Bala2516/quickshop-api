import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const createDBConfig = {
  host: "localhost",
  user: "root",
  password: process.env.MYSQL_PASSWORD,
};

export const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection(createDBConfig);

    await connection.execute(`CREATE DATABASE IF NOT EXISTS onlineShopping`);

    console.log("Database ready");

    await connection.end();
  } catch (error) {
    console.error(error);
    throw error;
    
  }
};

const usersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(50) NOT NULL,
    mobileno VARCHAR(10) UNIQUE NOT NULL,
    address VARCHAR(255),
    email VARCHAR(100) UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const register = `CREATE TABLE IF NOT EXISTS register (
    user_id INT PRIMARY KEY,
    mobileno VARCHAR(10) UNIQUE NOT NULL,
    otp INT,
    expire_otp DATETIME,
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);`;

const admin = `CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);`;

const authenticate = `CREATE TABLE IF NOT EXISTS authenticate (
    user_id INT PRIMARY KEY,
    token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);`;

const category = `CREATE TABLE IF NOT EXISTS category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const product = `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,0) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id)
        REFERENCES category(id)
        ON DELETE SET NULL
);`;

const order = `CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,0),
    status ENUM(
        'pending',
        'confirmed',
        'shipped',
        'delivered',
        'cancelled'
    ) DEFAULT 'pending',

    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
);`;

const cart = `CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);`;

export const createTables = async () => {
  try {
    const tables = [
      usersTable,
      register,
      admin,
      authenticate,
      category,
      product,
      order,
      cart,
    ];

    for (const table of tables) {
      await pool.execute(table);
    }

    console.log("All tables created successfully");
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default { createDatabase, createTables };
