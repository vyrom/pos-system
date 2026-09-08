import { defineStore } from 'pinia';
import { posApi, getApiErrorMessage, Product, Ingredient, CartItem, CreateOrderPayload, DrinkCustomization, ToppingOption } from '../services/api';

export type PromotionType = 'BOGO_ALL' | 'BOGO_CUSTOM' | 'BUY_2_GET_1' | 'PERCENTAGE' | 'FIXED';

export type PromotionStatus = 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'DISABLED';

export interface Promotion {
  id: string;
  name: {
    en: string;
    km: string;
  };
  type: PromotionType;
  badge: string;
  description: {
    en: string;
    km: string;
  };
  isActive: boolean;
  startDate?: string; // YYYY-MM-DD format
  endDate?: string;   // YYYY-MM-DD format
  eligibleCategories?: string[];
  eligibleProductIds?: string[];
  discountValue?: number;
  buyQty?: number; // Quantity required to buy (e.g. 1 for BOGO, 2 for BUY_2_GET_1)
  getQty?: number; // Quantity of free drinks given (default: 1)
}

export function isPromotionCurrentlyValid(promo: Promotion): boolean {
  if (!promo.isActive) return false;
  const todayStr = new Date().toISOString().slice(0, 10);

  if (promo.startDate && promo.startDate > todayStr) {
    return false; // Not started yet
  }
  if (promo.endDate && promo.endDate < todayStr) {
    return false; // Expired
  }
  return true;
}

export function isProductEligibleForPromotion(product: Product, promo?: Promotion | null): boolean {
  if (!promo || !isPromotionCurrentlyValid(promo)) return false;
  if (promo.type === 'BOGO_ALL' || promo.type === 'BUY_2_GET_1') return true;
  if (promo.type === 'BOGO_CUSTOM') {
    const eligibleCats = (promo.eligibleCategories || []).map((c) => c.toLowerCase());
    const eligibleProds = promo.eligibleProductIds || [];
    const cat = (product.category || '').toLowerCase();
    return eligibleCats.some((c) => cat.includes(c) || c.includes(cat)) || eligibleProds.includes(product.id);
  }
  return false;
}

export function getPromotionStatus(promo: Promotion): PromotionStatus {
  if (!promo.isActive) return 'DISABLED';
  const todayStr = new Date().toISOString().slice(0, 10);

  if (promo.startDate && promo.startDate > todayStr) {
    return 'UPCOMING';
  }
  if (promo.endDate && promo.endDate < todayStr) {
    return 'EXPIRED';
  }
  return 'ACTIVE';
}

export const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'promo_bogo_all',
    name: {
      en: 'Buy 1 Get 1 (All Drinks)',
      km: 'ទិញ ១ ថែម ១ (គ្រប់មុខ)',
    },
    type: 'BOGO_ALL',
    badge: '🎁 BOGO All',
    description: {
      en: 'Buy 1 drink, get 1 free across all items in menu',
      km: 'ទិញ ១ កែវ ថែមជូន ១ កែវដោយឥតគិតថ្លៃ គ្រប់មុខទំនិញ',
    },
    isActive: true,
    buyQty: 1,
    getQty: 1,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '2026-12-31',
  },
  {
    id: 'promo_bogo_custom',
    name: {
      en: 'Buy 1 Get 1 (Ice Coffee & Tea)',
      km: 'ទិញ ១ ថែម ១ (កាហ្វេទឹកកក & តែ)',
    },
    type: 'BOGO_CUSTOM',
    badge: '☕ BOGO Custom',
    description: {
      en: 'Buy 1 Ice Coffee or Tea, get 1 free',
      km: 'ទិញ ១ ថែម ១ សម្រាប់កាហ្វេទឹកកក និងតែទឹកដោះគោ',
    },
    isActive: true,
    buyQty: 1,
    getQty: 1,
    eligibleCategories: ['Ice Coffee', 'Tea & Milk Tea', 'កាហ្វេទឹកកក', 'តែ & តែទឹកដោះគោ'],
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '2026-12-31',
  },
  {
    id: 'promo_buy2_get1',
    name: {
      en: 'Buy 2 Get 1 Free',
      km: 'ទិញ ២ ថែម ១',
    },
    type: 'BUY_2_GET_1',
    badge: '🎉 Buy 2 Get 1',
    description: {
      en: 'For every 2 drinks purchased, get the 3rd drink free',
      km: 'ទិញ ២ កែវ ទទួលបាន ១ កែវដោយឥតគិតថ្លៃ',
    },
    isActive: true,
    buyQty: 2,
    getQty: 1,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '2026-12-31',
  },
  {
    id: 'promo_discount_20',
    name: {
      en: '20% Storewide Discount',
      km: 'បញ្ចុះតម្លៃ ២០%',
    },
    type: 'PERCENTAGE',
    badge: '⚡ 20% Off',
    description: {
      en: 'Special 20% discount on entire bill',
      km: 'បញ្ចុះតម្លៃ ២០% លើវិក្កយបត្រសរុប',
    },
    isActive: true,
    discountValue: 20,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '2026-12-31',
  },
];

