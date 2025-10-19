import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Category } from '../../../models/transaction.model';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="category-page">
      <div class="page-header">
        <h1>Gestion des Catégories</h1>
      </div>

      <div class="content-grid">
        <!-- Formulaire -->
        <div class="form-card">
          <h2>{{ editMode ? 'Modifier' : 'Nouvelle' }} Catégorie</h2>
          
          <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>Type</label>
              <div class="type-buttons">
                <button type="button" 
                        (click)="setType('income')"
                        [class.active]="categoryForm.get('type')?.value === 'income'">
                  💰 Revenu
                </button>
                <button type="button" 
                        (click)="setType('expense')"
                        [class.active]="categoryForm.get('type')?.value === 'expense'">
                  💸 Dépense
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Nom de la catégorie</label>
              <input type="text" formControlName="name" placeholder="Ex: Alimentation" required>
            </div>

            <div class="form-group">
              <label>Icône (emoji)</label>
              <div class="icon-selector">
                <div *ngFor="let emoji of availableEmojis" 
                     class="emoji-option"
                     [class.selected]="categoryForm.get('icon')?.value === emoji"
                     (click)="selectIcon(emoji)">
                  {{ emoji }}
                </div>
              </div>
              <input type="text" formControlName="icon" placeholder="ou tapez un emoji" maxlength="2">
            </div>

            <div class="form-group">
              <label>Couleur</label>
              <div class="color-selector">
                <div *ngFor="let color of availableColors" 
                     class="color-option"
                     [style.background-color]="color"
                     [class.selected]="categoryForm.get('color')?.value === color"
                     (click)="selectColor(color)">
                </div>
              </div>
              <input type="color" formControlName="color">
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" [disabled]="!categoryForm.valid">
                {{ editMode ? 'Mettre à jour' : 'Créer' }}
              </button>
              <button type="button" class="btn-secondary" (click)="cancelEdit()" *ngIf="editMode">
                Annuler
              </button>
            </div>
          </form>
        </div>

        <!-- Liste des catégories -->
        <div class="categories-list">
          <div class="category-section">
            <h3>💰 Revenus ({{ incomeCategories.length }})</h3>
            <div class="category-grid">
              <div *ngFor="let cat of incomeCategories" class="category-item">
                <div class="category-preview" [style.background-color]="cat.color + '20'">
                  <span class="category-emoji" [style.color]="cat.color">{{ cat.icon }}</span>
                  <span class="category-label">{{ cat.name }}</span>
                </div>
                <div class="category-actions">
                  <button (click)="editCategory(cat)" title="Modifier">✏️</button>
                  <button (click)="deleteCategory(cat.id)" title="Supprimer">🗑️</button>
                </div>
              </div>
            </div>
          </div>

          <div class="category-section">
            <h3>💸 Dépenses ({{ expenseCategories.length }})</h3>
            <div class="category-grid">
              <div *ngFor="let cat of expenseCategories" class="category-item">
                <div class="category-preview" [style.background-color]="cat.color + '20'">
                  <span class="category-emoji" [style.color]="cat.color">{{ cat.icon }}</span>
                  <span class="category-label">{{ cat.name }}</span>
                </div>
                <div class="category-actions">
                  <button (click)="editCategory(cat)" title="Modifier">✏️</button>
                  <button (click)="deleteCategory(cat.id)" title="Supprimer">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .category-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 2rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 2rem;
    }

    .form-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      height: fit-content;
      position: sticky;
      top: 2rem;
    }

    .form-card h2 {
      margin-bottom: 1.5rem;
      color: #1e293b;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #475569;
      font-weight: 600;
    }

    .form-group input[type="text"],
    .form-group input[type="color"] {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
    }

    .form-group input:focus {
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
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .type-buttons button.active {
      border-color: #667eea;
      background: #f0f4ff;
      color: #667eea;
    }

    .icon-selector {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .emoji-option {
      font-size: 1.5rem;
      padding: 0.5rem;
      text-align: center;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .emoji-option:hover {
      border-color: #667eea;
      transform: scale(1.1);
    }

    .emoji-option.selected {
      border-color: #667eea;
      background: #f0f4ff;
    }

    .color-selector {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .color-option {
      width: 100%;
      padding-top: 100%;
      border-radius: 8px;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.2s;
    }

    .color-option:hover {
      transform: scale(1.1);
    }

    .color-option.selected {
      border-color: #1e293b;
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

    .categories-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .category-section {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .category-section h3 {
      margin-bottom: 1.5rem;
      color: #1e293b;
      font-size: 1.25rem;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .category-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      transition: all 0.2s;
    }

    .category-item:hover {
      border-color: #cbd5e1;
      transform: translateY(-2px);
    }

    .category-preview {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      padding: 0.5rem;
      border-radius: 8px;
    }

    .category-emoji {
      font-size: 1.5rem;
    }

    .category-label {
      font-weight: 600;
      color: #1e293b;
    }

    .category-actions {
      display: flex;
      gap: 0.5rem;
    }

    .category-actions button {
      background: none;
      border: none;
      font-size: 1.125rem;
      cursor: pointer;
      opacity: 0.6;
      transition: all 0.2s;
    }

    .category-actions button:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .form-card {
        position: static;
      }
    }
  `]
})
export class CategoryManagerComponent implements OnInit {
  categories: Category[] = [];
  categoryForm: FormGroup;
  editMode = false;
  editingId?: number;

  availableEmojis = ['💰', '💼', '💻', '📈', '🏠', '🛒', '🚗', '⚡', '🍽️', '⚕️', '🎮', '📚', '✈️', '🎬', '👕', '💅'];
  availableColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      type: ['expense', Validators.required],
      icon: ['💰', Validators.required],
      color: ['#3b82f6', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  get incomeCategories(): Category[] {
    return this.categories.filter(cat => cat.type === 'income');
  }

  get expenseCategories(): Category[] {
    return this.categories.filter(cat => cat.type === 'expense');
  }

  setType(type: 'income' | 'expense'): void {
    this.categoryForm.patchValue({ type });
  }

  selectIcon(icon: string): void {
    this.categoryForm.patchValue({ icon });
  }

  selectColor(color: string): void {
    this.categoryForm.patchValue({ color });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      const formData = this.categoryForm.value;
      
      if (this.editMode && this.editingId) {
        this.apiService.updateCategory(this.editingId, formData).subscribe({
          next: () => {
            this.loadCategories();
            this.resetForm();
          },
          error: (error) => console.error('Error updating category:', error)
        });
      } else {
        this.apiService.createCategory(formData).subscribe({
          next: () => {
            this.loadCategories();
            this.resetForm();
          },
          error: (error) => console.error('Error creating category:', error)
        });
      }
    }
  }

  editCategory(category: Category): void {
    this.editMode = true;
    this.editingId = category.id;
    this.categoryForm.patchValue({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteCategory(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      this.apiService.deleteCategory(id).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (error) => {
          if (error.status === 422) {
            alert('Impossible de supprimer une catégorie avec des transactions associées.');
          } else {
            console.error('Error deleting category:', error);
          }
        }
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.editMode = false;
    this.editingId = undefined;
    this.categoryForm.reset({
      name: '',
      type: 'expense',
      icon: '💰',
      color: '#3b82f6'
    });
  }
}