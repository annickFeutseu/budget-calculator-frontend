import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container" *ngIf="isAuthenticated">
      <nav class="sidebar">
        <div class="logo">
          <span class="logo-icon">💰</span>
          <span class="logo-text">Budget App</span>
        </div>
        
        <div class="user-info" *ngIf="currentUser">
          <div class="user-avatar">{{ currentUser.name.charAt(0).toUpperCase() }}</div>
          <div class="user-details">
            <div class="user-name">{{ currentUser.name }}</div>
            <div class="user-email">{{ currentUser.email }}</div>
          </div>
        </div>

        <ul class="nav-menu">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">📊</span>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a routerLink="/transactions" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">💳</span>
              <span>Transactions</span>
            </a>
          </li>
          <li>
            <a routerLink="/categories" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">🏷️</span>
              <span>Catégories</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <span class="nav-icon">🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>

    <div *ngIf="!isAuthenticated">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
      background: #f1f5f9;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem 1rem;
      box-shadow: 4px 0 12px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .user-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: white;
      color: #667eea;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.25rem;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      color: white;
      font-weight: 600;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      color: rgba(255,255,255,0.7);
      font-size: 0.8rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-menu {
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      border-radius: 12px;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
      font-weight: 500;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.1);
      color: white;
    }

    .nav-link.active {
      background: white;
      color: #667eea;
    }

    .nav-icon {
      font-size: 1.25rem;
    }

    .sidebar-footer {
      padding-top: 1rem;
      border-top: 1px solid rgba(255,255,255,0.2);
    }

    .logout-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.9);
      border: none;
      border-radius: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.2);
      color: white;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .app-container {
        flex-direction: column;
      }

      .sidebar {
        width: 100%;
        padding: 1rem;
      }

      .nav-menu {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
      }

      .nav-link span:not(.nav-icon) {
        display: none;
      }

      .user-info {
        margin-bottom: 1rem;
      }

      .sidebar-footer {
        display: none;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'budget-calculator';
  isAuthenticated = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: () => {
          // Force logout même si l'API échoue
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }
      });
    }
  }
}