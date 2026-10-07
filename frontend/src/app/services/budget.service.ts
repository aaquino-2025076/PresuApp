import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BudgetSummary, Income, Expense, UserConfig, SavingsGoal } from '../models/budget.models';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // Signals para estado reactivo
  public summary = signal<BudgetSummary | null>(null);
  public incomes = signal<Income[]>([]);
  public expenses = signal<Expense[]>([]);
  public userConfig = signal<UserConfig | null>(null);

  constructor() {
    this.refreshAllData();
  }

  // Limpiar el estado reactivo en memoria
  public clearState(): void {
    this.summary.set(null);
    this.incomes.set([]);
    this.expenses.set([]);
    this.userConfig.set(null);
  }

  // Conversión de frecuencia a monto mensual equivalente
  public getMonthlyEquivalent(expense: Expense): number {
    if (expense.type !== 'fixed') return expense.amount;

    switch (expense.frequency) {
      case 'semanal':
        return expense.amount * 4;
      case 'quincenal':
        return expense.amount * 2;
      case 'anual':
        return expense.amount / 12;
      case 'mensual':
      default:
        return expense.amount;
    }
  }

  // Total de gastos fijos mensualizados en tiempo real
  public totalFixedExpenses = computed(() => {
    return this.expenses()
      .filter(e => e.type === 'fixed')
      .reduce((sum, e) => sum + this.getMonthlyEquivalent(e), 0);
  });

  // Total de gastos diarios acumulados
  public totalDailyExpenses = computed(() => {
    return this.expenses()
      .filter(e => e.type === 'daily')
      .reduce((sum, e) => sum + e.amount, 0);
  });

  // Carga inicial y refresco global de datos
  public refreshAllData(): void {
    this.getSummary().subscribe();
    this.getIncomes().subscribe();
    this.getExpenses().subscribe();
    this.getUserConfig().subscribe(config => this.userConfig.set(config));
  }

  public customAlerts = computed<string[]>(() => {
    const alertsList: string[] = [];
    const sum = this.summary();
    const config = this.userConfig();

    if (!sum) return alertsList;

    // 1. Alerta si el saldo es negativo
    if (sum.availableBalance < 0) {
      alertsList.push(`¡Atención! Tu saldo disponible está en negativo: Q ${sum.availableBalance.toFixed(2)}`);
    }

    // 2. Alerta por umbral personalizado (balanceThreshold)
    const threshold = config?.balanceThreshold ?? config?.balance_threshold ?? 0;
    if (threshold > 0 && sum.availableBalance >= 0 && sum.availableBalance <= threshold) {
      alertsList.push(`Alerta de Saldo Bajo: Tu disponible (Q ${sum.availableBalance.toFixed(2)}) cayó por debajo de tu umbral configurado (Q ${threshold.toFixed(2)}).`);
    }

    // 3. Incluir las alertas que ya devuelva el backend en summary
    if (sum.alerts && sum.alerts.length > 0) {
      alertsList.push(...sum.alerts);
    }

    return [...new Set(alertsList)];
  });

  // 1. Resumen y Métrica General
  getSummary(): Observable<BudgetSummary> {
    return this.http.get<BudgetSummary>(`${this.apiUrl}/budget/summary`).pipe(
      tap((data) => this.summary.set(data))
    );
  }

  getUserConfig(): Observable<UserConfig> {
    return this.http.get<UserConfig>(`${this.apiUrl}/config`).pipe(
      tap((config) => this.userConfig.set(config))
    );
  }

  updateUserConfig(config: UserConfig): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/config`, config).pipe(
      tap(() => this.refreshAllData())
    );
  }

  // 3. Ingresos
  getIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(`${this.apiUrl}/incomes`).pipe(
      tap((data) => this.incomes.set(data))
    );
  }

  addIncome(income: Income): Observable<Income> {
    return this.http.post<Income>(`${this.apiUrl}/incomes`, income).pipe(
      tap(() => this.refreshAllData())
    );
  }

  deleteIncome(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/incomes/${id}`).pipe(
      tap(() => this.refreshAllData())
    );
  }

  // 4. Gastos (Fijos y Diarios)
  getExpenses(type?: 'fixed' | 'daily'): Observable<Expense[]> {
    const url = type ? `${this.apiUrl}/expenses?type=${type}` : `${this.apiUrl}/expenses`;
    return this.http.get<Expense[]>(url).pipe(
      tap((data) => this.expenses.set(data))
    );
  }

  addExpense(expense: Expense): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/expenses`, expense).pipe(
      tap(() => this.refreshAllData())
    );
  }

  deleteExpense(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/expenses/${id}`).pipe(
      tap(() => this.refreshAllData())
    );
  }

  // 5. Metas de Ahorro
  getGoal(): Observable<SavingsGoal> {
    return this.http.get<SavingsGoal>(`${this.apiUrl}/goals`);
  }

  updateGoal(goal: SavingsGoal): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/goals`, goal).pipe(
      tap(() => this.refreshAllData())
    );
  }
}