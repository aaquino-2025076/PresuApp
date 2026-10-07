import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getIncomes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).userId;
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, description, amount, date FROM incomes WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar ingresos.' });
  }
};

export const createIncome = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).userId;
    const { description, amount, date } = req.body;
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO incomes (user_id, description, amount, date) VALUES (?, ?, ?, ?)',
      [userId, description, amount, date]
    );
    
    res.status(201).json({ id: result.insertId, description, amount, date });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar ingreso.' });
  }
};

export const deleteIncome = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).userId;
    const { id } = req.params;
    
    await pool.query('DELETE FROM incomes WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Ingreso eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar ingreso.' });
  }
};