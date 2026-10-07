import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { Income } from '../../models/budget.models';

@Component({
  selector: 'app-income-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './income-form.component.html',
  styleUrl: './income-form.component.css'
})
export class IncomeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  public budgetService = inject(BudgetService);

  incomeForm!: FormGroup;
  successMessage: string = '';

  ngOnInit(): void {
    // Se elimina el control 'date' del formulario visible
    this.incomeForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      amount: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  addIncome(): void {
    if (this.incomeForm.invalid) return;

    // Se asigna automáticamente la fecha actual (YYYY-MM-DD)
    const payload: Income = {
      ...this.incomeForm.value,
      date: new Date().toISOString().substring(0, 10)
    };

    this.budgetService.addIncome(payload).subscribe({
      next: () => {
        this.incomeForm.reset({
          description: '',
          amount: 0
        });
        this.showMessage('Ingreso extra registrado con éxito.');
      },
      error: (err) => console.error('Error al registrar ingreso extra:', err)
    });
  }

  deleteIncome(id?: number): void {
    if (!id) return;
    this.budgetService.deleteIncome(id).subscribe();
  }

  private showMessage(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => (this.successMessage = ''), 3000);
  }
}