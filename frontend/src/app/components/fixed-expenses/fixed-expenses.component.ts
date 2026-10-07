import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { Expense } from '../../models/budget.models';

@Component({
  selector: 'app-fixed-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './fixed-expenses.component.html',
  styleUrl: './fixed-expenses.component.css'
})
export class FixedExpensesComponent implements OnInit {
  private fb = inject(FormBuilder);
  public budgetService = inject(BudgetService);

  fixedForm!: FormGroup;

  ngOnInit(): void {
    this.fixedForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(2)]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      type: ['fixed'],
      frequency: ['mensual', Validators.required], // <--- Frecuencia por defecto
      date: [new Date().toISOString().substring(0, 10), Validators.required]
    });
  }

  addExpense(): void {
    if (this.fixedForm.invalid) return;

    this.budgetService.addExpense(this.fixedForm.value as Expense).subscribe(() => {
      this.fixedForm.reset({
        description: '',
        amount: '',
        type: 'fixed',
        frequency: 'mensual',
        date: new Date().toISOString().substring(0, 10)
      });
    });
  }

  deleteExpense(id?: number): void {
    if (!id) return;
    this.budgetService.deleteExpense(id).subscribe();
  }

  get fixedExpenses(): Expense[] {
    return this.budgetService.expenses().filter(e => e.type === 'fixed');
  }
}