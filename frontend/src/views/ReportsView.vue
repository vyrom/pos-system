<template>
  <div class="reports-container">
    <!-- Header Section -->
    <header class="reports-header">
      <div class="header-left">
        <h1 class="page-title">
          <BarChart3 :size="28" class="header-icon" />
          {{ t('rep.title') }}
        </h1>
        <p class="page-subtitle">{{ t('rep.subtitle') }}</p>
      </div>

      <div class="header-actions">
        <button
          class="btn-action refresh-btn"
          @click="fetchActiveReport"
          :disabled="loading"
          type="button"
        >
          <RotateCw :size="16" :class="{ 'spin-anim': loading }" />
          <span>{{ t('dash.refresh') }}</span>
        </button>
      </div>
    </header>

    <!-- Global Date Range Filter Bar -->
    <div class="filter-card">
      <div class="filter-top">
        <div class="filter-label">
          <Calendar :size="18" class="icon-muted" />
          <span>{{ t('rep.dateRange') }}</span>
        </div>

        <!-- Date Range Presets -->
        <div class="preset-chips">
          <button
            v-for="preset in datePresets"
            :key="preset.key"
            class="preset-chip"
            :class="{ active: selectedPreset === preset.key }"
            @click="selectPreset(preset.key)"
            type="button"
          >
            {{ t(preset.labelKey) }}
          </button>
        </div>
      </div>

      <!-- Custom Date Inputs -->
      <div class="custom-date-row" v-if="selectedPreset === 'custom' || activeTab !== 'stock'">
        <div class="input-group">
          <label>{{ t('rep.startDate') }}</label>
          <input
            type="date"
            v-model="startDateInput"
            class="date-input"
            @change="selectedPreset = 'custom'"
          />
        </div>
        <div class="input-group">
          <label>{{ t('rep.endDate') }}</label>
          <input
            type="date"
            v-model="endDateInput"
            class="date-input"
            @change="selectedPreset = 'custom'"
          />
        </div>
        <button class="btn-primary apply-btn" @click="applyDateFilter" :disabled="loading">
          <Filter :size="16" />
          <span>{{ t('rep.applyFilter') }}</span>
        </button>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="reports-tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'stock' }"
        @click="switchTab('stock')"
        type="button"
      >
        <Boxes :size="18" />
        <span>{{ t('rep.tabStock') }}</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'income' }"
        @click="switchTab('income')"
        type="button"
      >
        <DollarSign :size="18" />
        <span>{{ t('rep.tabIncome') }}</span>
      </button>

      <button
        class="tab-btn"
        :class="{ active: activeTab === 'best-selling' }"
        @click="switchTab('best-selling')"
        type="button"
      >
        <TrendingUp :size="18" />
        <span>{{ t('rep.tabBestSelling') }}</span>
      </button>
    </div>

    <!-- TAB 1: STOCK INVENTORY REPORT -->
    <div v-if="activeTab === 'stock'" class="tab-content">
      <!-- KPI Summary Cards -->
      <div class="kpi-grid" v-if="stockData">
        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-espresso">
            <Boxes :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('ing.itemsCount') }}</span>
            <div class="kpi-value">{{ stockData.summary.totalItems }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-gold">
            <DollarSign :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('ing.totalVal') }}</span>
            <div class="kpi-value text-accent">${{ stockData.summary.totalValuation.toFixed(2) }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-sage">
            <CheckCircle2 :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('ing.stockHealthy') }}</span>
            <div class="kpi-value text-sage">{{ stockData.summary.healthyStockCount }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-warning">
            <AlertTriangle :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('ing.stockCritical') }}</span>
            <div class="kpi-value text-warning">
              {{ stockData.summary.warningStockCount + stockData.summary.lowStockCount }}
            </div>
          </div>
        </div>
      </div>

      <!-- Report Content Card -->
      <div class="report-card">
        <div class="report-card-header">
          <div class="report-card-title">
            <h2>{{ t('rep.tabStock') }}</h2>
            <span class="badge badge-coffee" v-if="stockData">
              {{ stockData.summary.totalItems }} items
            </span>
          </div>

          <div class="report-card-actions">
            <!-- Search Filter -->
            <div class="search-box">
              <Search :size="16" class="search-icon" />
              <input
                type="text"
                v-model="stockSearch"
                placeholder="Search ingredient..."
                class="search-input"
              />
            </div>
            <!-- CSV Export Button -->
            <button class="btn-secondary export-btn" @click="exportStockCsv" type="button">
              <Download :size="16" />
              <span>{{ t('rep.exportCsv') }}</span>
            </button>
          </div>
        </div>

        <!-- Stock Table -->
        <div class="table-responsive" v-if="filteredStockItems.length > 0">
          <table class="report-table">
            <thead>
              <tr>
                <th>{{ t('ing.ingredient') }}</th>
                <th>{{ t('ing.category') }}</th>
                <th class="text-right">{{ t('ing.currentStock') }}</th>
                <th class="text-right">{{ t('ing.minAlertThreshold') }}</th>
                <th class="text-right">{{ t('rep.unitCost') }}</th>
                <th class="text-right">{{ t('ing.totalVal') }}</th>
                <th class="text-center">{{ t('ing.stockStatus') }}</th>
                <th class="text-center">Recipe Uses</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredStockItems" :key="item.id">
                <td class="font-medium">
                  <div class="item-name-cell">
                    <span class="item-name">{{ item.name }}</span>
                    <span v-if="item.nameKh" class="item-name-kh">{{ item.nameKh }}</span>
                  </div>
                </td>
                <td>
                  <span class="category-chip">{{ item.category }}</span>
                </td>
                <td class="text-right font-semibold">
                  {{ item.stock.toLocaleString() }} <span class="uom-text">{{ item.uom }}</span>
                </td>
                <td class="text-right text-muted">
                  {{ item.minStock.toLocaleString() }} {{ item.uom }}
                </td>
                <td class="text-right">${{ item.costPerUnit.toFixed(3) }}</td>
                <td class="text-right font-bold text-accent">
                  ${{ item.stockValuation.toFixed(2) }}
                </td>
                <td class="text-center">
                  <span class="status-badge" :class="item.status.toLowerCase()">
                    <span class="dot"></span>
                    {{
                      item.status === 'CRITICAL'
                        ? t('ing.stockCritical')
                        : item.status === 'WARNING'
                        ? t('ing.stockWarning')
                        : t('ing.stockHealthy')
                    }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="recipe-usage-tag">
                    <Coffee :size="13" />
                    {{ item.recipeUsageCount }} recipes
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <Boxes :size="48" class="empty-icon" />
          <p>No ingredients found matching your search.</p>
        </div>
      </div>
    </div>

    <!-- TAB 2: INCOME & REVENUE REPORT -->
    <div v-if="activeTab === 'income'" class="tab-content">
      <!-- KPI Summary Cards -->
      <div class="kpi-grid" v-if="incomeData">
        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-espresso">
            <DollarSign :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('rep.revenue') }}</span>
            <div class="kpi-value text-accent">${{ incomeData.summary.totalRevenue.toFixed(2) }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-sage">
            <TrendingUp :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('rep.grossProfit') }}</span>
            <div class="kpi-value text-sage">${{ incomeData.summary.grossProfit.toFixed(2) }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-warning">
            <ShoppingBag :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('rep.costOfGoods') }}</span>
            <div class="kpi-value text-warning">${{ incomeData.summary.totalCost.toFixed(2) }}</div>
          </div>
        </div>

        <div class="kpi-card" v-if="incomeData.summary.totalExpenses !== undefined">
          <div class="kpi-icon-wrap bg-warning">
            <Receipt :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('exp.opex') }}</span>
            <div class="kpi-value text-warning">${{ incomeData.summary.totalExpenses.toFixed(2) }}</div>
          </div>
        </div>

        <div class="kpi-card" v-if="incomeData.summary.netProfitAfterExpenses !== undefined">
          <div class="kpi-icon-wrap bg-sage">
            <Wallet :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('exp.netProfitAfterOpEx') }}</span>
            <div class="kpi-value text-sage">${{ incomeData.summary.netProfitAfterExpenses.toFixed(2) }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-gold">
            <Percent :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('rep.profitMargin') }}</span>
            <div class="kpi-value">{{ incomeData.summary.profitMargin.toFixed(1) }}%</div>
          </div>
        </div>
      </div>

      <!-- Payment Method Breakdown Section -->
      <div class="payment-methods-grid" v-if="incomeData">
        <div class="payment-card">
          <div class="payment-card-header">
            <div class="pay-icon bg-green-light"><Wallet :size="20" /></div>
            <div>
              <div class="pay-title">{{ t('dash.shiftCash') }}</div>
              <div class="pay-amount">${{ getPaymentDetails('CASH').amount.toFixed(2) }}</div>
            </div>
          </div>
          <div class="pay-bar">
            <div
              class="pay-fill bg-green"
              :style="{ width: getPaymentDetails('CASH').percentage + '%' }"
            ></div>
          </div>
        </div>

        <div class="payment-card">
          <div class="payment-card-header">
            <div class="pay-icon bg-blue-light"><QrCode :size="20" /></div>
            <div>
              <div class="pay-title">{{ t('dash.shiftQr') }}</div>
              <div class="pay-amount">${{ getPaymentDetails('QR_CODE').amount.toFixed(2) }}</div>
            </div>
          </div>
          <div class="pay-bar">
            <div
              class="pay-fill bg-blue"
              :style="{ width: getPaymentDetails('QR_CODE').percentage + '%' }"
            ></div>
          </div>
        </div>

        <div class="payment-card">
          <div class="payment-card-header">
            <div class="pay-icon bg-purple-light"><CreditCard :size="20" /></div>
            <div>
              <div class="pay-title">{{ t('dash.shiftCard') }}</div>
              <div class="pay-amount">${{ getPaymentDetails('CARD').amount.toFixed(2) }}</div>
            </div>
          </div>
          <div class="pay-bar">
            <div
              class="pay-fill bg-purple"
              :style="{ width: getPaymentDetails('CARD').percentage + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Daily Breakdown Table Card -->
      <div class="report-card">
        <div class="report-card-header">
          <div class="report-card-title">
            <h2>Daily Revenue & Profit Analysis</h2>
            <span class="badge badge-coffee" v-if="incomeData">
              {{ incomeData.summary.totalOrders }} total orders
            </span>
          </div>

          <div class="report-card-actions">
            <button class="btn-secondary export-btn" @click="exportIncomeCsv" type="button">
              <Download :size="16" />
              <span>{{ t('rep.exportCsv') }}</span>
            </button>
          </div>
        </div>

        <div class="table-responsive" v-if="incomeData && incomeData.dailyBreakdown.length > 0">
          <table class="report-table">
            <thead>
              <tr>
                <th>Date</th>
                <th class="text-right">Orders Count</th>
                <th class="text-right">{{ t('rep.revenue') }}</th>
                <th class="text-right">{{ t('rep.costOfGoods') }}</th>
                <th class="text-right">{{ t('rep.grossProfit') }}</th>
                <th class="text-right">{{ t('rep.margin') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in incomeData.dailyBreakdown" :key="day.date">
                <td class="font-semibold">{{ day.date }}</td>
                <td class="text-right">{{ day.ordersCount }}</td>
                <td class="text-right font-bold text-accent">${{ day.revenue.toFixed(2) }}</td>
                <td class="text-right text-muted">${{ day.cost.toFixed(2) }}</td>
                <td class="text-right font-bold text-sage">${{ day.profit.toFixed(2) }}</td>
                <td class="text-right">
                  <span
                    class="margin-chip"
                    :class="(day.revenue > 0 ? (day.profit / day.revenue * 100) : 0) >= 50 ? 'high' : 'medium'"
                  >
                    {{ (day.revenue > 0 ? (day.profit / day.revenue * 100) : 0).toFixed(1) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <DollarSign :size="48" class="empty-icon" />
          <p>No revenue recorded for the selected date range.</p>
        </div>
      </div>
    </div>

    <!-- TAB 3: BEST SELLING ITEMS REPORT -->
    <div v-if="activeTab === 'best-selling'" class="tab-content">
      <!-- KPI Summary Cards -->
      <div class="kpi-grid" v-if="bestSellingData">
        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-gold">
            <Award :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('rep.topItem') }}</span>
            <div class="kpi-value text-accent font-serif truncate">
              {{ bestSellingData.summary.topSellingProduct }}
            </div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-espresso">
            <Coffee :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('rep.unitsSold') }}</span>
            <div class="kpi-value">{{ bestSellingData.summary.totalUnitsSold.toLocaleString() }} cups</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-sage">
            <DollarSign :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('rep.revenue') }}</span>
            <div class="kpi-value text-sage">${{ bestSellingData.summary.totalRevenue.toFixed(2) }}</div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-warning">
            <TrendingUp :size="22" />
          </div>
          <div class="kpi-info">
            <span class="kpi-label">{{ t('rep.profit') }}</span>
            <div class="kpi-value text-accent">${{ bestSellingData.summary.totalProfit.toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <!-- Best Selling Table Card -->
      <div class="report-card">
        <div class="report-card-header">
          <div class="report-card-title">
            <h2>{{ t('rep.tabBestSelling') }}</h2>
            <span class="badge badge-coffee" v-if="bestSellingData">
              Top {{ bestSellingData.items.length }} Items
            </span>
          </div>

          <div class="report-card-actions">
            <button class="btn-secondary export-btn" @click="exportBestSellingCsv" type="button">
              <Download :size="16" />
              <span>{{ t('rep.exportCsv') }}</span>
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive" v-if="bestSellingData && bestSellingData.items.length > 0">
          <table class="report-table">
            <thead>
              <tr>
                <th class="text-center">{{ t('rep.rank') }}</th>
                <th>{{ t('rep.item') }}</th>
                <th class="text-right">{{ t('rep.qtySold') }}</th>
                <th class="text-right">{{ t('rep.unitPrice') }}</th>
                <th class="text-right">{{ t('rep.unitCost') }}</th>
                <th class="text-right">{{ t('rep.revenue') }}</th>
                <th class="text-right">{{ t('rep.profit') }}</th>
                <th class="text-center">{{ t('rep.margin') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in bestSellingData.items" :key="item.productId">
                <td class="text-center">
                  <div
                    class="rank-badge"
                    :class="{
                      'rank-1': item.rank === 1,
                      'rank-2': item.rank === 2,
                      'rank-3': item.rank === 3
                    }"
                  >
                    #{{ item.rank }}
                  </div>
                </td>
                <td>
                  <div class="product-cell">
                    <div class="product-avatar">
                      <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.productName" />
                      <span v-else-if="item.icon" class="icon-emoji">{{ item.icon }}</span>
                      <Coffee v-else :size="20" class="avatar-fallback" />
                    </div>
                    <div class="product-meta">
                      <span class="product-title">{{ item.productName }}</span>
                      <span class="product-title-kh">{{ item.category }}</span>
                    </div>
                  </div>
                </td>
                <td class="text-right font-bold text-lg">
                  {{ item.quantitySold }} <span class="uom-text">cups</span>
                </td>
                <td class="text-right">${{ item.unitPrice.toFixed(2) }}</td>
                <td class="text-right text-muted">${{ item.unitCost.toFixed(2) }}</td>
                <td class="text-right font-bold text-accent">${{ item.totalRevenue.toFixed(2) }}</td>
                <td class="text-right font-bold text-sage">${{ item.totalProfit.toFixed(2) }}</td>
                <td class="text-center">
                  <div class="margin-progress-cell">
                    <div class="progress-bar-bg">
                      <div
                        class="progress-bar-fill"
                        :style="{ width: Math.min(100, Math.max(0, item.profitMargin)) + '%' }"
                      ></div>
                    </div>
                    <span class="margin-pct-label">{{ item.profitMargin.toFixed(1) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty-state">
          <TrendingUp :size="48" class="empty-icon" />
          <p>No items sold during the selected period.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  BarChart3,
  Boxes,
  DollarSign,
  TrendingUp,
  RotateCw,
  Calendar,
  Filter,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Percent,
  Wallet,
  QrCode,
  CreditCard,
  Award,
  Coffee,
  Receipt,
} from 'lucide-vue-next';

import {
  posApi,
  StockReportData,
  IncomeReportData,
  BestSellingReportData,
} from '../services/api';
import { useI18n } from '../i18n';

const { t } = useI18n();

// Tabs State
type ReportTab = 'stock' | 'income' | 'best-selling';
const activeTab = ref<ReportTab>('stock');

// Loading state
const loading = ref(false);

// Reports Data State
const stockData = ref<StockReportData | null>(null);
const incomeData = ref<IncomeReportData | null>(null);
const bestSellingData = ref<BestSellingReportData | null>(null);

// Search inside Stock Report
const stockSearch = ref('');

// Date Range presets
const selectedPreset = ref<string>('preset30Days');
const startDateInput = ref<string>('');
const endDateInput = ref<string>('');

const datePresets = [
  { key: 'presetToday', labelKey: 'rep.presetToday' },
  { key: 'presetYesterday', labelKey: 'rep.presetYesterday' },
  { key: 'preset7Days', labelKey: 'rep.preset7Days' },
  { key: 'preset30Days', labelKey: 'rep.preset30Days' },
  { key: 'presetAll', labelKey: 'rep.presetAll' },
  { key: 'custom', labelKey: 'rep.customRange' },
];

// Calculate date helper
const getDateRangeForPreset = (key: string) => {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  if (key === 'presetToday') {
    const dateStr = formatDate(today);
    return { start: dateStr, end: dateStr };
  } else if (key === 'presetYesterday') {
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    const dateStr = formatDate(yest);
    return { start: dateStr, end: dateStr };
  } else if (key === 'preset7Days') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { start: formatDate(start), end: formatDate(today) };
  } else if (key === 'preset30Days') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: formatDate(start), end: formatDate(today) };
  } else if (key === 'presetAll') {
    return { start: '2020-01-01', end: formatDate(today) };
  }
  return { start: startDateInput.value, end: endDateInput.value };
};

// Select Preset Chip
const selectPreset = (key: string) => {
  selectedPreset.value = key;
  if (key !== 'custom') {
    const { start, end } = getDateRangeForPreset(key);
    startDateInput.value = start;
    endDateInput.value = end;
    fetchActiveReport();
  }
};

// Switch Tab
const switchTab = (tab: ReportTab) => {
  activeTab.value = tab;
  fetchActiveReport();
};

// Filtered Stock Items
const filteredStockItems = computed(() => {
  if (!stockData.value) return [];
  if (!stockSearch.value.trim()) return stockData.value.items;
  const q = stockSearch.value.toLowerCase().trim();
  return stockData.value.items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.nameKh && item.nameKh.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
  );
});

