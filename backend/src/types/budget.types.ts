export interface UserConfig {
  id?: number;
  payFrequency: 'quincenal' | 'mensual';
  baseSalary: number;
  initialSavings: number;
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
  date: string;
}

export interface SavingsGoal {
  id?: number;
  targetAmount: number;
  period: 'diario' | 'semanal' | 'mensual';
}