import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pending request cache for in-flight deduplication
const pendingRequests = new Map<string, Promise<any>>();

// Helper to extract clean error message
export const getApiErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';
  if (typeof error === 'string') return error;

  const axiosErr = error as AxiosError<{ message?: string | string[]; error?: string }>;
  if (axiosErr.response?.data) {
    const data = axiosErr.response.data;
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }
    if (typeof data.message === 'string') {
      return data.message;
    }
    if (data.error) {
      return data.error;
    }
  }

  if (axiosErr.code === 'ECONNABORTED' || axiosErr.message?.includes('timeout')) {
    return 'Server request timed out. Please check server connection.';
  }
  if (axiosErr.message === 'Network Error') {
    return 'Unable to reach backend server. Please verify connection.';
  }

  return (error as Error).message || 'Request failed';
};

// Automatic Retry Interceptor for transient network glitches (safe idempotent or 5xx failures)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };
    if (!config) return Promise.reject(error);

    // Only retry on network errors or 502/503/504 server overload
    const status = error.response?.status;
    const isTransientError = !error.response || (status !== undefined && [502, 503, 504].includes(status));

    config._retryCount = config._retryCount || 0;
    const maxRetries = 2;

    if (isTransientError && config._retryCount < maxRetries) {
      config._retryCount += 1;
      const delay = config._retryCount * 500; // 500ms, 1000ms
      await new Promise((resolve) => setTimeout(resolve, delay));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export interface RecipeItem {
  ingredientId?: string;
  ingredientName: string;
  qty: number;
  uom: string;
  cost: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  cost: number;
  packagingCost: number;
  price: number;
  stock: number; // dynamically computed available cups
  icon: string;
  sku: string;
  imageUrl?: string;
  recipe?: RecipeItem[];
}

export interface Ingredient {
  id: string;
  name: string;
  nameKh?: string;
  category: string;
  stock: number;
  uom: string;
  costPerUnit: number;
  minStock: number;
  icon?: string;
}

export interface CategoryEntity {
  id: string;
  name: string;
  nameKh?: string;
  icon?: string;
  isEnabled: boolean;
  itemCount?: number;
  createdAt?: string;
}

export interface ToppingOption {
  name: string;
  price: number;
  icon?: string;
}

export interface DrinkCustomization {
  sugarLevel?: string; // '120%', '100%', '70%', '50%', '30%', '20%', '10%', '0%'
  iceLevel?: string;   // 'Regular Ice', 'Less Ice', 'No Ice', 'Extra Ice', 'Hot'
  toppings?: ToppingOption[];
  notes?: string;
}

export interface CartItem {
  id: string; // Unique identifier based on product id + options
  product: Product;
  quantity: number;
  options?: DrinkCustomization;
  unitPrice: number; // Base price + toppings sum
  originalPrice?: number;
  isPromoFree?: boolean;
  promoBadge?: string;
  pairedWithItemId?: string;
}

export interface CreateOrderPayload {
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    options?: DrinkCustomization;
    notes?: string;
  }[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'QR_CODE';
  amountTendered?: number;
  change?: number;
  idempotencyKey?: string;
}

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalIngredients?: number;
  totalCupsCapacity?: number;
  lowStockIngredientsCount?: number;
  ingredientValuation?: number;
  inventoryCost?: number;
  inventoryValuation?: number;
  recentOrders: any[];
}

export interface StockReportData {
  summary: {
    totalItems: number;
    totalValuation: number;
    lowStockCount: number;
    warningStockCount: number;
    healthyStockCount: number;
    categoriesCount: number;
  };
  items: (Ingredient & {
    stockValuation: number;
    status: 'CRITICAL' | 'WARNING' | 'HEALTHY';
    recipeUsageCount: number;
  })[];
}

export interface IncomeReportData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
    totalExpenses?: number;
    netProfitAfterExpenses?: number;
    netProfitMargin?: number;
    totalOrders: number;
    avgOrderValue: number;
    totalDiscount: number;
  };
  paymentBreakdown: {
    method: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
  dailyBreakdown: {
    date: string;
    revenue: number;
    cost: number;
    profit: number;
    ordersCount: number;
  }[];
}

export type ExpenseCategory =
  | 'WATER'
  | 'ELECTRICITY'
  | 'RENT'
  | 'SALARY'
  | 'MAINTENANCE'
  | 'OTHER';

export type ExpensePaymentMethod = 'CASH' | 'QR_CODE' | 'CARD' | 'BANK_TRANSFER';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: ExpensePaymentMethod;
  note?: string;
  createdAt: string;
}

export interface CreateExpensePayload {
  title: string;
  category: ExpenseCategory;
  amount: number;
  date?: string;
  paymentMethod?: ExpensePaymentMethod;
  note?: string;
}

export interface ExpenseSummaryData {
  totalExpenses: number;
  byCategory: Record<ExpenseCategory, number>;
  utilitiesTotal: number;
  count: number;
}

export interface BestSellingReportData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalUnitsSold: number;
    totalRevenue: number;
    totalProfit: number;
    topSellingProduct: string;
    topCategory: string;
    itemsCount: number;
  };
  items: {
    rank: number;
    productId: string;
    productName: string;
    category: string;
    icon: string;
    sku: string;
    imageUrl?: string;
    quantitySold: number;
    unitPrice: number;
    unitCost: number;
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
  }[];
}

