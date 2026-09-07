<template>
  <div class="expenses-container">
    <!-- Header Section -->
    <header class="expenses-header">
      <div class="header-left">
        <h1 class="page-title">
          <Receipt :size="28" class="header-icon" />
          {{ t('exp.title') }}
        </h1>
        <p class="page-subtitle">{{ t('exp.subtitle') }}</p>
      </div>

      <div class="header-actions">
        <button
          class="btn-action refresh-btn"
          @click="fetchExpenses"
          :disabled="loading"
          type="button"
        >
          <RotateCw :size="16" :class="{ 'spin-anim': loading }" />
          <span>{{ t('dash.refresh') }}</span>
        </button>

        <button class="btn-primary add-expense-btn" @click="openModal" type="button">
          <Plus :size="18" />
          <span>{{ t('exp.recordBtn') }}</span>
        </button>
      </div>
    </header>

    <!-- KPI Summary Cards Grid -->
    <div class="kpi-grid" v-if="summary">
      <div class="kpi-card">
        <div class="kpi-icon-wrap bg-espresso">
          <WalletCards :size="22" />
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('exp.totalOpEx') }}</span>
          <div class="kpi-value text-accent">${{ summary.totalExpenses.toFixed(2) }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-wrap bg-blue">
          <Zap :size="22" />
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('exp.utilities') }}</span>
          <div class="kpi-value text-blue">${{ summary.utilitiesTotal.toFixed(2) }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-wrap bg-gold">
          <Building2 :size="22" />
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('exp.rent') }}</span>
          <div class="kpi-value text-gold">${{ (summary.byCategory.RENT || 0).toFixed(2) }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-wrap bg-purple">
          <Users :size="22" />
        </div>
        <div class="kpi-info">
          <span class="kpi-label">{{ t('exp.salaries') }}</span>
          <div class="kpi-value text-purple">${{ (summary.byCategory.SALARY || 0).toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <!-- Filter Card -->
    <div class="filter-card">
      <div class="filter-top">
        <!-- Date Presets -->
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

        <!-- Category Dropdown Filter -->
        <div class="category-filter-box">
          <Filter :size="16" class="filter-icon" />
          <select v-model="selectedCategory" class="category-select" @change="fetchExpenses">
            <option value="ALL">{{ t('exp.catAll') }}</option>
            <option value="WATER">{{ t('exp.catWater') }}</option>
            <option value="ELECTRICITY">{{ t('exp.catElectricity') }}</option>
            <option value="RENT">{{ t('exp.catRent') }}</option>
            <option value="SALARY">{{ t('exp.catSalary') }}</option>
            <option value="MAINTENANCE">{{ t('exp.catMaintenance') }}</option>
            <option value="OTHER">{{ t('exp.catOther') }}</option>
          </select>
        </div>
      </div>

      <!-- Custom Date Row -->
      <div class="custom-date-row" v-if="selectedPreset === 'custom'">
        <div class="input-group">
          <label>{{ t('rep.startDate') }}</label>
          <input type="date" v-model="startDateInput" class="date-input" />
        </div>
        <div class="input-group">
          <label>{{ t('rep.endDate') }}</label>
          <input type="date" v-model="endDateInput" class="date-input" />
        </div>
        <button class="btn-secondary apply-btn" @click="fetchExpenses">
          {{ t('rep.applyFilter') }}
        </button>
      </div>
    </div>

    <!-- Expenses Content Table Card -->
    <div class="report-card">
      <div class="report-card-header">
        <div class="report-card-title">
          <h2>Expenses History</h2>
          <span class="badge badge-coffee">{{ expenses.length }} records</span>
        </div>

        <div class="report-card-actions">
          <div class="search-box">
            <Search :size="16" class="search-icon" />
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search expenses..."
              class="search-input"
              @input="fetchExpenses"
            />
          </div>

          <button class="btn-secondary export-btn" @click="exportCsv" type="button">
            <Download :size="16" />
            <span>{{ t('rep.exportCsv') }}</span>
          </button>
        </div>
      </div>

      <!-- Expenses Table -->
      <div class="table-responsive" v-if="expenses.length > 0">
        <table class="report-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Expense Title</th>
              <th class="text-right">Amount ($ USD)</th>
              <th class="text-center">Date Spent</th>
              <th class="text-center">Payment Method</th>
              <th>Notes / Invoice</th>
              <th class="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in expenses" :key="expense.id">
              <td>
                <span class="cat-badge" :class="expense.category.toLowerCase()">
                  <span class="cat-emoji">{{ getCategoryEmoji(expense.category) }}</span>
                  <span class="cat-text">{{ getCategoryLabel(expense.category) }}</span>
                </span>
              </td>
              <td class="font-semibold text-gray-900">
                {{ expense.title }}
              </td>
              <td class="text-right font-bold text-accent text-lg">
                ${{ expense.amount.toFixed(2) }}
              </td>
              <td class="text-center text-muted font-medium">
                {{ expense.date }}
              </td>
              <td class="text-center">
                <span class="pay-method-badge">
                  {{ expense.paymentMethod }}
                </span>
              </td>
              <td class="text-muted text-sm max-w-xs truncate">
                {{ expense.note || '-' }}
              </td>
              <td class="text-center">
                <button
                  class="btn-icon delete-btn"
                  @click="confirmDelete(expense)"
                  title="Delete Expense"
                  type="button"
                >
                  <Trash2 :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <Receipt :size="48" class="empty-icon" />
        <p>No expenses recorded for this filter criteria.</p>
        <button class="btn-primary mt-2" @click="openModal">
          <Plus :size="16" />
          <span>{{ t('exp.recordBtn') }}</span>
        </button>
      </div>
    </div>

    <!-- Record Expense Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">
            <Receipt :size="22" class="text-espresso" />
            {{ t('exp.modalTitle') }}
          </h3>
          <button class="close-btn" @click="closeModal" type="button">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="saveExpense" class="modal-body">
          <!-- Category Grid Selection -->
          <div class="form-group">
            <label class="form-label">Expense Category *</label>
            <div class="category-grid">
              <button
                v-for="cat in categoryOptions"
                :key="cat.key"
                type="button"
                class="category-option-btn"
                :class="{ active: form.category === cat.key }"
                @click="form.category = cat.key"
              >
                <span class="cat-icon">{{ cat.emoji }}</span>
                <span class="cat-name">{{ cat.label }}</span>
              </button>
            </div>
          </div>

          <!-- Title Input (Optional) -->
          <div class="form-group">
            <label class="form-label">{{ t('exp.titleInput') }}</label>
            <input
              type="text"
              v-model="form.title"
              placeholder="Optional description (e.g. Monthly Water, Staff Salary)"
              class="form-input"
            />
          </div>

          <!-- Amount & Date Grid -->
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">{{ t('exp.amountInput') }} *</label>
              <div class="currency-input-wrap">
                <span class="currency-symbol">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  v-model.number="form.amount"
                  placeholder="0.00"
                  class="form-input currency-input"
                  required
                />
              </div>
            </div>

            <div class="form-group flex-1">
              <label class="form-label">{{ t('exp.dateInput') }} *</label>
              <input type="date" v-model="form.date" class="form-input" required />
            </div>
          </div>

          <!-- Payment Method -->
          <div class="form-group">
            <label class="form-label">{{ t('exp.paymentMethod') }}</label>
            <div class="payment-method-chips">
              <button
                v-for="pm in paymentMethods"
                :key="pm.key"
                type="button"
                class="pm-chip"
                :class="{ active: form.paymentMethod === pm.key }"
                @click="form.paymentMethod = pm.key"
              >
                {{ pm.label }}
              </button>
            </div>
          </div>

          <!-- Note Input -->
          <div class="form-group">
            <label class="form-label">{{ t('exp.noteInput') }}</label>
            <textarea
              v-model="form.note"
              rows="2"
              placeholder="Invoice number, supplier name, or details..."
              class="form-input textarea"
            ></textarea>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMsg" class="error-banner">
            {{ errorMsg }}
          </div>

          <!-- Modal Actions -->
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <Check :size="16" v-if="!saving" />
              <RotateCw :size="16" class="spin-anim" v-else />
              <span>{{ t('exp.saveBtn') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Receipt,
  RotateCw,
  Plus,
  WalletCards,
  Zap,
  Building2,
  Users,
  Filter,
  Search,
  Download,
  Trash2,
  X,
  Check,
} from 'lucide-vue-next';

import {
  posApi,
  Expense,
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseSummaryData,
} from '../services/api';
import { useI18n } from '../i18n';

const { t } = useI18n();

// Data State
const expenses = ref<Expense[]>([]);
const summary = ref<ExpenseSummaryData | null>(null);
const loading = ref(false);
const saving = ref(false);
const errorMsg = ref('');

// Filter State
const selectedCategory = ref<string>('ALL');
const searchQuery = ref<string>('');
const selectedPreset = ref<string>('preset30Days');
const startDateInput = ref<string>('');
const endDateInput = ref<string>('');

// Modal State
const showModal = ref(false);
const form = ref({
  title: '',
  category: 'WATER' as ExpenseCategory,
  amount: undefined as number | undefined,
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'CASH' as ExpensePaymentMethod,
  note: '',
});

const datePresets = [
  { key: 'presetToday', labelKey: 'rep.presetToday' },
  { key: 'presetYesterday', labelKey: 'rep.presetYesterday' },
  { key: 'preset7Days', labelKey: 'rep.preset7Days' },
  { key: 'preset30Days', labelKey: 'rep.preset30Days' },
  { key: 'presetAll', labelKey: 'rep.presetAll' },
  { key: 'custom', labelKey: 'rep.customRange' },
];

const categoryOptions: { key: ExpenseCategory; emoji: string; label: string }[] = [
  { key: 'WATER', emoji: '💧', label: 'Water Bill' },
  { key: 'ELECTRICITY', emoji: '⚡', label: 'Electricity Bill' },
  { key: 'RENT', emoji: '🏪', label: 'Shop Rent' },
  { key: 'SALARY', emoji: '👥', label: 'Staff Salary' },
  { key: 'MAINTENANCE', emoji: '🛠️', label: 'Maintenance' },
  { key: 'OTHER', emoji: '📝', label: 'Other' },
];

const paymentMethods: { key: ExpensePaymentMethod; label: string }[] = [
  { key: 'CASH', label: '💵 Cash' },
  { key: 'QR_CODE', label: '📱 KHQR / Scan' },
  { key: 'BANK_TRANSFER', label: '🏦 Bank Transfer' },
  { key: 'CARD', label: '💳 Credit Card' },
];

const getCategoryEmoji = (cat: ExpenseCategory) => {
  switch (cat) {
    case 'WATER':
      return '💧';
    case 'ELECTRICITY':
      return '⚡';
    case 'RENT':
      return '🏪';
    case 'SALARY':
      return '👥';
    case 'MAINTENANCE':
      return '🛠️';
    default:
      return '📝';
  }
};

const getCategoryLabel = (cat: ExpenseCategory) => {
  switch (cat) {
    case 'WATER':
      return t('exp.catWater');
    case 'ELECTRICITY':
      return t('exp.catElectricity');
    case 'RENT':
      return t('exp.catRent');
    case 'SALARY':
      return t('exp.catSalary');
    case 'MAINTENANCE':
      return t('exp.catMaintenance');
    default:
      return t('exp.catOther');
  }
};

const getDateRangeForPreset = (key: string) => {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  if (key === 'presetToday') {
    const d = formatDate(today);
    return { start: d, end: d };
  } else if (key === 'presetYesterday') {
    const yest = new Date(today);
    yest.setDate(yest.getDate() - 1);
    const d = formatDate(yest);
    return { start: d, end: d };
  } else if (key === 'preset7Days') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { start: formatDate(start), end: formatDate(today) };
  } else if (key === 'preset30Days') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: formatDate(start), end: formatDate(today) };
  } else if (key === 'presetAll') {
    return { start: '', end: '' };
  }
  return { start: startDateInput.value, end: endDateInput.value };
};

const selectPreset = (key: string) => {
  selectedPreset.value = key;
  if (key !== 'custom') {
    const { start, end } = getDateRangeForPreset(key);
    startDateInput.value = start;
    endDateInput.value = end;
    fetchExpenses();
  }
};

const fetchExpenses = async () => {
  loading.value = true;
  try {
    const [expData, sumData] = await Promise.all([
      posApi.getExpenses(
        startDateInput.value,
        endDateInput.value,
        selectedCategory.value,
        searchQuery.value
      ),
      posApi.getExpenseSummary(startDateInput.value, endDateInput.value),
    ]);
    expenses.value = expData;
    summary.value = sumData;
  } catch (err) {
    console.error('Failed to load expenses:', err);
  } finally {
    loading.value = false;
  }
};

const openModal = () => {
  form.value = {
    title: '',
    category: 'WATER',
    amount: undefined,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    note: '',
  };
  errorMsg.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveExpense = async () => {
  if (!form.value.amount || form.value.amount <= 0) {
    errorMsg.value = 'Please enter a valid positive amount';
    return;
  }

  saving.value = true;
  errorMsg.value = '';
  try {
    const finalTitle = form.value.title.trim() || getCategoryLabel(form.value.category);
    await posApi.createExpense({
      title: finalTitle,
      category: form.value.category,
      amount: form.value.amount,
      date: form.value.date,
      paymentMethod: form.value.paymentMethod,
      note: form.value.note,
    });
    closeModal();
    fetchExpenses();
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message || 'Failed to save expense record';
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (expense: Expense) => {
  if (confirm(t('exp.deleteConfirm'))) {
    try {
      await posApi.deleteExpense(expense.id);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  }
};

const exportCsv = () => {
  if (expenses.value.length === 0) return;
  const headers = ['ID', 'Title', 'Category', 'Amount ($)', 'Date', 'Payment Method', 'Notes'];
  const rows = expenses.value.map((e) => [
    e.id,
    `"${e.title.replace(/"/g, '""')}"`,
    e.category,
    e.amount,
    e.date,
    e.paymentMethod,
    `"${(e.note || '').replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Shop_Expenses_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

onMounted(() => {
  const { start, end } = getDateRangeForPreset('preset30Days');
  startDateInput.value = start;
  endDateInput.value = end;
  fetchExpenses();
});
</script>

<style scoped>
.expenses-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.expenses-header {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
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

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
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

.bg-blue {
  background-color: #2563eb;
}

.bg-gold {
  background-color: #d97706;
}

.bg-purple {
  background-color: #7e22ce;
}

.kpi-info {
  display: flex;
  flex-direction: column;
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
  line-height: 1.2;
  margin-top: 0.2rem;
}

.text-accent {
  color: #794022;
}

.text-blue {
  color: #2563eb;
}

.text-gold {
  color: #d97706;
}

.text-purple {
  color: #7e22ce;
}

/* Filter Card */
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

.category-filter-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #FAF7F2;
  padding: 0.35rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #DEAC76;
}

.filter-icon {
  color: #794022;
}

.category-select {
  border: none;
  background: transparent;
  font-weight: 600;
  font-size: 0.9rem;
  color: #591F0B;
  outline: none;
  cursor: pointer;
}

/* Custom Date Row */
.custom-date-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #e5e7eb;
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
  padding: 0.45rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  outline: none;
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

/* Table */
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

.cat-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
}

.cat-badge.water {
  background-color: #dbeafe;
  color: #1e40af;
}

.cat-badge.electricity {
  background-color: #fef3c7;
  color: #92400e;
}

.cat-badge.rent {
  background-color: #fed7aa;
  color: #9a3412;
}

.cat-badge.salary {
  background-color: #f3e8ff;
  color: #6b21a8;
}

.cat-badge.maintenance {
  background-color: #e0e7ff;
  color: #3730a3;
}

.cat-badge.other {
  background-color: #f3f4f6;
  color: #374151;
}

.pay-method-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #4b5563;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 0.4rem;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background-color: #fef2f2;
  border-color: #fca5a5;
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  border-radius: 0.85rem;
  max-width: 580px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #FAF7F2;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #591F0B;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-btn {
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
}

.close-btn:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #374151;
}

.form-input {
  padding: 0.6rem 0.85rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  outline: none;
}

.form-input:focus {
  border-color: #794022;
  box-shadow: 0 0 0 3px rgba(121, 64, 34, 0.1);
}

.currency-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 0.85rem;
  font-weight: 800;
  color: #794022;
}

.currency-input {
  padding-left: 2rem;
  width: 100%;
}

.textarea {
  resize: vertical;
}

/* Category Grid Buttons */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.category-option-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-option-btn:hover {
  border-color: #DEAC76;
  background: #FAF7F2;
}

.category-option-btn.active {
  border-color: #794022;
  background: #794022;
  color: #ffffff;
}

.cat-icon {
  font-size: 1.1rem;
}

.cat-name {
  font-size: 0.8rem;
  font-weight: 700;
}

/* Payment Method Chips */
.payment-method-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.pm-chip {
  padding: 0.4rem 0.85rem;
  border: 1px solid #d1d5db;
  border-radius: 0.4rem;
  background: #ffffff;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4b5563;
  cursor: pointer;
}

.pm-chip:hover {
  border-color: #794022;
}

.pm-chip.active {
  background: #FAF7F2;
  border-color: #794022;
  color: #794022;
  font-weight: 700;
}

.error-banner {
  padding: 0.75rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  border-radius: 0.5rem;
  font-size: 0.85rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    flex-direction: column;
  }
}
</style>