// Helper for payment details in income report
const getPaymentDetails = (methodKey: string) => {
  if (!incomeData.value || !incomeData.value.paymentBreakdown) {
    return { amount: 0, count: 0, percentage: 0 };
  }
  const found = incomeData.value.paymentBreakdown.find((p) => p.method === methodKey);
  return found || { amount: 0, count: 0, percentage: 0 };
};

// Fetching active report
const fetchActiveReport = async () => {
  loading.value = true;
  try {
    if (activeTab.value === 'stock') {
      stockData.value = await posApi.getStockReport();
    } else if (activeTab.value === 'income') {
      incomeData.value = await posApi.getIncomeReport(
        startDateInput.value,
        endDateInput.value
      );
    } else if (activeTab.value === 'best-selling') {
      bestSellingData.value = await posApi.getBestSellingReport(
        startDateInput.value,
        endDateInput.value,
        50
      );
    }
  } catch (err) {
    console.error('Failed to load report data:', err);
  } finally {
    loading.value = false;
  }
};

const applyDateFilter = () => {
  fetchActiveReport();
};

// CSV EXPORT LOGIC
const downloadCsv = (filename: string, csvContent: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportStockCsv = () => {
  if (!stockData.value) return;
  const headers = [
    'Ingredient ID',
    'Name',
    'Khmer Name',
    'Category',
    'Current Stock',
    'UOM',
    'Min Threshold',
    'Unit Cost ($)',
    'Valuation ($)',
    'Status',
    'Recipes Used Count',
  ];
  const rows = stockData.value.items.map((item) => [
    item.id,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${(item.nameKh || '').replace(/"/g, '""')}"`,
    `"${item.category}"`,
    item.stock,
    item.uom,
    item.minStock,
    item.costPerUnit,
    item.stockValuation,
    item.status,
    item.recipeUsageCount,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsv(`Stock_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`, csv);
};

const exportIncomeCsv = () => {
  if (!incomeData.value) return;
  const headers = ['Date', 'Orders Count', 'Revenue ($)', 'COGS ($)', 'Gross Profit ($)', 'Profit Margin (%)'];
  const rows = incomeData.value.dailyBreakdown.map((d) => [
    d.date,
    d.ordersCount,
    d.revenue,
    d.cost,
    d.profit,
    d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(1) : 0,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsv(`Income_Financial_Report_${startDateInput.value}_to_${endDateInput.value}.csv`, csv);
};

const exportBestSellingCsv = () => {
  if (!bestSellingData.value) return;
  const headers = [
    'Rank',
    'Product ID',
    'Product Name',
    'Category',
    'Quantity Sold (Cups)',
    'Unit Price ($)',
    'Unit Cost ($)',
    'Total Revenue ($)',
    'Total Cost ($)',
    'Net Profit ($)',
    'Margin (%)',
  ];
  const rows = bestSellingData.value.items.map((item) => [
    item.rank,
    item.productId,
    `"${item.productName.replace(/"/g, '""')}"`,
    `"${item.category}"`,
    item.quantitySold,
    item.unitPrice,
    item.unitCost,
    item.totalRevenue,
    item.totalCost,
    item.totalProfit,
    item.profitMargin,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadCsv(`Best_Selling_Items_Report_${startDateInput.value}_to_${endDateInput.value}.csv`, csv);
};

onMounted(() => {
  // Initialize date default to This Month
  const { start, end } = getDateRangeForPreset('preset30Days');
  startDateInput.value = start;
  endDateInput.value = end;
  fetchActiveReport();
});
</script>

<style scoped>
.reports-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #591F0B;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: serif;
}

.header-icon {
  color: #794022;
}

.page-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover:not(:disabled) {
  background-color: #FAF7F2;
  border-color: #DEAC76;
}

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

/* Date Filter Card */
.filter-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #591F0B;
}

.icon-muted {
  color: #794022;
}

.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preset-chip {
  padding: 0.4rem 0.85rem;
  border-radius: 2rem;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
  color: #4b5563;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-chip:hover {
  border-color: #DEAC76;
  color: #794022;
}

.preset-chip.active {
  background-color: #794022;
  color: #ffffff;
  border-color: #794022;
}

.custom-date-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #e5e7eb;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.input-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
}

