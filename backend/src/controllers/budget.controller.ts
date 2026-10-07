import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { RowDataPacket } from 'mysql2';

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Obtener configuración del usuario (incluyendo balance_threshold)
    const [configRows] = await pool.query<RowDataPacket[]>(
      'SELECT pay_frequency, base_salary, initial_savings, balance_threshold FROM user_config LIMIT 1'
    );
    const config = configRows[0] || { base_salary: 0, initial_savings: 0, balance_threshold: 0 };

    // 2. Sumar ingresos extra
    const [incomeRows] = await pool.query<RowDataPacket[]>(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM incomes'
    );
    const extraIncomesTotal = Number(incomeRows[0].total);

    // 3. Sumar gastos fijos
    const [fixedExpenseRows] = await pool.query<RowDataPacket[]>(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE type = "fixed"'
    );
    const fixedExpensesTotal = Number(fixedExpenseRows[0].total);

    // 4. Sumar gastos diarios
    const [dailyExpenseRows] = await pool.query<RowDataPacket[]>(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE type = "daily"'
    );
    const dailyExpensesTotal = Number(dailyExpenseRows[0].total);

    // 5. Obtener meta de ahorro
    const [goalRows] = await pool.query<RowDataPacket[]>(
      'SELECT target_amount, period FROM savings_goals LIMIT 1'
    );
    const goal = goalRows[0] || { target_amount: 0, period: 'mensual' };

    // Cálculos
    const baseSalary = Number(config.base_salary);
    const initialSavings = Number(config.initial_savings);
    const balanceThreshold = Number(config.balance_threshold || 0);
    const targetAmount = Number(goal.target_amount);

    const totalIncomes = baseSalary + initialSavings + extraIncomesTotal;
    const totalExpenses = fixedExpensesTotal + dailyExpensesTotal;
    const availableBalance = totalIncomes - totalExpenses - targetAmount;

    // Sistema de advertencias
    const alerts: string[] = [];

    if (availableBalance <= 0) {
      alerts.push('¡Advertencia! Tu saldo disponible es igual o menor a cero.');
    } else if (balanceThreshold > 0 && availableBalance <= balanceThreshold) {
      alerts.push(`Alerta de Saldo Bajo: Tu disponible (Q ${availableBalance.toFixed(2)}) ha caído por debajo de tu límite de seguridad (Q ${balanceThreshold.toFixed(2)}).`);
    }

    if ((totalIncomes - totalExpenses) < targetAmount) {
      alerts.push('Atención: Tus gastos acumulados no te permitirán cumplir tu meta de ahorro.');
    }

    res.json({
      baseSalary,
      totalIncomes,
      totalExpenses,
      availableBalance,
      savingsGoal: {
        targetAmount,
        period: goal.period
      },
      alerts
    });
  } catch (error) {
    console.error('Error al obtener el resumen de MySQL:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos MySQL.' });
  }
};