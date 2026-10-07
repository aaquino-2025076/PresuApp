import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BudgetSummary, Income, Expense, UserConfig, SavingsGoal } from '../models/budget.models';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3000/api';

  // Signals para estado reactivo
  public summary = signal<BudgetSummary | null>(null);
  public incomes = signal<Income[]>([]);
  public expenses = signal<Expense[]>([]);
  public userConfig = signal<UserConfig | null>(null);

  constructor() {
    // IMPORTANTE: Se remueve la llamada a refreshAllData() del constructor.
    // Los servicios no deben realizar peticiones HTTP autenticadas al instanciarse.
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

  // Refresco de datos solo si el usuario está autenticado
  public refreshAllData(): void {
    if (!this.authService.isAuthenticated()) {
      return; // Evita peticiones HTTP si no hay token/sesión activa
    }

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

    if (sum.availableBalance < 0) {
      alertsList.push(`¡Atención! Tu saldo disponible está en negativo: Q ${sum.availableBalance.toFixed(2)}`);
    }

    const threshold = config?.balanceThreshold ?? config?.balance_threshold ?? 0;
    if (threshold > 0 && sum.availableBalance >= 0 && sum.availableBalance <= threshold) {
      alertsList.push(`Alerta de Saldo Bajo: Tu disponible (Q ${sum.availableBalance.toFixed(2)}) cayó por debajo de tu umbral configurado (Q ${threshold.toFixed(2)}).`);
    }

    if (sum.alerts && sum.alerts.length > 0) {
      alertsList.push(...sum.alerts);
    }

    return [...new Set(alertsList)];
  });

  // Endpoints API
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

  getGoal(): Observable<SavingsGoal> {
    return this.http.get<SavingsGoal>(`${this.apiUrl}/goals`);
  }

  updateGoal(goal: SavingsGoal): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/goals`, goal).pipe(
      tap(() => this.refreshAllData())
    );
  }
}