.date-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  outline: none;
}

.date-input:focus {
  border-color: #794022;
  box-shadow: 0 0 0 3px rgba(121, 64, 34, 0.1);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.25rem;
  background-color: #794022;
  color: #ffffff;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #591F0B;
}

/* Tabs */
.reports-tabs {
  display: flex;
  gap: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.25rem;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-weight: 700;
  font-size: 0.95rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #794022;
}

.tab-btn.active {
  color: #794022;
  border-bottom-color: #794022;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.kpi-card {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.kpi-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.bg-espresso {
  background-color: #794022;
}

.bg-gold {
  background-color: #DEAC76;
  color: #591F0B;
}

.bg-sage {
  background-color: #2D6A4F;
}

.bg-warning {
  background-color: #d97706;
}

.kpi-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.kpi-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.kpi-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.2;
  margin-top: 0.2rem;
}

.text-accent {
  color: #794022;
}

.text-sage {
  color: #2D6A4F;
}

.text-warning {
  color: #d97706;
}

/* Payment Methods Grid */
.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.payment-card {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.payment-card-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.pay-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-green-light {
  background-color: #dcfce7;
  color: #15803d;
}

.bg-blue-light {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.bg-purple-light {
  background-color: #f3e8ff;
  color: #7e22ce;
}

.pay-title {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 600;
}

.pay-amount {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
}

.pay-bar {
  height: 8px;
  background-color: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.pay-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.bg-green {
  background-color: #16a34a;
}

.bg-blue {
  background-color: #2563eb;
}

.bg-purple {
  background-color: #9333ea;
}

/* Report Card & Tables */
.report-card {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.report-card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background-color: #FAF7F2;
}

.report-card-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.report-card-title h2 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #591F0B;
}

.badge-coffee {
  background-color: #DEAC76;
  color: #591F0B;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 1rem;
}

.report-card-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
}

.search-input {
  padding: 0.45rem 0.75rem 0.45rem 2.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  outline: none;
  width: 220px;
}

.search-input:focus {
  border-color: #794022;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #FAF7F2;
  border-color: #794022;
  color: #794022;
}

/* Table Styling */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.report-table th {
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 700;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.report-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
}

.report-table tr:hover td {
  background-color: #FAF7F2;
}

.item-name-cell {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 700;
  color: #111827;
}

.item-name-kh {
  font-size: 0.8rem;
  color: #6b7280;
}

.category-chip {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #4b5563;
}

.uom-text {
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: normal;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge.healthy {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.healthy .dot {
  background-color: #166534;
}

.status-badge.warning {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.warning .dot {
  background-color: #92400e;
}

.status-badge.critical {
  background-color: #ffe4e6;
  color: #9f1239;
}

.status-badge.critical .dot {
  background-color: #9f1239;
}

.recipe-usage-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.55rem;
  background-color: #fef3c7;
  color: #78350f;
  border-radius: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.margin-chip {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
}

.margin-chip.high {
  background-color: #dcfce7;
  color: #15803d;
}

.margin-chip.medium {
  background-color: #fef3c7;
  color: #b45309;
}

/* Rank Badges */
.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.85rem;
  background-color: #f3f4f6;
  color: #4b5563;
}

.rank-badge.rank-1 {
  background-color: #fef08a;
  color: #854d0e;
  box-shadow: 0 0 0 2px #eab308;
}

.rank-badge.rank-2 {
  background-color: #e2e8f0;
  color: #334155;
  box-shadow: 0 0 0 2px #94a3b8;
}

.rank-badge.rank-3 {
  background-color: #ffedd5;
  color: #9a3412;
  box-shadow: 0 0 0 2px #f97316;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-avatar {
  width: 36px;
  height: 36px;
  border-radius: 0.4rem;
  background-color: #FAF7F2;
  border: 1px solid #DEAC76;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-emoji {
  font-size: 1.2rem;
}

.avatar-fallback {
  color: #794022;
}

.product-meta {
  display: flex;
  flex-direction: column;
}

.product-title {
  font-weight: 700;
  color: #111827;
}

.product-title-kh {
  font-size: 0.75rem;
  color: #6b7280;
}

.margin-progress-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100px;
  margin: 0 auto;
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #2D6A4F;
  border-radius: 3px;
}

.margin-pct-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #2D6A4F;
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  color: #d1d5db;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .reports-container {
    padding: 1rem;
  }

  .filter-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .custom-date-row {
    flex-direction: column;
    align-items: stretch;
  }

  .date-input {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .report-card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
