import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { ApiService } from '../../../core/services/api.service';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { Transaction, Category } from '../../../models/transaction.model';
import { from } from 'rxjs';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TransactionFormComponent],
  template: `
    <div class="transaction-page">
      <div class="page-header">
        <h1>Gestion des Transactions</h1>
        <button class="btn-add" (click)="showForm = !showForm">
          {{ showForm ? 'Annuler' : '+ Nouvelle Transaction' }}
        </button>
      </div>

      <!-- Formulaire -->
      <div *ngIf="showForm" class="form-section">
        <app-transaction-form
          [transaction]="editingTransaction"
          [categories]="categories"
          (submitForm)="onSubmit($event)"
          (cancelEdit)="onCancelEdit()">
        </app-transaction-form>
      </div>

      <!-- Filtres -->
      <div class="filters-section">
        <div class="filter-group">
          <label>Type</label>
          <select [(ngModel)]="filters.type" (change)="applyFilters()">
            <option value="">Tous</option>
            <option value="income">Revenus</option>
            <option value="expense">Dépenses</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Catégorie</label>
          <select [(ngModel)]="filters.category_id" (change)="applyFilters()">
            <option value="">Toutes</option>
            <option *ngFor="let cat of categories" [value]="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Date début</label>
          <input type="date" [(ngModel)]="filters.start_date" (change)="applyFilters()">
        </div>

        <div class="filter-group">
          <label>Date fin</label>
          <input type="date" [(ngModel)]="filters.end_date" (change)="applyFilters()">
        </div>

        <button class="btn-reset" (click)="resetFilters()">
          Réinitialiser
        </button>
      </div>

      <!-- Liste des transactions -->
      <div class="transactions-container">
        <div *ngIf="loading" class="loading">
          <div class="spinner"></div>
          <p>Chargement...</p>
        </div>

        <div *ngIf="!loading && transactions.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>Aucune transaction</h3>
          <p>Commencez par ajouter votre première transaction</p>
        </div>

        <div *ngIf="!loading && transactions.length > 0" class="transaction-grid">
          <div *ngFor="let transaction of transactions" class="transaction-card"
               [class.income]="transaction.type === 'income'"
               [class.expense]="transaction.type === 'expense'">
            
            <div class="card-header">
              <div class="category-badge" [style.background-color]="transaction.category.color + '20'">
                <span class="category-icon">{{ transaction.category.icon }}</span>
                <span class="category-name">{{ transaction.category.name }}</span>
              </div>
              <div class="card-actions">
                <button class="btn-icon edit" (click)="onEdit(transaction)" title="Modifier">
                  ✏️
                </button>
                <button class="btn-icon delete" (click)="onDelete(transaction.id)" title="Supprimer">
                  🗑️
                </button>
              </div>
            </div>

            <div class="card-body">
              <div class="transaction-amount" [class.positive]="transaction.type === 'income'">
                {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount | number:'1.2-2' }} €
              </div>
              <p class="transaction-description">{{ transaction.description }}</p>
              <div class="transaction-date">
                📅 {{ transaction.transaction_date | date:'dd/MM/yyyy' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div *ngIf="pagination.total > pagination.per_page" class="pagination">
          <button 
            [disabled]="pagination.current_page === 1"
            (click)="changePage(pagination.current_page - 1)">
            Précédent
          </button>
          <span class="page-info">
            Page {{ pagination.current_page }} sur {{ Math.ceil(pagination.total / pagination.per_page) }}
          </span>
          <button 
            [disabled]="pagination.current_page >= Math.ceil(pagination.total / pagination.per_page)"
            (click)="changePage(pagination.current_page + 1)">
            Suivant
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transaction-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: bold;
      color: #1e293b;
      margin: 0;
    }

    .btn-add {
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      background: white;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      margin-bottom: 2rem;
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .filter-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #475569;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .filter-group select,
    .filter-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .filter-group select:focus,
    .filter-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-reset {
      padding: 0.75rem 1.5rem;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      color: #64748b;
      font-weight: 600;
      cursor: pointer;
      align-self: flex-end;
      transition: all 0.2s;
    }

    .btn-reset:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
    }

    .transactions-container {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #94a3b8;
    }

    .transaction-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .transaction-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.5rem;
      transition: all 0.2s;
    }

    .transaction-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }

    .transaction-card.income {
      border-color: #10b981;
    }

    .transaction-card.expense {
      border-color: #ef4444;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .category-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.875rem;
      border-radius: 8px;
    }

    .category-icon {
      font-size: 1.25rem;
    }

    .category-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.875rem;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
      opacity: 0.6;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    .card-body {
      text-align: center;
    }

    .transaction-amount {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.75rem;
    }

    .transaction-amount.positive {
      color: #10b981;
    }

    .transaction-amount:not(.positive) {
      color: #ef4444;
    }

    .transaction-description {
      color: #475569;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }

    .transaction-date {
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #e2e8f0;
    }

    .pagination button {
      padding: 0.5rem 1rem;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      color: #475569;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination button:hover:not(:disabled) {
      background: #f8fafc;
      border-color: #667eea;
      color: #667eea;
    }

    .pagination button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      color: #64748b;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .transaction-page {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .filters-section {
        flex-direction: column;
      }

      .filter-group {
        min-width: 100%;
      }

      .transaction-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  loading = false;
  showForm = false;
  editingTransaction?: Transaction;
  Math = Math;

  filters = {
    type: '',
    category_id: '',
    start_date: '',
    end_date: ''
  };

  pagination = {
    current_page: 1,
    total: 0,
    per_page: 15
  };

  constructor(
    private transactionService: TransactionService,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  loadTransactions(): void {
    this.loading = true;
    // const params = { ...this.filters, page: this.pagination.current_page };
    const params: any = {};

    // Ajouter la pagination
    params.page = this.pagination.current_page;
    // Ajouter les filtres seulement s'ils ne sont pas vides
    if (this.filters.type) params.type = this.filters.type;
    if (this.filters.category_id) params.category_id = this.filters.category_id;
    if (this.filters.start_date) params.start_date = this.filters.start_date;
    if (this.filters.end_date) params.end_date = this.filters.end_date;

    // Nettoyer les paramètres vides
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });

    this.apiService.getTransactions(params).subscribe({
      next: (response) => {
        this.transactions = response.data;
        this.pagination = response.meta;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.pagination.current_page = 1;
    this.loadTransactions();
  }

  resetFilters(): void {
    this.filters = {
      type: '',
      category_id: '',
      start_date: '',
      end_date: ''
    };
    this.applyFilters();
  }

  changePage(page: number): void {
    this.pagination.current_page = page;
    this.loadTransactions();
  }

  onSubmit(formData: any): void {
    if (this.editingTransaction) {
      this.transactionService.updateTransaction(this.editingTransaction.id, formData).subscribe({
        next: () => {
          this.showForm = false;
          this.editingTransaction = undefined;
          this.loadTransactions();
        },
        error: (error) => console.error('Error updating transaction:', error)
      });
    } else {
      this.transactionService.addTransaction(formData).subscribe({
        next: () => {
          this.showForm = false;
          this.loadTransactions();
        },
        error: (error) => console.error('Error creating transaction:', error)
      });
    }
  }

  onEdit(transaction: Transaction): void {
    this.editingTransaction = transaction;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onCancelEdit(): void {
    this.editingTransaction = undefined;
    this.showForm = false;
  }

  onDelete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.loadTransactions();
        },
        error: (error) => console.error('Error deleting transaction:', error)
      });
    }
  }
}