const CART_STORAGE_KEY = 'pos_current_cart';
const DISCOUNT_STORAGE_KEY = 'pos_current_discount';
const PROMOTIONS_STORAGE_KEY = 'pos_promotions_config';
const SELECTED_PROMO_STORAGE_KEY = 'pos_selected_promotion';

export function generateCartItemId(product: Product, options?: DrinkCustomization, isPromoFree: boolean = false): string {
  const prefix = isPromoFree ? `free_${product.id}` : product.id;
  if (!options) return `${prefix}_default`;
  const sugar = options.sugarLevel || '100%';
  const ice = options.iceLevel || 'Regular Ice';
  const toppings = (options.toppings || []).map((t) => t.name).sort().join(',');
  const notes = (options.notes || '').trim().toLowerCase();
  return `${prefix}_s:${sugar}_i:${ice}_t:[${toppings}]_n:${notes}`;
}

export function calculateItemUnitPrice(product: Product, options?: DrinkCustomization): number {
  const toppingsSum = (options?.toppings || []).reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  return parseFloat(((Number(product.price) || 0) + toppingsSum).toFixed(2));
}

function getStoredCart(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => item && item.product && typeof item.quantity === 'number')
        .map((item) => {
          const originalPrice = item.originalPrice || calculateItemUnitPrice(item.product, item.options);
          const unitPrice = item.isPromoFree ? 0 : (item.unitPrice !== undefined ? item.unitPrice : originalPrice);
          const id = item.id || generateCartItemId(item.product, item.options, item.isPromoFree);
          return {
            ...item,
            id,
            unitPrice,
            originalPrice,
          };
        });
    }
  } catch (e) {
    console.error('Failed to parse cached cart', e);
  }
  return [];
}

function getStoredDiscount(): number {
  if (typeof localStorage === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (raw !== null) {
      const val = parseFloat(raw);
      if (!isNaN(val)) return val;
    }
  } catch (e) {}
  return 0;
}

function getStoredPromotions(): Promotion[] {
  if (typeof localStorage === 'undefined') return DEFAULT_PROMOTIONS;
  try {
    const raw = localStorage.getItem(PROMOTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return DEFAULT_PROMOTIONS;
}

function getStoredSelectedPromo(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(SELECTED_PROMO_STORAGE_KEY) || null;
  } catch (e) {
    return null;
  }
}

function getStoredVatEnabled(): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    const item = localStorage.getItem('pos_vat_enabled');
    return item !== 'false';
  } catch (e) {
    return true;
  }
}

function getStoredVatPercentage(): number {
  if (typeof localStorage === 'undefined') return 8;
  try {
    const item = localStorage.getItem('pos_vat_percentage');
    if (item !== null) {
      const val = parseFloat(item);
      if (!isNaN(val) && val >= 0 && val <= 100) return val;
    }
  } catch (e) {}
  return 8;
}

