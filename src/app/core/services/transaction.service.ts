import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Transaction } from '../../models/transaction.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();
  private authService = inject(AuthService);

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private apiService: ApiService) {}

  loadTransactions(filters?: any): void {
    this.loadingSubject.next(true);
    this.apiService.getTransactions(filters).pipe(
      tap(() => this.loadingSubject.next(false))
    ).subscribe({
      next: (response) => {
        this.transactionsSubject.next(response.data);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.loadingSubject.next(false);
      }
    });
  }

  /**
   * Récupère le cookie CSRF avant chaque requête protégée
   */
  private withCsrf<T>(request: Observable<T>): Observable<T> {
    return this.authService.getCsrfCookie().pipe(
      switchMap(() => request)
    );
  }

  addTransaction(transaction: Partial<Transaction>): Observable<any> {
    return this.withCsrf(this.apiService.createTransaction(transaction).pipe(
      tap(() => this.loadTransactions())
    ));
  }

  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<any> {
    return this.withCsrf(this.apiService.updateTransaction(id, transaction).pipe(
      tap(() => this.loadTransactions())
    ));
  }

  deleteTransaction(id: number): Observable<any> {
    return this.withCsrf(this.apiService.deleteTransaction(id).pipe(
      tap(() => this.loadTransactions())
    ));
  }

  calculateTotals(transactions: Transaction[]) {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  }
}