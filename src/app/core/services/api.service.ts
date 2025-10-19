import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, Category, DashboardSummary } from '../../models/transaction.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Transactions
  getTransactions(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<any>(`${this.apiUrl}/transactions`, { params: httpParams });
  }

  getTransaction(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transactions/${id}`);
  }

  createTransaction(transaction: Partial<Transaction>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/transactions`, transaction);
  }

  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/transactions/${id}`, transaction);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/transactions/${id}`);
  }

  // Categories
  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories`);
  }

  createCategory(category: Partial<Category>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/categories`, category);
  }

  // Dashboard
  getDashboardSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/summary`);
  }

  getChartData(period: string = 'month'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/chart-data`, {
      params: { period }
    });
  }

  updateCategory(id: number, category: Partial<Category>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/categories/${id}`);
  }
}