import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket } from 'mysql2';

export const getBudgetSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado.' });
      return;
    }

    // 1. Configuración del usuario actual
    const [configRows] = await pool.query<RowDataPacket[]>(
      'SELECT base_salary, initial_savings, balance_threshold FROM user_config WHERE user_id = ?',
      [userId]
    );
    const baseSalary = Number(configRows[0]?.base_salary || 0);
    const initialSavings = Number(configRows[0]?.initial_savings || 0);
    const balanceThreshold = Number(configRows[0]?.balance_threshold || 0);

    // 2. Ingresos extras del usuario (COALESCE evita retornar NULL si no hay filas)
    const [incomeRows] = await pool.query<RowDataPacket[]>(
      'SELECT COALESCE(SUM(amount), 0) AS extraIncomes FROM incomes WHERE user_id = ?',
      [userId]
    );
    const extraIncomes = Number(incomeRows[0]?.extraIncomes || 0);
    const totalIncome = baseSalary + extraIncomes;

    // 3. Gastos del usuario
    const [expenseRows] = await pool.query<RowDataPacket[]>(
      'SELECT amount, type, frequency FROM expenses WHERE user_id = ?',
      [userId]
    );

    let totalExpenses = 0;
    if (expenseRows && expenseRows.length > 0) {
      expenseRows.forEach(exp => {
        const amount = Number(exp.amount) || 0;
        if (exp.type === 'daily') {
          totalExpenses += amount;
        } else if (exp.type === 'fixed') {
          switch (exp.frequency) {
            case 'semanal': totalExpenses += amount * 4; break;
            case 'quincenal': totalExpenses += amount * 2; break;
            case 'anual': totalExpenses += amount / 12; break;
            case 'mensual':
            default: totalExpenses += amount; break;
          }
        }
      });
    }

    // 4. Meta de ahorro
    const [goalRows] = await pool.query<RowDataPacket[]>(
      'SELECT target_amount FROM savings_goals WHERE user_id = ? LIMIT 1',
      [userId]
    );
    const savingsGoal = Number(goalRows[0]?.target_amount || 0);

    // 5. Saldo disponible (Ahorro inicial + Ingresos totales - Gastos totales)
    const availableBalance = initialSavings + totalIncome - totalExpenses;

    res.json({
      availableBalance,
      totalIncome,
      totalExpenses,
      savingsGoal,
      balanceThreshold,
      alerts: []
    });
  } catch (error) {
    console.error('Error al obtener el resumen del presupuesto:', error);
    res.status(500).json({ error: 'Error al calcular el resumen financiero.' });
  }
};