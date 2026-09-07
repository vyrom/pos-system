import { createRouter, createWebHistory } from 'vue-router';
import PosView from '../views/PosView.vue';
import DashboardView from '../views/DashboardView.vue';
import ProductsView from '../views/ProductsView.vue';
import IngredientsView from '../views/IngredientsView.vue';
import PromotionsView from '../views/PromotionsView.vue';
import ReportsView from '../views/ReportsView.vue';
import ExpensesView from '../views/ExpensesView.vue';
import { useAuth } from '../composables/useAuth';

const routes = [
  {
    path: '/',
    name: 'pos',
    component: PosView,
    meta: { title: 'POS Terminal' },
  },
  {
    path: '/products',
    name: 'products',
    component: ProductsView,
    meta: { title: 'Drink Recipes & Menu', requiresAdmin: true },
  },
  {
    path: '/ingredients',
    name: 'ingredients',
    component: IngredientsView,
    meta: { title: 'Raw Ingredients Inventory', requiresAdmin: true },
  },
  {
    path: '/promotions',
    name: 'promotions',
    component: PromotionsView,
    meta: { title: 'Promotions Management', requiresAdmin: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard & Reports' },
  },
  {
    path: '/reports',
    name: 'reports',
    component: ReportsView,
    meta: { title: 'Reports & Analytics', requiresAdmin: true },
  },
  {
    path: '/expenses',
    name: 'expenses',
    component: ExpensesView,
    meta: { title: 'Shop Expenses & OpEx', requiresAdmin: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: () => {
      const { isAdmin } = useAuth();
      return isAdmin.value ? '/dashboard' : '/';
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const { isAdmin } = useAuth();
  if (isAdmin.value && to.path === '/') {
    // Admin does not have POS menu, redirect to admin dashboard
    next({ name: 'dashboard' });
  } else if (to.meta?.requiresAdmin && !isAdmin.value) {
    // Seller role cannot access admin management routes
    next({ name: 'pos' });
  } else {
    next();
  }
});

export default router;
