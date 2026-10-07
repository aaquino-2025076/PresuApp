import { Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export const getUserConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        pay_frequency AS payFrequency, 
        base_salary AS baseSalary, 
        initial_savings AS initialSavings,
        balance_threshold AS balanceThreshold 
       FROM user_config 
       WHERE user_id = ?`,
      [userId]
    );

    res.json(rows[0] || { payFrequency: 'mensual', baseSalary: 0, initialSavings: 0, balanceThreshold: 0 });
  } catch (error) {
    console.error('Error al obtener user_config:', error);
    res.status(500).json({ error: 'Error al obtener la configuración de usuario.' });
  }
};

export const updateConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { payFrequency, baseSalary, initialSavings, balanceThreshold, balance_threshold } = req.body;
    
    const threshold = balanceThreshold ?? balance_threshold ?? 0;

    // 1. Intentar actualizar la configuración existente
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE user_config 
       SET pay_frequency = ?, 
           base_salary = ?, 
           initial_savings = ?, 
           balance_threshold = ? 
       WHERE user_id = ?`,
      [payFrequency, baseSalary, initialSavings, threshold, userId]
    );
    if (result.affectedRows === 0) {
      await pool.query<ResultSetHeader>(
        `INSERT INTO user_config (user_id, pay_frequency, base_salary, initial_savings, balance_threshold)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, payFrequency, baseSalary, initialSavings, threshold]
      );
    }

    res.json({ message: 'Configuración guardada correctamente' });
  } catch (error) {
    console.error('Error al actualizar user_config:', error);
    res.status(500).json({ error: 'Error al actualizar la configuración.' });
  }
};