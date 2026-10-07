import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { UserConfigComponent } from './components/user-config/user-config.component';
import { IncomeFormComponent } from './components/income-form/income-form.component';
import { DailyTrackerComponent } from './components/daily-tracker/daily-tracker.component';
import { SavingsGoalComponent } from './components/savings-goal/savings-goal.component';
import { NavbarComponent } from './shared/navbar/navbar.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'config', component: UserConfigComponent, canActivate: [authGuard] },
  { path: 'incomes', component: IncomeFormComponent, canActivate: [authGuard] },
  { path: 'daily', component: DailyTrackerComponent, canActivate: [authGuard] },
  { path: 'goal', component: SavingsGoalComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];