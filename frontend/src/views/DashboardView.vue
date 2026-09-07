<template>
  <div class="dashboard-page">
    <!-- Header with Title & Tab Switcher (For Admin) -->
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">
          {{ currentTab === 'seller' ? t('dash.sellerTitle') : t('dash.title') }}
        </h1>
        <p class="page-subtitle">
          {{ currentTab === 'seller' ? t('dash.sellerSubtitle') : t('dash.subtitle') }}
        </p>
      </div>

      <div class="header-actions">
        <!-- Admin Tab Switcher -->
        <div v-if="isAdmin" class="dashboard-tab-switcher">
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'admin' }"
            @click="currentTab = 'admin'"
            type="button"
          >
            <ShieldCheck :size="15" />
            <span>{{ t('dash.adminTab') }}</span>
          </button>
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'seller' }"
            @click="currentTab = 'seller'"
            type="button"
          >
            <ShoppingBag :size="15" />
            <span>{{ t('dash.sellerTab') }}</span>
          </button>
        </div>

        <!-- Print Shift Report (In Seller View) -->
        <button
          v-if="currentTab === 'seller'"
          class="btn btn-primary shift-print-btn"
          @click="showShiftModal = true"
          type="button"
        >
          <Printer :size="16" />
          <span>{{ t('dash.printReport') }}</span>
        </button>

        <!-- Refresh Button -->
        <button class="btn btn-secondary" @click="loadData" :disabled="loading" type="button">
          <RefreshCw :size="16" :class="{ spinner: loading }" />
          <span>{{ t('dash.refresh') }}</span>
        </button>
      </div>
    </div>

    <!-- ==================== 1. SELLER SHIFT DASHBOARD VIEW ==================== -->
    <div v-if="currentTab === 'seller'" class="seller-dashboard-content">
      <!-- Payment Method Breakdown Cards (Cash / Card / QR) -->
      <div class="payment-breakdown-grid">
        <div class="pay-stat-card cash-card">
          <div class="pay-stat-icon">
            <Banknote :size="26" />
          </div>
          <div class="pay-stat-info">
            <span class="pay-stat-label">{{ t('dash.shiftCash') }}</span>
            <h2 class="pay-stat-amount">${{ shiftCashSales.toFixed(2) }}</h2>
            <span class="pay-stat-sub">{{ shiftCashOrdersCount }} {{ t('dash.orders') }}</span>
          </div>
        </div>

        <div class="pay-stat-card card-card">
          <div class="pay-stat-icon">
            <CreditCard :size="26" />
          </div>
          <div class="pay-stat-info">
            <span class="pay-stat-label">{{ t('dash.shiftCard') }}</span>
            <h2 class="pay-stat-amount">${{ shiftCardSales.toFixed(2) }}</h2>
            <span class="pay-stat-sub">{{ shiftCardOrdersCount }} {{ t('dash.orders') }}</span>
          </div>
        </div>

        <div class="pay-stat-card qr-card">
          <div class="pay-stat-icon">
            <QrCode :size="26" />
          </div>
          <div class="pay-stat-info">
            <span class="pay-stat-label">{{ t('dash.shiftQr') }}</span>
            <h2 class="pay-stat-amount">${{ shiftQrSales.toFixed(2) }}</h2>
            <span class="pay-stat-sub">{{ shiftQrOrdersCount }} {{ t('dash.orders') }}</span>
          </div>
        </div>
      </div>

      <!-- Shift Summary Metrics (4 Cards) -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box bg-blue">
            <DollarSign :size="24" />
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('dash.shiftSales') }}</span>
            <h2 class="metric-value">${{ shiftTotalSales.toFixed(2) }}</h2>
            <span class="metric-hint text-success">{{ shiftOrdersCount }} {{ t('dash.orders') }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-purple">
            <Coffee :size="24" />
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('dash.cupsSold') }}</span>
            <h2 class="metric-value">{{ shiftCupsCount }}</h2>
            <span class="metric-hint">{{ t('pos.cups') }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-indigo">
            <Tag :size="24" />
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('dash.discountsGiven') }}</span>
            <h2 class="metric-value font-mono">-${{ shiftDiscountsGiven.toFixed(2) }}</h2>
            <span class="metric-hint">{{ t('pos.saved') }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-emerald">
            <Receipt :size="24" />
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('dash.avgTicket') }}</span>
            <h2 class="metric-value font-mono">${{ shiftAvgTicket.toFixed(2) }}</h2>
            <span class="metric-hint">{{ t('dash.shiftOrders') }}</span>
          </div>
        </div>
      </div>

      <!-- Shift Orders Log Table -->
      <div class="card table-card">
        <div class="card-header">
          <div class="table-header-left">
            <h3 class="card-title">{{ t('dash.shiftOrders') }}</h3>
            <span class="badge badge-success">{{ shiftOrdersCount }} {{ t('dash.orders') }}</span>
          </div>
          <button class="btn btn-secondary btn-sm" @click="showShiftModal = true" type="button">
            <Printer :size="14" />
            <span>{{ t('dash.printReport') }}</span>
          </button>
        </div>

        <div v-if="!metrics?.recentOrders || metrics.recentOrders.length === 0" class="no-data">
          <Receipt :size="40" />
          <p>{{ t('dash.noOrders') }}</p>
          <span>{{ t('dash.noOrdersSub') }}</span>
        </div>

        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ t('dash.orderId') }}</th>
                <th>{{ t('dash.time') }}</th>
                <th>{{ t('dash.items') }}</th>
                <th>{{ t('pos.discount') }}</th>
                <th>{{ t('dash.payment') }}</th>
                <th>{{ t('dash.total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in metrics.recentOrders" :key="order.id">
                <td class="font-mono font-bold">{{ order.id }}</td>
                <td>{{ formatTime(order.createdAt) }}</td>
                <td>
                  <div class="order-items-preview">
                    <span v-for="(item, i) in order.items" :key="i" class="item-pill">
                      {{ item.quantity }}x {{ item.productName }}
                    </span>
                  </div>
                </td>
                <td>
                  <span v-if="order.discount > 0" class="text-danger font-mono font-bold">
                    -${{ order.discount?.toFixed(2) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span
                    class="pay-method-badge"
                    :class="{
                      cash: order.paymentMethod === 'CASH',
                      card: order.paymentMethod === 'CARD',
                      qr: order.paymentMethod === 'QR_CODE',
                    }"
                  >
                    {{ order.paymentMethod }}
                  </span>
                </td>
                <td class="font-bold font-mono text-dark">${{ order.total?.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== 2. ADMIN EXECUTIVE DASHBOARD VIEW ==================== -->
    <div v-else class="admin-dashboard-content">
      <!-- Stat Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon-box bg-blue">
            <DollarSign :size="24" />
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('dash.revenue') }}</span>
            <h2 class="metric-value">${{ metrics?.totalSales?.toFixed(2) || '0.00' }}</h2>
            <span class="metric-hint text-success">{{ t('dash.todaySales') }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-purple">
            <ShoppingBag :size="24" />
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('dash.orders') }}</span>
            <h2 class="metric-value">{{ metrics?.totalOrders || 0 }}</h2>
            <span class="metric-hint">{{ t('dash.ordersSub') }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-indigo">
            <Boxes :size="24" />
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('dash.cost') }}</span>
            <h2 class="metric-value">${{ metrics?.inventoryCost?.toFixed(2) || '0.00' }}</h2>
            <span class="metric-hint">{{ t('dash.costSub') }}</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box bg-emerald">
            <TrendingUp :size="24" />
          </div>
          <div class="metric-details">
            <span class="metric-label">{{ t('dash.valuation') }}</span>
            <h2 class="metric-value text-success">${{ metrics?.inventoryValuation?.toFixed(2) || '0.00' }}</h2>
            <span class="metric-hint">{{ metrics?.totalProducts || 0 }} {{ t('prod.catalogItems') }}</span>
          </div>
        </div>
      </div>

      <!-- 2 Column Layout: Live Orders & System Architecture -->
      <div class="dashboard-columns">
        <!-- Live Orders Table -->
        <div class="card table-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dash.recent') }}</h3>
            <span class="badge badge-success">{{ t('dash.liveOrders') }}</span>
          </div>

          <div v-if="!metrics?.recentOrders || metrics.recentOrders.length === 0" class="no-data">
            <Receipt :size="40" />
            <p>{{ t('dash.noOrders') }}</p>
            <span>{{ t('dash.noOrdersSub') }}</span>
          </div>

          <div v-else class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('dash.orderId') }}</th>
                  <th>{{ t('dash.time') }}</th>
                  <th>{{ t('dash.items') }}</th>
                  <th>{{ t('dash.payment') }}</th>
                  <th>{{ t('dash.total') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in metrics.recentOrders" :key="order.id">
                  <td class="font-mono">{{ order.id }}</td>
                  <td>{{ formatTime(order.createdAt) }}</td>
                  <td>{{ order.items?.length || 0 }} {{ t('dash.items') }}</td>
                  <td>
                    <span class="badge badge-success">{{ order.paymentMethod }}</span>
                  </td>
                  <td class="font-bold">${{ order.total?.toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- System Architecture & Environment Details -->
        <div class="card system-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dash.systemArch') }}</h3>
            <span class="badge" :class="healthInfo?.status === 'ok' ? 'badge-success' : 'badge-danger'">
              {{ healthInfo?.status === 'ok' ? t('dash.healthy') : t('dash.disconnected') }}
            </span>
          </div>

          <div class="system-info-list">
            <div class="info-row">
              <span class="info-label">{{ t('dash.backendService') }}</span>
              <span class="info-value">NestJS 10 (Node.js 20)</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('dash.frontendClient') }}</span>
              <span class="info-value">Vue 3 + Vite + TypeScript</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('dash.activeCatalog') }}</span>
              <span class="info-value font-bold">{{ metrics?.totalProducts || 0 }} {{ t('nav.products') }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('dash.categories') }}</span>
              <span class="info-value">Hot Coffee, Ice Coffee, Tea, Frappe, Soda</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('dash.database') }}</span>
              <span class="info-value">PostgreSQL 16 (Docker)</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('dash.environment') }}</span>
              <span class="info-value font-mono">{{ healthInfo?.environment || 'development' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('dash.swaggerDocs') }}</span>
              <a href="http://localhost:3005/api/docs" target="_blank" class="link-btn">
                Open /api/docs ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 3. SHIFT RECONCILIATION & PRINT MODAL ==================== -->
    <div v-if="showShiftModal" class="modal-backdrop">
      <div class="receipt-modal shift-report-modal">
        <div class="modal-header">
          <img :src="logoIcon" alt="តស់កាហ្វេ TOS CAFE" class="receipt-logo" />
          <div class="receipt-shop-title">តស់កាហ្វេ • TOS CAFE</div>
          <h2 class="shift-report-heading">{{ t('dash.shiftReconciliation') }}</h2>
          <p class="shift-report-date">{{ currentDateStr }} • {{ currentTimeStr }}</p>
        </div>

        <div class="receipt-body">
          <div class="shift-report-summary">
            <!-- Payment Types Breakdown -->
            <div class="receipt-row">
              <span>{{ t('dash.shiftCash') }}:</span>
              <span class="font-mono font-bold">${{ shiftCashSales.toFixed(2) }} ({{ shiftCashOrdersCount }})</span>
            </div>
            <div class="receipt-row">
              <span>{{ t('dash.shiftCard') }}:</span>
              <span class="font-mono font-bold">${{ shiftCardSales.toFixed(2) }} ({{ shiftCardOrdersCount }})</span>
            </div>
            <div class="receipt-row">
              <span>{{ t('dash.shiftQr') }}:</span>
              <span class="font-mono font-bold">${{ shiftQrSales.toFixed(2) }} ({{ shiftQrOrdersCount }})</span>
            </div>

            <div class="receipt-divider"></div>

            <div class="receipt-row">
              <span>{{ t('dash.cupsSold') }}:</span>
              <span class="font-bold">{{ shiftCupsCount }} {{ t('pos.cups') }}</span>
            </div>
            <div v-if="shiftDiscountsGiven > 0" class="receipt-row">
              <span>{{ t('dash.discountsGiven') }}:</span>
              <span class="font-mono text-danger font-bold">-${{ shiftDiscountsGiven.toFixed(2) }}</span>
            </div>

            <div class="receipt-divider"></div>

            <div class="receipt-row total">
              <span>{{ t('dash.shiftSales') }}:</span>
              <span class="font-mono font-bold text-success">${{ shiftTotalSales.toFixed(2) }}</span>
            </div>

            <div class="receipt-row cash-drawer-expected">
              <span>{{ t('dash.expectedCash') }}:</span>
              <span class="font-mono font-bold text-primary">${{ shiftCashSales.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-actions modal-actions-grid">
          <button class="btn btn-secondary" @click="showShiftModal = false" type="button">
            {{ t('customizer.cancel') }}
          </button>
          <button class="btn btn-primary" @click="handlePrintShift" type="button">
            <Printer :size="16" />
            <span>{{ t('dash.printReceipts') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  DollarSign,
  ShoppingBag,
  Boxes,
  TrendingUp,
  RefreshCw,
  Receipt,
  Coffee,
  Tag,
  Banknote,
  CreditCard,
  QrCode,
  Printer,
  ShieldCheck,
} from 'lucide-vue-next';
import { posApi, DashboardMetrics } from '../services/api';
import { useI18n } from '../i18n';
import { useAuth } from '../composables/useAuth';
import logoIcon from '../assets/logo-icon.jpg';

const { locale, t, translateCategory } = useI18n();
const { isAdmin, isSeller } = useAuth();

const currentTab = ref<'admin' | 'seller'>(isSeller.value ? 'seller' : 'admin');
const metrics = ref<DashboardMetrics | null>(null);
const healthInfo = ref<any>(null);
const loading = ref(false);
const showShiftModal = ref(false);

// Keep currentTab in sync with role
watch(isAdmin, (admin) => {
  if (!admin) {
    currentTab.value = 'seller';
  }
});

// Load Dashboard metrics from API
const loadData = async () => {
  loading.value = true;
  try {
    const [metricsData, healthData] = await Promise.all([
      posApi.getDashboardMetrics(),
      posApi.getHealth().catch(() => null),
    ]);
    metrics.value = metricsData;
    healthInfo.value = healthData;
  } catch (err) {
    console.error('Failed to load dashboard data', err);
  } finally {
    loading.value = false;
  }
};

// ==================== SHIFT METRICS COMPUTATION ====================
const shiftCashSales = computed(() => {
  if (!metrics.value?.recentOrders) return 0;
  return metrics.value.recentOrders
    .filter((o) => o.paymentMethod === 'CASH')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
});

const shiftCashOrdersCount = computed(() => {
  if (!metrics.value?.recentOrders) return 0;
  return metrics.value.recentOrders.filter((o) => o.paymentMethod === 'CASH').length;
});

const shiftCardSales = computed(() => {
  if (!metrics.value?.recentOrders) return 0;
  return metrics.value.recentOrders
    .filter((o) => o.paymentMethod === 'CARD')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
});

const shiftCardOrdersCount = computed(() => {
  if (!metrics.value?.recentOrders) return 0;
  return metrics.value.recentOrders.filter((o) => o.paymentMethod === 'CARD').length;
});

const shiftQrSales = computed(() => {
  if (!metrics.value?.recentOrders) return 0;
  return metrics.value.recentOrders
    .filter((o) => o.paymentMethod === 'QR_CODE')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
});

const shiftQrOrdersCount = computed(() => {
  if (!metrics.value?.recentOrders) return 0;
  return metrics.value.recentOrders.filter((o) => o.paymentMethod === 'QR_CODE').length;
});

const shiftTotalSales = computed(() => {
  if (!metrics.value?.recentOrders) return 0;
  return metrics.value.recentOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
});

const shiftOrdersCount = computed(() => {
  return metrics.value?.recentOrders?.length || 0;
});

const shiftCupsCount = computed(() => {
  if (!metrics.value?.recentOrders) return 0;
  return metrics.value.recentOrders.reduce((totalCups, order) => {
    const orderCups = (order.items || []).reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
    return totalCups + orderCups;
  }, 0);
});

const shiftDiscountsGiven = computed(() => {
  if (!metrics.value?.recentOrders) return 0;
  return metrics.value.recentOrders.reduce((sum, o) => sum + (Number(o.discount) || 0), 0);
});

const shiftAvgTicket = computed(() => {
  if (shiftOrdersCount.value === 0) return 0;
  return shiftTotalSales.value / shiftOrdersCount.value;
});

const currentDateStr = computed(() => {
  return new Date().toLocaleDateString(locale.value === 'km' ? 'km-KH' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});

const currentTimeStr = computed(() => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

const formatTime = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const handlePrintShift = () => {
  window.print();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-900);
}

.page-subtitle {
  font-size: 0.875rem;
  color: var(--gray-500);
}

/* Admin Tab Switcher */
.dashboard-tab-switcher {
  display: flex;
  background: var(--gray-200);
  padding: 3px;
  border-radius: 20px;
  border: 1px solid var(--gray-300);
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 0.35rem 0.85rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.tab-btn:hover {
  color: var(--gray-900);
}

.tab-btn.active {
  background: var(--white);
  color: var(--primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.shift-print-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
  font-size: 0.85rem;
}

/* ==================== Payment Breakdown Cards ==================== */
.payment-breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
  margin-bottom: 0.5rem;
}

.pay-stat-card {
  background: var(--white);
  border-radius: var(--border-radius);
  border: 1px solid var(--gray-300);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.15rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pay-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.pay-stat-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cash-card .pay-stat-icon {
  background: #ecfdf5;
  color: #059669;
}

.card-card .pay-stat-icon {
  background: #eff6ff;
  color: #2563eb;
}

.qr-card .pay-stat-icon {
  background: #faf5ff;
  color: #7c3aed;
}

.pay-stat-info {
  display: flex;
  flex-direction: column;
}

.pay-stat-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.pay-stat-amount {
  font-size: 1.65rem;
  font-weight: 800;
  color: var(--gray-900);
  font-family: monospace;
  line-height: 1.2;
}

.pay-stat-sub {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-500);
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.metric-card {
  background: var(--white);
  border-radius: var(--border-radius);
  border: 1px solid var(--gray-300);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}

.metric-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-blue {
  background: #eff6ff;
  color: #3b82f6;
}

.bg-purple {
  background: #faf5ff;
  color: #a855f7;
}

.bg-indigo {
  background: #eef2ff;
  color: #4f46e5;
}

.bg-emerald {
  background: #ecfdf5;
  color: #10b981;
}

.metric-details {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.metric-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--gray-900);
  line-height: 1.2;
}

.metric-hint {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.text-success {
  color: var(--success);
}

.text-danger {
  color: #dc2626;
}

.text-dark {
  color: #0f172a;
}

.text-muted {
  color: var(--gray-400);
}

/* 2 Columns Layout */
.dashboard-columns {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-200);
}

.table-header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray-900);
}

.no-data {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--gray-400);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.no-data p {
  font-weight: 600;
  color: var(--gray-700);
}

.no-data span {
  font-size: 0.8rem;
}

/* Table */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.data-table th {
  background: var(--gray-100);
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--gray-600);
  border-bottom: 1px solid var(--gray-300);
}

.data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--gray-200);
  color: var(--gray-800);
}

