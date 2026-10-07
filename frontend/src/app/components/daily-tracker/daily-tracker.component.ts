import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { Expense } from '../../models/budget.models';

@Component({
  selector: 'app-daily-tracker',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './daily-tracker.component.html',
  styleUrl: './daily-tracker.component.css'
})
export class DailyTrackerComponent implements OnInit {
  private fb = inject(FormBuilder);
  public budgetService = inject(BudgetService);

  dailyForm!: FormGroup;

  ngOnInit(): void {
    this.dailyForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(2)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      type: ['daily'],
      category: ['Comida', Validators.required],
      date: [this.getTodayString(), Validators.required]
    });
  }

  addExpense(): void {
    if (this.dailyForm.invalid) return;

    // Aseguramos que la fecha sea siempre la actual al momento del envío
    const payload: Expense = {
      ...this.dailyForm.value,
      date: this.getTodayString()
    };

    this.budgetService.addExpense(payload).subscribe(() => {
      // Reinicia el formulario para el siguiente registro dejando valores listos
      this.dailyForm.reset({
        description: '',
        amount: '',
        type: 'daily',
        category: 'Comida',
        date: this.getTodayString()
      });
    });
  }

  deleteExpense(id?: number): void {
    if (!id) return;
    this.budgetService.deleteExpense(id).subscribe();
  }

  get dailyExpenses(): Expense[] {
    return this.budgetService.expenses().filter(e => e.type === 'daily');
  }

  private getTodayString(): string {
    return new Date().toISOString().substring(0, 10);
  }
}