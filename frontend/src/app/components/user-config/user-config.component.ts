import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-user-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-config.component.html',
  styleUrl: './user-config.component.css'
})
export class UserConfigComponent implements OnInit {
  private fb = inject(FormBuilder);
  public budgetService = inject(BudgetService);

  configForm!: FormGroup;
  successMessage: string = '';

  ngOnInit(): void {
    this.configForm = this.fb.group({
      payFrequency: ['mensual', Validators.required],
      baseSalary: [0, [Validators.required, Validators.min(0)]],
      initialSavings: [0, [Validators.required, Validators.min(0)]],
      balanceThreshold: [0, [Validators.required, Validators.min(0)]]
    });

    this.budgetService.getUserConfig().subscribe({
      next: (config: any) => {
        if (config) {
          this.configForm.patchValue({
            payFrequency: config.payFrequency ?? config.pay_frequency ?? 'mensual',
            baseSalary: Number(config.baseSalary ?? config.base_salary ?? 0),
            initialSavings: Number(config.initialSavings ?? config.initial_savings ?? 0),
            balanceThreshold: Number(config.balanceThreshold ?? config.balance_threshold ?? 0)
          });
        }
      },
      error: (err) => console.error('Error al cargar la configuración:', err)
    });
  }

  saveConfig(): void {
    if (this.configForm.invalid) return;

    const val = this.configForm.value;
    const payload = {
      payFrequency: val.payFrequency,
      baseSalary: Number(val.baseSalary),
      initialSavings: Number(val.initialSavings),
      balanceThreshold: Number(val.balanceThreshold)
    };

    this.budgetService.updateUserConfig(payload).subscribe({
      next: () => {
        this.successMessage = 'Configuración general actualizada con éxito.';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (err) => console.error('Error al actualizar la configuración:', err)
    });
  }
}