import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../core/services/transaction.service';
import { ApiService } from '../../core/services/api.service';
import { Transaction, DashboardSummary } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="summary-cards">
        <div class="card income-card">
          <div class="card-header">
            <span class="card-title">Revenus Totaux</span>
            <span class="icon">📈</span>
          </div>
          <div class="card-amount income">{{ summary.total_income | number:'1.2-2' }} €</div>
        </div>

        <div class="card expense-card">
          <div class="card-header">
            <span class="card-title">Dépenses Totales</span>
            <span class="icon">📉</span>
          </div>
          <div class="card-amount expense">{{ summary.total_expenses | number:'1.2-2' }} €</div>
        </div>

        <div class="card balance-card">
          <div class="card-header">
            <span class="card-title">Solde</span>
            <span class="icon">💰</span>
          </div>
          <div class="card-amount" [class.positive]="summary.balance >= 0" [class.negative]="summary.balance < 0">
            {{ summary.balance | number:'1.2-2' }} €
          </div>
        </div>
      </div>

      <div class="recent-transactions">
        <h2>Transactions Récentes</h2>
        <div class="transaction-list">
          <div *ngFor="let transaction of recentTransactions" class="transaction-item">
            <div class="transaction-icon" [style.background-color]="transaction.category.color + '20'">
              {{ transaction.category.icon }}
            </div>
            <div class="transaction-details">
              <span class="transaction-description">{{ transaction.description }}</span>
              <span class="transaction-category">{{ transaction.category.name }}</span>
            </div>
            <div class="transaction-amount" [class.income]="transaction.type === 'income'" [class.expense]="transaction.type === 'expense'">
              {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount | number:'1.2-2' }} €
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: transform 0.2s;
    }

    .card:hover {
      transform: translateY(-4px);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .card-title {
      color: #64748b;
      font-size: 0.95rem;
      font-weight: 600;
    }

    .icon {
      font-size: 1.5rem;
    }

    .card-amount {
      font-size: 2rem;
      font-weight: bold;
    }

    .card-amount.income {
      color: #10b981;
    }

    .card-amount.expense {
      color: #ef4444;
    }

    .card-amount.positive {
      color: #10b981;
    }

    .card-amount.negative {
      color: #ef4444;
    }

    .recent-transactions {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .recent-transactions h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 12px;
      background: #f8fafc;
      margin-bottom: 0.75rem;
      transition: background 0.2s;
    }

    .transaction-item:hover {
      background: #e2e8f0;
    }

    .transaction-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .transaction-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .transaction-description {
      font-weight: 600;
      color: #1e293b;
    }

    .transaction-category {
      font-size: 0.875rem;
      color: #94a3b8;
    }

    .transaction-amount {
      font-size: 1.25rem;
      font-weight: bold;
    }

    .transaction-amount.income {
      color: #10b981;
    }

    .transaction-amount.expense {
      color: #ef4444;
    }
  `]
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary = {
    total_income: 0,
    total_expenses: 0,
    balance: 0,
    transactions_count: 0,
    top_categories: []
  };
  recentTransactions: Transaction[] = [];

  constructor(
    private apiService: ApiService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadRecentTransactions();
  }

  loadDashboardData(): void {
    this.apiService.getDashboardSummary().subscribe({
      next: (response) => {
        this.summary = response.data;
      },
      error: (error) => console.error('Error loading dashboard:', error)
    });
  }

  loadRecentTransactions(): void {
    this.apiService.getTransactions({ limit: 5 }).subscribe({
      next: (response) => {
        this.recentTransactions = response.data;
      },
      error: (error) => console.error('Error loading transactions:', error)
    });
  }
}