import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const JWT_SECRET = process.env['JWT_SECRET'] || 'presuapp_secret_key_2026';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si el correo ya existe
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
      return;
    }

    // Encriptar la contraseña 
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userRole = role || 'user';
    // Insertar usuario
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: { id: result.insertId, name, email, role: userRole }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    // Buscar usuario
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      res.status(400).json({ error: 'Credenciales inválidas.' });
      return;
    }

    const user = rows[0];
    //verifica la contraseña encriptada
    const validPassword = await bcrypt.compare(password, user['password']);
    if (!validPassword) {
      res.status(400).json({ error: 'Credenciales inválidas.' });
      return;
    }

    //genera un token JWT
    const token = jwt.sign(
      { id: user['id'], email: user['email'], role: user['role'] },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user['id'],
        name: user['name'],
        email: user['email'],
        role: user['role']
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
};