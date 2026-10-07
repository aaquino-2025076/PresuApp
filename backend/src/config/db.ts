import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'presuapp_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Prueba de conexión inicial
pool.getConnection()
  .then((connection) => {
    console.log('✅ Conexión exitosa a MySQL');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Error de conexión a MySQL:', err.message);
  });