.order-items-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.item-pill {
  background: #f1f5f9;
  color: #334155;
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.pay-method-badge {
  padding: 0.2rem 0.55rem;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 800;
  display: inline-block;
}

.pay-method-badge.cash {
  background: #dcfce7;
  color: #15803d;
}

.pay-method-badge.card {
  background: #dbeafe;
  color: #1d4ed8;
}

.pay-method-badge.qr {
  background: #f3e8ff;
  color: #7e22ce;
}

.font-mono {
  font-family: monospace;
}

.font-bold {
  font-weight: 700;
}

/* System Info List */
.system-info-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--gray-100);
}

.info-label {
  color: var(--gray-500);
  font-weight: 500;
}

.info-value {
  font-weight: 600;
  color: var(--gray-900);
}

.link-btn {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.link-btn:hover {
  text-decoration: underline;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Shift Report Modal */
.shift-report-modal {
  width: 440px !important;
}

.shift-report-heading {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-top: 0.25rem;
}

.shift-report-date {
  font-size: 0.8rem;
  color: var(--gray-500);
}

.shift-report-summary {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 0.88rem;
}

.cash-drawer-expected {
  background: #f0fdf4;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  margin-top: 0.35rem;
}

.modal-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

@media (max-width: 900px) {
  .dashboard-columns {
    grid-template-columns: 1fr;
  }
}
</style>
