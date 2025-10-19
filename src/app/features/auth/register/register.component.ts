import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">💰</div>
          <h1>Budget Calculator</h1>
          <p>Créez votre compte gratuitement</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Nom complet</label>
            <input 
              type="text" 
              formControlName="name" 
              placeholder="Jean Dupont"
              [class.error]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
            <div class="error-message" *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
              Nom requis
            </div>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              formControlName="email" 
              placeholder="votre@email.com"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
            <div class="error-message" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              Email invalide
            </div>
          </div>

          <div class="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              formControlName="password" 
              placeholder="••••••••"
              [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
            <div class="error-message" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              Minimum 6 caractères
            </div>
          </div>

          <div class="form-group">
            <label>Confirmer le mot de passe</label>
            <input 
              type="password" 
              formControlName="password_confirmation" 
              placeholder="••••••••"
              [class.error]="registerForm.get('password_confirmation')?.invalid && registerForm.get('password_confirmation')?.touched">
            <div class="error-message" *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('password_confirmation')?.touched">
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-submit" [disabled]="registerForm.invalid || loading">
            <span *ngIf="!loading">S'inscrire</span>
            <span *ngIf="loading">Inscription...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p>Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .auth-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 450px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .auth-header h1 {
      font-size: 2rem;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .auth-header p {
      color: #64748b;
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

    .form-group input {
      width: 100%;
      padding: 0.875rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group input.error {
      border-color: #ef4444;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .btn-submit {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 1rem;
    }

    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-footer {
      text-align: center;
      margin-top: 2rem;
      color: #64748b;
    }

    .auth-footer a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('password_confirmation');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { name, email, password, password_confirmation } = this.registerForm.value;

      this.authService.register(name, email, password, password_confirmation).subscribe({
        next: (response) => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription.';
        }
      });
    }
  }
}
