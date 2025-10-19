export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  transaction_date: string;
  category: Category;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

export interface Budget {
  id: number;
  category_id: number;
  amount: number;
  period: 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
}

export interface DashboardSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  transactions_count: number;
  top_categories: CategoryExpense[];
}

export interface CategoryExpense {
  category: string;
  total: number;
  color: string;
  icon: string;
}