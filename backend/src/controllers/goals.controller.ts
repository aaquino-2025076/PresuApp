import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT target_amount AS targetAmount, period FROM savings_goals LIMIT 1'
    );
    res.json(rows[0] || { targetAmount: 0, period: 'mensual' });
  } catch (error) {
    console.error('Error en getGoal:', error);
    res.status(500).json({ error: 'Error al obtener la meta de ahorro.' });
  }
};

export const updateGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { targetAmount, period } = req.body;
    
    const amount = Number(targetAmount) || 0;
    const selectedPeriod = period || 'mensual';

    await pool.query<ResultSetHeader>(
      'UPDATE savings_goals SET target_amount = ?, period = ? WHERE id = 1',
      [amount, selectedPeriod]
    );

    res.json({ message: 'Meta de ahorro actualizada correctamente' });
  } catch (error) {
    console.error('Error en updateGoal:', error);
    res.status(500).json({ error: 'Error al actualizar la meta.' });
  }
};