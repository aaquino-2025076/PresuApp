import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { SavingsGoal } from '../../models/budget.models';

@Component({
  selector: 'app-savings-goal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './savings-goal.component.html',
  styleUrl: './savings-goal.component.css'
})
export class SavingsGoalComponent implements OnInit {
  private fb = inject(FormBuilder);
  public budgetService = inject(BudgetService);

  goalForm!: FormGroup;
  successMessage: string = '';

  ngOnInit(): void {
    this.goalForm = this.fb.group({
      targetAmount: [0, [Validators.required, Validators.min(0)]],
      period: ['mensual', Validators.required]
    });

    this.budgetService.getGoal().subscribe({
      next: (goal: any) => {
        if (goal) {
          this.goalForm.patchValue({
            targetAmount: Number(goal.targetAmount ?? goal.target_amount ?? 0),
            period: goal.period ?? 'mensual'
          });
        }
      },
      error: (err) => console.error('Error al obtener la meta de ahorro:', err)
    });
  }

  saveGoal(): void {
    if (this.goalForm.invalid) return;

    const payload: SavingsGoal = {
      targetAmount: Number(this.goalForm.value.targetAmount),
      period: this.goalForm.value.period
    };

    this.budgetService.updateGoal(payload).subscribe({
      next: () => {
        this.successMessage = 'Meta de ahorro configurada correctamente.';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => console.error('Error al guardar la meta de ahorro:', err)
    });
  }
}