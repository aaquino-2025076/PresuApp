import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getIncomes = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, description, amount, date FROM incomes ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar ingresos.' });
  }
};

export const createIncome = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, amount, date } = req.body;
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO incomes (description, amount, date) VALUES (?, ?, ?)',
      [description, amount, date]
    );
    res.status(201).json({ id: result.insertId, description, amount, date });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar ingreso.' });
  }
};

export const deleteIncome = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM incomes WHERE id = ?', [id]);
    res.json({ message: 'Ingreso eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ingreso.' });
  }
};