export interface UserConfig {
  id?: number;
  payFrequency: string;
  pay_frequency?: string;
  baseSalary: number;
  base_salary?: number;
  initialSavings: number;
  initial_savings?: number;
  balanceThreshold?: number;
  balance_threshold?: number;
}

export interface Income {
  id?: number;
  description: string;
  amount: number;
  date: string;
}

export interface Expense {
  id?: number;
  description: string;
  amount: number;
  type: 'fixed' | 'daily';
  category?: ExpenseCategory;
  frequency?: ExpenseFrequency; 
  date: string;
}

export interface SavingsGoal {
  id?: number;
  targetAmount: number;
  period: 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'anual';
}

export interface BudgetSummary {
  baseSalary: number;
  totalIncomes: number;
  totalExpenses: number;
  availableBalance: number;
  savingsGoal: SavingsGoal;
  alerts: string[];
}

export type ExpenseCategory = 
  | 'Comida' 
  | 'Transporte' 
  | 'Ocio' 
  | 'Salud' 
  | 'Educación' 
  | 'Servicios' 
  | 'Otros';

export type ExpenseFrequency = 'semanal' | 'quincenal' | 'mensual' | 'anual';

