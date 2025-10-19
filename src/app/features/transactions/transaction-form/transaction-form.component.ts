import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Transaction, Category } from '../../../models/transaction.model';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>{{ editMode ? 'Modifier' : 'Ajouter' }} une Transaction</h2>
      
      <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label>Type</label>
          <div class="type-buttons">
            <button type="button" 
                    (click)="setType('income')"
                    [class.active]="transactionForm.get('type')?.value === 'income'">
              Revenu
            </button>
            <button type="button" 
                    (click)="setType('expense')"
                    [class.active]="transactionForm.get('type')?.value === 'expense'">
              Dépense
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Catégorie</label>
          <select formControlName="category_id" required>
            <option value="">Sélectionner une catégorie</option>
            <option *ngFor="let cat of filteredCategories" [value]="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Montant (€)</label>
          <input type="number" formControlName="amount" step="0.01" required>
        </div>

        <div class="form-group">
          <label>Description</label>
          <input type="text" formControlName="description" required>
        </div>

        <div class="form-group">
          <label>Date</label>
          <input type="date" formControlName="transaction_date" required>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="!transactionForm.valid">
            {{ editMode ? 'Mettre à jour' : 'Ajouter' }}
          </button>
          <button type="button" class="btn-secondary" (click)="onCancel()" *ngIf="editMode">
            Annuler
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #475569;
      font-weight: 600;
    }

    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
    }

    .type-buttons {
      display: flex;
      gap: 1rem;
    }

    .type-buttons button {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      background: white;
      color: #64748b;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .type-buttons button.active {
      border-color: #667eea;
      background: #f0f4ff;
      color: #667eea;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      border: 2px solid #e2e8f0;
      color: #64748b;
    }

    .btn-secondary:hover {
      background: #f8fafc;
    }
  `]
})
export class TransactionFormComponent implements OnInit {
  @Input() transaction?: Transaction;
  @Input() categories: Category[] = [];
  @Output() submitForm = new EventEmitter<any>();
  @Output() cancelEdit = new EventEmitter<void>();

  transactionForm: FormGroup;
  editMode = false;
  filteredCategories: Category[] = [];

  constructor(private fb: FormBuilder) {
    this.transactionForm = this.fb.group({
      category_id: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      type: ['expense', Validators.required],
      description: ['', Validators.required],
      transaction_date: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.transaction) {
      this.editMode = true;
      this.transactionForm.patchValue({
        category_id: this.transaction.category.id,
        amount: this.transaction.amount,
        type: this.transaction.type,
        description: this.transaction.description,
        transaction_date: this.transaction.transaction_date
      });
    }

    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      this.filterCategories(type);
    });

    this.filterCategories(this.transactionForm.get('type')?.value);
  }

  setType(type: 'income' | 'expense'): void {
    this.transactionForm.patchValue({ type, category_id: '' });
  }

  filterCategories(type: string): void {
    this.filteredCategories = this.categories.filter(cat => cat.type === type);
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.submitForm.emit(this.transactionForm.value);
    }
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }
}