export const usePosStore = defineStore('pos', {
  state: () => ({
    products: [] as Product[],
    categories: ['All'] as string[],
    selectedCategory: (typeof localStorage !== 'undefined' ? localStorage.getItem('pos_selected_category') : null) || 'All',
    searchQuery: '',
    
    // Ingredients state
    ingredients: [] as Ingredient[],
    ingredientCategories: ['All'] as string[],
    selectedIngredientCategory: (typeof localStorage !== 'undefined' ? localStorage.getItem('pos_selected_ingredient_category') : null) || 'All',
    ingredientSearchQuery: '',

    // Cart & Promotions & VAT Settings
    cart: getStoredCart(),
    discountPercentage: getStoredDiscount(),
    promotions: getStoredPromotions(),
    selectedPromotionId: getStoredSelectedPromo(),
    vatEnabled: getStoredVatEnabled(),
    vatPercentage: getStoredVatPercentage(),
    taxRate: 0.08, // Deprecated fallback
    isLoading: false,
    isSubmitting: false,
    error: null as string | null,
    lastCompletedOrder: null as any,
  }),

  getters: {
    cartItemCount: (state) => {
      return state.cart.reduce((total, item) => total + item.quantity, 0);
    },

    subtotal: (state) => {
      const sum = state.cart.reduce((total, item) => total + (item.unitPrice !== undefined ? item.unitPrice : item.product.price) * item.quantity, 0);
      return parseFloat(sum.toFixed(2));
    },

    grossSubtotal: (state) => {
      const sum = state.cart.reduce((total, item) => {
        const p = item.isPromoFree ? (item.originalPrice || item.product.price) : (item.unitPrice || item.product.price);
        return total + p * item.quantity;
      }, 0);
      return parseFloat(sum.toFixed(2));
    },

    activePromotion(state): Promotion | null {
      if (state.selectedPromotionId) {
        const promo = state.promotions.find((p) => p.id === state.selectedPromotionId && isPromotionCurrentlyValid(p));
        if (promo) return promo;
      }
      // Auto-detect first valid active promotion
      const activeValid = state.promotions.find((p) => isPromotionCurrentlyValid(p));
      return activeValid || null;
    },

    validPromotions(state): Promotion[] {
      return state.promotions.filter((p) => isPromotionCurrentlyValid(p));
    },

    unclaimedBogoCount(state): number {
      const promo = this.activePromotion;
      if (!promo || (promo.type !== 'BOGO_ALL' && promo.type !== 'BOGO_CUSTOM' && promo.type !== 'BUY_2_GET_1')) return 0;

      let paidEligibleCount = 0;
      let freeCount = 0;

      for (const item of state.cart) {
        const isEligible = isProductEligibleForPromotion(item.product, promo);
        if (isEligible) {
          if (item.isPromoFree) {
            freeCount += item.quantity;
          } else {
            paidEligibleCount += item.quantity;
          }
        }
      }

      const buyReq = promo.buyQty || (promo.type === 'BUY_2_GET_1' ? 2 : 1);
      const getReq = promo.getQty || 1;
      const maxFree = Math.floor(paidEligibleCount / buyReq) * getReq;
      return Math.max(0, maxFree - freeCount);
    },

    promotionDiscountCalc(state): { discount: number; freeItemsCount: number; details: string } {
      const promo = this.activePromotion;
      if (!state.cart.length) {
        return { discount: 0, freeItemsCount: 0, details: '' };
      }

      // 1. Calculate savings from any explicitly added promo free items ($0.00 items in cart)
      const explicitFreeItems = state.cart.filter((item) => item.isPromoFree);
      const explicitFreeSavings = explicitFreeItems.reduce(
        (sum, item) => sum + (item.originalPrice || item.product.price) * item.quantity,
        0
      );
      const explicitFreeCount = explicitFreeItems.reduce((sum, item) => sum + item.quantity, 0);

      if (!promo) {
        if (explicitFreeCount > 0) {
          return {
            discount: parseFloat(explicitFreeSavings.toFixed(2)),
            freeItemsCount: explicitFreeCount,
            details: `${explicitFreeCount} free promo cup(s)`,
          };
        }
        return { discount: 0, freeItemsCount: 0, details: '' };
      }

      // Percentage discount
      if (promo.type === 'PERCENTAGE') {
        const val = promo.discountValue || 0;
        const discount = (this.subtotal * val) / 100;
        return {
          discount: parseFloat(discount.toFixed(2)),
          freeItemsCount: 0,
          details: `${val}% off`,
        };
      }

      // Fixed dollar discount
      if (promo.type === 'FIXED') {
        const val = promo.discountValue || 0;
        const discount = Math.min(this.subtotal, val);
        return {
          discount: parseFloat(discount.toFixed(2)),
          freeItemsCount: 0,
          details: `$${val.toFixed(2)} off`,
        };
      }

      // If free items are already in cart as $0 items
      if (explicitFreeCount > 0) {
        return {
          discount: parseFloat(explicitFreeSavings.toFixed(2)),
          freeItemsCount: explicitFreeCount,
          details: `${explicitFreeCount} free drink(s)`,
        };
      }

      // Automatic fallback calculation if customer added 2 paid drinks without using BOGO promo item button
      const units: { productId: string; category: string; unitPrice: number; name: string }[] = [];
      for (const item of state.cart) {
        if (!item.isPromoFree) {
          const uPrice = item.unitPrice || item.product.price;
          for (let k = 0; k < item.quantity; k++) {
            units.push({
              productId: item.product.id,
              category: item.product.category || '',
              unitPrice: uPrice,
              name: item.product.name,
            });
          }
        }
      }

      if (promo.type === 'BOGO_ALL') {
        units.sort((a, b) => a.unitPrice - b.unitPrice);
        const freeCount = Math.floor(units.length / 2);
        let discount = 0;
        for (let i = 0; i < freeCount; i++) {
          discount += units[i].unitPrice;
        }
        return {
          discount: parseFloat(discount.toFixed(2)),
          freeItemsCount: freeCount,
          details: `${freeCount} free drink(s)`,
        };
      }

      if (promo.type === 'BOGO_CUSTOM') {
        const eligibleCats = (promo.eligibleCategories || []).map((c) => c.toLowerCase());
        const eligibleProds = promo.eligibleProductIds || [];

        const eligibleUnits = units.filter((u) => {
          const matchCat = eligibleCats.some((c) => u.category.toLowerCase().includes(c) || c.includes(u.category.toLowerCase()));
          const matchProd = eligibleProds.includes(u.productId);
          return matchCat || matchProd;
        });

        eligibleUnits.sort((a, b) => a.unitPrice - b.unitPrice);
        const freeCount = Math.floor(eligibleUnits.length / 2);
        let discount = 0;
        for (let i = 0; i < freeCount; i++) {
          discount += eligibleUnits[i].unitPrice;
        }
        return {
          discount: parseFloat(discount.toFixed(2)),
          freeItemsCount: freeCount,
          details: `${freeCount} free eligible drink(s)`,
        };
      }

      if (promo.type === 'BUY_2_GET_1') {
        units.sort((a, b) => a.unitPrice - b.unitPrice);
        const freeCount = Math.floor(units.length / 3);
        let discount = 0;
        for (let i = 0; i < freeCount; i++) {
          discount += units[i].unitPrice;
        }
        return {
          discount: parseFloat(discount.toFixed(2)),
          freeItemsCount: freeCount,
          details: `${freeCount} free drink(s)`,
        };
      }

      return { discount: 0, freeItemsCount: 0, details: '' };
    },

    promoDiscountAmount(): number {
      return this.promotionDiscountCalc.discount;
    },

    qualifyingFreeItemsCount(): number {
      return this.promotionDiscountCalc.freeItemsCount;
    },

    manualDiscountAmount(state): number {
      const amount = (this.subtotal * state.discountPercentage) / 100;
      return parseFloat(amount.toFixed(2));
    },

    discountAmount(): number {
      // If free items are already $0 in cart, promo discount is already 0 in net subtotal
      const explicitFreeCount = this.cart.filter((item) => item.isPromoFree).length;
      if (explicitFreeCount > 0) {
        return this.manualDiscountAmount;
      }
      const combined = this.promoDiscountAmount + this.manualDiscountAmount;
      return parseFloat(Math.min(this.subtotal, combined).toFixed(2));
    },

    taxAmount(): number {
      if (!this.vatEnabled) return 0;
      const taxable = Math.max(0, this.subtotal - this.discountAmount);
      return parseFloat((taxable * (this.vatPercentage / 100)).toFixed(2));
    },

    total(): number {
      const calculated = this.subtotal - this.discountAmount + this.taxAmount;
      return parseFloat(Math.max(0, calculated).toFixed(2));
    },

    filteredProducts: (state) => {
      return state.products;
    },

    lowStockIngredients: (state) => {
      return state.ingredients.filter((i) => i.stock <= i.minStock);
    },

    totalIngredientValuation: (state) => {
      return state.ingredients.reduce((sum, i) => sum + (i.stock * i.costPerUnit), 0);
    },
  },

  actions: {
    async loadInitialData() {
      this.isLoading = true;
      this.error = null;
      try {
        const [categoriesData, productsData, ingCats, ingData] = await Promise.all([
          posApi.getCategories(),
          posApi.getProducts(this.selectedCategory, this.searchQuery),
          posApi.getIngredientCategories(),
          posApi.getIngredients(this.selectedIngredientCategory, this.ingredientSearchQuery),
        ]);
        this.categories = categoriesData;
        if (this.selectedCategory !== 'All' && !this.categories.includes(this.selectedCategory)) {
          this.selectedCategory = 'All';
          try { localStorage.setItem('pos_selected_category', 'All'); } catch (e) {}
        }
        this.products = productsData;
        this.syncCartWithProducts();
        this.ingredientCategories = ingCats;
        if (this.selectedIngredientCategory !== 'All' && !this.ingredientCategories.includes(this.selectedIngredientCategory)) {
          this.selectedIngredientCategory = 'All';
          try { localStorage.setItem('pos_selected_ingredient_category', 'All'); } catch (e) {}
        }
        this.ingredients = ingData;
      } catch (err: any) {
        this.error = err.message || 'Failed to load POS data';
        console.error('POS load error:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProducts() {
      this.isLoading = true;
      try {
        this.products = await posApi.getProducts(this.selectedCategory, this.searchQuery);
        this.syncCartWithProducts();
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch products';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchIngredients() {
      this.isLoading = true;
      try {
        this.ingredients = await posApi.getIngredients(
          this.selectedIngredientCategory,
          this.ingredientSearchQuery,
        );
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch ingredients';
      } finally {
        this.isLoading = false;
      }
    },

    async addProduct(productData: Partial<Product>) {
      this.isLoading = true;
      try {
        const created = await posApi.createProduct(productData);
        await this.loadInitialData();
        return created;
      } catch (err: any) {
        this.error = err.message || 'Failed to create product';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async editProduct(id: string, productData: Partial<Product>) {
      this.isLoading = true;
      try {
        const updated = await posApi.updateProduct(id, productData);
        const inCart = this.cart.find((c) => c.product.id === id);
        if (inCart) {
          inCart.product = updated;
          this.persistCart();
        }
        await this.loadInitialData();
        return updated;
      } catch (err: any) {
        this.error = err.message || 'Failed to update product';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async removeProduct(id: string) {
      this.isLoading = true;
      try {
        await posApi.deleteProduct(id);
        this.cart = this.cart.filter((c) => c.product.id !== id);
        this.persistCart();
        await this.loadInitialData();
      } catch (err: any) {
        this.error = err.message || 'Failed to delete product';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Ingredient actions
    async addIngredient(data: Partial<Ingredient>) {
      this.isLoading = true;
      try {
        const created = await posApi.createIngredient(data);
        await this.loadInitialData();
        return created;
      } catch (err: any) {
        this.error = err.message || 'Failed to add ingredient';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async editIngredient(id: string, data: Partial<Ingredient>) {
      this.isLoading = true;
      try {
        const updated = await posApi.updateIngredient(id, data);
        await this.loadInitialData();
        return updated;
      } catch (err: any) {
        this.error = err.message || 'Failed to update ingredient';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async restockIngredient(id: string, quantity: number, notes?: string) {
      this.isLoading = true;
      try {
        const updated = await posApi.restockIngredient(id, quantity, notes);
        await this.loadInitialData();
        return updated;
      } catch (err: any) {
        this.error = err.message || 'Failed to restock ingredient';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async removeIngredient(id: string) {
      this.isLoading = true;
      try {
        await posApi.deleteIngredient(id);
        await this.loadInitialData();
      } catch (err: any) {
        this.error = err.message || 'Failed to delete ingredient';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async seedFromRecipes() {
      this.isLoading = true;
      try {
        const res = await posApi.seedProducts();
        this.cart = [];
        await this.loadInitialData();
        return res;
      } catch (err: any) {
        this.error = err.message || 'Failed to seed products';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    setCategory(category: string) {
      this.selectedCategory = category;
      try {
        localStorage.setItem('pos_selected_category', category);
      } catch (e) {}
      this.fetchProducts();
    },

    setSearch(query: string) {
      this.searchQuery = query;
      this.fetchProducts();
    },

    setIngredientCategory(category: string) {
      this.selectedIngredientCategory = category;
      try {
        localStorage.setItem('pos_selected_ingredient_category', category);
      } catch (e) {}
      this.fetchIngredients();
    },

    setIngredientSearch(query: string) {
      this.ingredientSearchQuery = query;
      this.fetchIngredients();
    },

    // Promotion actions
    setPromotion(promoId: string | null) {
      this.selectedPromotionId = promoId;
      try {
        if (promoId) {
          localStorage.setItem(SELECTED_PROMO_STORAGE_KEY, promoId);
        } else {
          localStorage.removeItem(SELECTED_PROMO_STORAGE_KEY);
        }
      } catch (e) {}
    },

    savePromotions(promotions: Promotion[]) {
      this.promotions = promotions;
      try {
        localStorage.setItem(PROMOTIONS_STORAGE_KEY, JSON.stringify(promotions));
      } catch (e) {}
    },

    togglePromotionActive(promoId: string) {
      const p = this.promotions.find((x) => x.id === promoId);
      if (p) {
        p.isActive = !p.isActive;
        if (!p.isActive && this.selectedPromotionId === promoId) {
          this.setPromotion(null);
        }
        this.savePromotions(this.promotions);
      }
    },

    updatePromotionSchedule(promoId: string, startDate?: string, endDate?: string) {
      const p = this.promotions.find((x) => x.id === promoId);
      if (p) {
        p.startDate = startDate || undefined;
        p.endDate = endDate || undefined;
        if (!isPromotionCurrentlyValid(p) && this.selectedPromotionId === promoId) {
          this.setPromotion(null);
        }
        this.savePromotions(this.promotions);
      }
    },

    addPromotion(promo: Promotion) {
      this.promotions.unshift(promo);
      this.savePromotions(this.promotions);
    },

    updatePromotion(promo: Promotion) {
      const idx = this.promotions.findIndex((p) => p.id === promo.id);
      if (idx !== -1) {
        this.promotions[idx] = { ...promo };
        if (!isPromotionCurrentlyValid(this.promotions[idx]) && this.selectedPromotionId === promo.id) {
          this.setPromotion(null);
        }
        this.savePromotions(this.promotions);
      }
    },

    deletePromotion(promoId: string) {
      this.promotions = this.promotions.filter((p) => p.id !== promoId);
      if (this.selectedPromotionId === promoId) {
        this.setPromotion(null);
      }
      this.savePromotions(this.promotions);
    },

    resetPromotions() {
      this.promotions = JSON.parse(JSON.stringify(DEFAULT_PROMOTIONS));
      this.savePromotions(this.promotions);
    },

    persistCart() {
      if (typeof localStorage === 'undefined') return;
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
        localStorage.setItem(DISCOUNT_STORAGE_KEY, this.discountPercentage.toString());
      } catch (e) {
        console.error('Failed to cache cart to localStorage', e);
      }
    },

    syncCartWithProducts() {
      if (!this.cart.length || !this.products.length) return;
      const updatedCart: CartItem[] = [];
      for (const item of this.cart) {
        const latestProduct = this.products.find((p) => p.id === item.product.id);
        if (latestProduct) {
          if (latestProduct.stock > 0) {
            const unitPrice = calculateItemUnitPrice(latestProduct, item.options);
            updatedCart.push({
              ...item,
              product: latestProduct,
              unitPrice,
              quantity: Math.min(item.quantity, latestProduct.stock),
            });
          }
        } else {
          updatedCart.push(item);
        }
      }
      this.cart = updatedCart;
      this.persistCart();
    },

    setDiscount(percentage: number) {
      this.discountPercentage = percentage;
      this.persistCart();
    },

    addToCart(
      product: Product,
      options?: DrinkCustomization,
      quantity: number = 1,
      isPromoFree: boolean = false,
      promoBadge?: string,
      pairedWithItemId?: string
    ) {
      const cartItemId = generateCartItemId(product, options, isPromoFree);
      const originalPrice = calculateItemUnitPrice(product, options);
      const unitPrice = isPromoFree ? 0 : originalPrice;
      const existing = this.cart.find((item) => item.id === cartItemId);

      if (existing) {
        if (existing.quantity + quantity <= product.stock) {
          existing.quantity += quantity;
        } else {
          existing.quantity = product.stock;
        }
      } else {
        if (product.stock > 0) {
          this.cart.push({
            id: cartItemId,
            product,
            quantity: Math.min(quantity, product.stock),
            options,
            unitPrice,
            originalPrice,
            isPromoFree,
            promoBadge,
            pairedWithItemId,
          });
        }
      }
      this.persistCart();
      return cartItemId;
    },

    reconcilePromoCart() {
      const promo = this.activePromotion;
      if (!promo || (promo.type !== 'BOGO_ALL' && promo.type !== 'BOGO_CUSTOM' && promo.type !== 'BUY_2_GET_1')) {
        // If no BOGO promotion is active, remove any orphaned $0 free promo items
        if (!promo) {
          const hasOrphaned = this.cart.some((i) => i.isPromoFree);
          if (hasOrphaned) {
            this.cart = this.cart.filter((i) => !i.isPromoFree);
            this.persistCart();
          }
        }
        return;
      }

      const buyReq = promo.buyQty || (promo.type === 'BUY_2_GET_1' ? 2 : 1);
      const getReq = promo.getQty || 1;

      // Count paid eligible items
      let paidEligibleCount = 0;
      for (const item of this.cart) {
        if (!item.isPromoFree && isProductEligibleForPromotion(item.product, promo)) {
          paidEligibleCount += item.quantity;
        }
      }

      const allowedFreeCount = Math.floor(paidEligibleCount / buyReq) * getReq;

      // Current free items in cart
      const currentFreeCount = this.cart
        .filter((item) => item.isPromoFree)
        .reduce((sum, item) => sum + item.quantity, 0);

      // If condition no longer matches (e.g. user reduced quantity from 2 to 1 in Buy 2 Get 1)
      if (currentFreeCount > allowedFreeCount) {
        let toRemove = currentFreeCount - allowedFreeCount;
        for (let idx = this.cart.length - 1; idx >= 0 && toRemove > 0; idx--) {
          const item = this.cart[idx];
          if (item.isPromoFree) {
            if (item.quantity <= toRemove) {
              toRemove -= item.quantity;
              this.cart.splice(idx, 1);
            } else {
              item.quantity -= toRemove;
              toRemove = 0;
            }
          }
        }
        this.persistCart();
      }
    },

    addToCartAutoPromo(
      product: Product,
      options?: DrinkCustomization,
      quantity: number = 1
    ) {
      const promo = this.activePromotion;
      const isEligible = promo ? isProductEligibleForPromotion(product, promo) : false;

      // Condition 1: BOGO (Buy 1 Get 1 or Buy 1 Get X)
      if (promo && isEligible && (promo.type === 'BOGO_ALL' || promo.type === 'BOGO_CUSTOM') && (promo.buyQty || 1) === 1) {
        const freeQty = promo.getQty || 1;
        const paidItemId = generateCartItemId(product, options, false);
        this.addToCart(product, options, quantity, false);
        
        // Auto-add matching Free drink ($0.00)
        this.addToCart(
          product,
          options ? { ...options } : undefined,
          quantity * freeQty,
          true,
          promo.badge || '🎁 1 Get 1 Free',
          paidItemId
        );
        this.reconcilePromoCart();
        return;
      }

      // Condition 2: Buy 2 Get 1 (or Buy X Get Y)
      if (promo && isEligible && promo.type === 'BUY_2_GET_1') {
        this.addToCart(product, options, quantity, false);
        
        // Check if condition now qualifies for auto-adding free drink
        const buyReq = promo.buyQty || 2;
        const getReq = promo.getQty || 1;
        const paidEligibleCount = this.cart
          .filter((i) => !i.isPromoFree && isProductEligibleForPromotion(i.product, promo))
          .reduce((sum, i) => sum + i.quantity, 0);
        
        const currentFreeCount = this.cart
          .filter((i) => i.isPromoFree)
          .reduce((sum, i) => sum + i.quantity, 0);
        
        const targetFree = Math.floor(paidEligibleCount / buyReq) * getReq;
        if (targetFree > currentFreeCount) {
          const needed = targetFree - currentFreeCount;
          this.addToCart(
            product,
            options ? { ...options } : undefined,
            needed,
            true,
            promo.badge || '🎉 Buy 2 Get 1',
            undefined
          );
        }
        this.reconcilePromoCart();
        return;
      }

      // Condition 3: Ineligible / Normal Item -> Regular Paid (NOT FREE)
      this.addToCart(product, options, quantity, false);
      this.reconcilePromoCart();
    },

    addBogoCombo(
      paidProduct: Product,
      paidOptions?: DrinkCustomization,
      freeProduct?: Product,
      freeOptions?: DrinkCustomization,
      promoBadge: string = '🎁 1 Get 1 Free'
    ) {
      // 1. Add Paid Drink
      const paidItemId = generateCartItemId(paidProduct, paidOptions, false);
      this.addToCart(paidProduct, paidOptions, 1, false, undefined, undefined);

      // 2. Add Paired Free Drink
      const freeProd = freeProduct || paidProduct;
      const freeOpt = freeOptions || paidOptions;
      this.addToCart(freeProd, freeOpt, 1, true, promoBadge, paidItemId);
      this.reconcilePromoCart();
    },

    claimFreePromoItem(
      forPaidItemId: string,
      freeProduct: Product,
      freeOptions?: DrinkCustomization,
      promoBadge: string = '🎁 1 Get 1 Free'
    ) {
      this.addToCart(freeProduct, freeOptions, 1, true, promoBadge, forPaidItemId);
      this.reconcilePromoCart();
    },

    removeFromCart(cartItemId: string) {
      // Also remove any linked free item if paid item is removed
      this.cart = this.cart.filter(
        (item) => item.id !== cartItemId && item.product.id !== cartItemId && item.pairedWithItemId !== cartItemId
      );
      this.persistCart();
      this.reconcilePromoCart();
    },

    updateQuantity(cartItemId: string, quantity: number) {
      const existing = this.cart.find((item) => item.id === cartItemId || item.product.id === cartItemId);
      if (existing) {
        if (quantity <= 0) {
          this.removeFromCart(existing.id);
        } else {
          existing.quantity = Math.min(quantity, existing.product.stock);
          this.persistCart();
          this.reconcilePromoCart();
        }
      }
    },

    clearCart() {
      this.cart = [];
      this.discountPercentage = 0;
      this.persistCart();
    },

    async checkout(paymentMethod: 'CASH' | 'CARD' | 'QR_CODE', amountTendered?: number) {
      if (this.cart.length === 0) return null;
      if (this.isSubmitting) {
        console.warn('Checkout is already in progress. Ignoring duplicate submission trigger.');
        return null;
      }

      this.isSubmitting = true;
      this.error = null;

      const promo = this.activePromotion;
      const promoInfo = promo ? `[PROMO: ${promo.name.en} (-$${this.promoDiscountAmount.toFixed(2)})]` : undefined;
      const idempotencyKey = `TX-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const payload: CreateOrderPayload = {
        items: this.cart.map((i) => {
          let note = i.options?.notes || '';
          if (i.isPromoFree) {
            note = note ? `${note} [🎁 FREE PROMO CUP]` : '[🎁 FREE PROMO CUP]';
          } else if (promoInfo) {
            note = note ? `${note} | ${promoInfo}` : promoInfo;
          }

          return {
            productId: i.product.id,
            productName: i.isPromoFree ? `${i.product.name} (🎁 Free Promo)` : i.product.name,
            quantity: i.quantity,
            price: i.unitPrice !== undefined ? i.unitPrice : i.product.price,
            options: i.options,
            notes: note || undefined,
          };
        }),
        subtotal: this.grossSubtotal,
        tax: this.taxAmount,
        discount: this.discountAmount,
        total: this.total,
        paymentMethod,
        amountTendered: amountTendered || this.total,
        change: amountTendered && amountTendered > this.total ? parseFloat((amountTendered - this.total).toFixed(2)) : 0,
        idempotencyKey,
      };

      try {
        const order = await posApi.createOrder(payload);
        this.lastCompletedOrder = {
          ...order,
          promotionName: promo ? promo.name.en : null,
          promoDiscount: this.promoDiscountAmount,
        };
        this.clearCart();
        await this.loadInitialData();
        return order;
      } catch (err: any) {
        const message = getApiErrorMessage(err);
        this.error = message;
        throw new Error(message);
      } finally {
        this.isSubmitting = false;
      }
    },

    setVatSettings(enabled: boolean, percentage: number) {
      this.vatEnabled = enabled;
      const parsedPct = Math.max(0, Math.min(100, Number(percentage) || 0));
      this.vatPercentage = parsedPct;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pos_vat_enabled', enabled ? 'true' : 'false');
        localStorage.setItem('pos_vat_percentage', parsedPct.toString());
      }
    },
  },
});