export const posApi = {
  getHealth: async () => {
    const res = await api.get('/health');
    return res.data;
  },

  // Products & Drink Recipes
  getProducts: async (category?: string, search?: string): Promise<Product[]> => {
    const params: Record<string, string> = {};
    if (category && category !== 'All') params.category = category;
    if (search) params.search = search;
    const res = await api.get('/pos/products', { params });
    return res.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const res = await api.get(`/pos/products/${id}`);
    return res.data;
  },

  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const res = await api.post('/pos/products', productData);
    return res.data;
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const res = await api.put(`/pos/products/${id}`, productData);
    return res.data;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/pos/products/${id}`);
    return res.data;
  },

  uploadProductImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/pos/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getCategories: async (): Promise<string[]> => {
    const res = await api.get('/pos/categories');
    return res.data;
  },

  getCategoriesDetails: async (): Promise<CategoryEntity[]> => {
    const res = await api.get('/pos/categories/manage');
    return res.data;
  },

  createCategory: async (categoryData: Partial<CategoryEntity>): Promise<CategoryEntity> => {
    const res = await api.post('/pos/categories', categoryData);
    return res.data;
  },

  updateCategory: async (id: string, categoryData: Partial<CategoryEntity>): Promise<CategoryEntity> => {
    const res = await api.patch(`/pos/categories/${id}`, categoryData);
    return res.data;
  },

  toggleCategoryStatus: async (id: string): Promise<CategoryEntity> => {
    const res = await api.patch(`/pos/categories/${id}/toggle`);
    return res.data;
  },

  deleteCategory: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const res = await api.delete(`/pos/categories/${id}`);
    return res.data;
  },

  // Ingredients & Raw Material Stock
  getIngredients: async (category?: string, search?: string): Promise<Ingredient[]> => {
    const params: Record<string, string> = {};
    if (category && category !== 'All') params.category = category;
    if (search) params.search = search;
    const res = await api.get('/pos/ingredients', { params });
    return res.data;
  },

  getIngredientCategories: async (): Promise<string[]> => {
    const res = await api.get('/pos/ingredients/categories');
    return res.data;
  },

  createIngredient: async (data: Partial<Ingredient>): Promise<Ingredient> => {
    const res = await api.post('/pos/ingredients', data);
    return res.data;
  },

  updateIngredient: async (id: string, data: Partial<Ingredient>): Promise<Ingredient> => {
    const res = await api.put(`/pos/ingredients/${id}`, data);
    return res.data;
  },

  restockIngredient: async (id: string, quantity: number, notes?: string): Promise<Ingredient> => {
    const res = await api.post(`/pos/ingredients/${id}/restock`, { quantity, notes });
    return res.data;
  },

  deleteIngredient: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await api.delete(`/pos/ingredients/${id}`);
    return res.data;
  },

  // Seeding
  seedProducts: async (): Promise<{ success: boolean; message: string; drinksCount: number; ingredientsCount: number }> => {
    const res = await api.post('/pos/seed');
    return res.data;
  },

  // Orders & Transactions
  createOrder: async (payload: CreateOrderPayload) => {
    const key = payload.idempotencyKey || `ORD-${payload.total}_${payload.items.map(i => `${i.productId}:${i.quantity}`).join('|')}`;
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
    const requestPromise = (async () => {
      try {
        const res = await api.post('/pos/orders', payload);
        return res.data;
      } finally {
        setTimeout(() => {
          pendingRequests.delete(key);
        }, 1000);
      }
    })();
    pendingRequests.set(key, requestPromise);
    return requestPromise;
  },

  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const res = await api.get('/pos/dashboard/metrics');
    return res.data;
  },

  getRecentOrders: async (limit = 10) => {
    const res = await api.get('/pos/orders/recent', { params: { limit } });
    return res.data;
  },

  // Reports & Analytics
  getStockReport: async (category?: string, search?: string): Promise<StockReportData> => {
    const params: Record<string, string> = {};
    if (category && category !== 'All') params.category = category;
    if (search) params.search = search;
    const res = await api.get('/pos/reports/stock', { params });
    return res.data;
  },

  getIncomeReport: async (startDate?: string, endDate?: string): Promise<IncomeReportData> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await api.get('/pos/reports/income', { params });
    return res.data;
  },

  getBestSellingReport: async (startDate?: string, endDate?: string, limit = 50, category?: string): Promise<BestSellingReportData> => {
    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (limit) params.limit = limit;
    if (category && category !== 'All') params.category = category;
    const res = await api.get('/pos/reports/best-selling', { params });
    return res.data;
  },

  // Store Expenses (OpEx & Payroll)
  getExpenses: async (startDate?: string, endDate?: string, category?: string, search?: string): Promise<Expense[]> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (category && category !== 'ALL') params.category = category;
    if (search) params.search = search;
    const res = await api.get('/pos/expenses', { params });
    return res.data;
  },

  getExpenseSummary: async (startDate?: string, endDate?: string): Promise<ExpenseSummaryData> => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await api.get('/pos/expenses/summary', { params });
    return res.data;
  },

  createExpense: async (payload: CreateExpensePayload): Promise<Expense> => {
    const res = await api.post('/pos/expenses', payload);
    return res.data;
  },

  deleteExpense: async (id: string): Promise<{ success: boolean; id: string }> => {
    const res = await api.delete(`/pos/expenses/${id}`);
    return res.data;
  },
};

export const getProductImageUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const backendBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default api;
