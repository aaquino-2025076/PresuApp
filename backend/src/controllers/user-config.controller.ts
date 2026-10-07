import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getUserConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        pay_frequency AS payFrequency, 
        base_salary AS baseSalary, 
        initial_savings AS initialSavings,
        balance_threshold AS balanceThreshold 
       FROM user_config LIMIT 1`
    );
    res.json(rows[0] || { payFrequency: 'mensual', baseSalary: 0, initialSavings: 0, balanceThreshold: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la configuración de usuario.' });
  }
};

export const updateConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payFrequency, baseSalary, initialSavings, balanceThreshold, balance_threshold } = req.body;
    
    // Soporta tanto camelCase como snake_case
    const threshold = balanceThreshold ?? balance_threshold ?? 0;

    await pool.query<ResultSetHeader>(
      `UPDATE user_config 
       SET pay_frequency = ?, 
           base_salary = ?, 
           initial_savings = ?, 
           balance_threshold = ? 
       WHERE id = 1`,
      [payFrequency, baseSalary, initialSavings, threshold]
    );

    res.json({ message: 'Configuración actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar user_config:', error);
    res.status(500).json({ error: 'Error al actualizar la configuración.' });
  }
};