import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { type } = req.query; 

    let sql = 'SELECT id, description, amount, type, category, frequency, date FROM expenses WHERE user_id = ?';
    const params: any[] = [userId];

    if (type === 'fixed' || type === 'daily') {
      sql += ' AND type = ?';
      params.push(type);
    }
    sql += ' ORDER BY date DESC';

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Error en getExpenses:', error);
    res.status(500).json({ error: 'Error al consultar gastos.' });
  }
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { description, amount, type, category, frequency, date } = req.body;
    
    const cat = category || 'Comida';
    const freq = frequency || 'mensual';

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO expenses (user_id, description, amount, type, category, frequency, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, description, amount, type, cat, freq, date]
    );

    res.status(201).json({ 
      id: result.insertId, 
      description, 
      amount, 
      type, 
      category: cat, 
      frequency: freq, 
      date 
    });
  } catch (error) {
    console.error('Error al crear gasto:', error);
    res.status(500).json({ error: 'Error al registrar gasto.' });
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Gasto eliminado' });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({ error: 'Error al eliminar gasto.' });
  }
};