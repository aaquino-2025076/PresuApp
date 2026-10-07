import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BudgetService } from '../../services/budget.service';
import { AlertsComponent } from '../alerts/alerts.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, AlertsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private budgetService = inject(BudgetService);
  summary = this.budgetService.summary;

  ngOnInit(): void {
    this.budgetService.refreshAllData();
  }
}