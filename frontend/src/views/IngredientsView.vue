<template>
  <div class="ingredients-page">
    <!-- Header Section -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('ing.title') }}</h1>
        <p class="page-subtitle">{{ t('ing.subtitle') }}</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-primary add-ingredient-btn" @click="openAddModal">
          <Plus :size="18" />
          <span>{{ t('ing.addBtn') }}</span>
        </button>
      </div>
    </div>

    <!-- Inventory Overview Cards -->
    <div class="summary-cards-grid">
      <div class="kpi-card">
        <div class="kpi-icon-box bg-warm-coffee">
          <Boxes :size="22" />
        </div>
        <div>
          <div class="kpi-label">{{ t('ing.trackedItems') }}</div>
          <div class="kpi-val">{{ ingredients.length }} {{ t('ing.itemsCount') }}</div>
          <div class="kpi-sub">{{ categories.length - 1 }} {{ t('dash.categories') }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-box bg-gold">
          <DollarSign :size="22" />
        </div>
        <div>
          <div class="kpi-label">{{ t('ing.valuation') }}</div>
          <div class="kpi-val">${{ totalStockValuation.toFixed(2) }}</div>
          <div class="kpi-sub">{{ t('ing.valuationSub') }}</div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon-box" :class="lowStockCount > 0 ? 'bg-danger-tint' : 'bg-success-tint'">
          <AlertTriangle v-if="lowStockCount > 0" :size="22" class="text-danger" />
          <CheckCircle2 v-else :size="22" class="text-success" />
        </div>
        <div>
          <div class="kpi-label">{{ t('ing.lowAlert') }}</div>
          <div class="kpi-val" :class="lowStockCount > 0 ? 'text-danger' : 'text-success'">
            {{ lowStockCount }} {{ t('ing.itemsCount') }}
          </div>
          <div class="kpi-sub">{{ lowStockCount > 0 ? t('ing.lowAlertSub') : t('ing.allHealthy') }}</div>
        </div>
      </div>
    </div>

    <!-- Filter & Control Toolbar -->
    <div class="filter-toolbar">
      <div class="search-and-cats">
        <div class="search-box">
          <Search :size="16" class="search-icon" />
          <input
            type="text"
            :placeholder="t('ing.search')"
            v-model="searchQuery"
            @input="filterIngredients"
            class="input-field"
          />
        </div>

        <div class="category-filter-bar">
          <button
            v-for="cat in categories"
            :key="cat"
            class="category-chip"
            :class="{ active: selectedCategory === cat }"
            @click="selectCategory(cat)"
          >
            {{ translateCategory(cat) }}
          </button>
        </div>
      </div>

      <!-- View Switcher Toggle -->
      <div class="view-toggle-bar">
        <button
          class="view-toggle-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="setViewMode('grid')"
          :title="t('ing.viewCards')"
        >
          <LayoutGrid :size="16" />
          <span class="toggle-label">{{ t('ing.viewCards') }}</span>
        </button>
        <button
          class="view-toggle-btn"
          :class="{ active: viewMode === 'table' }"
          @click="setViewMode('table')"
          :title="t('ing.viewTable')"
        >
          <List :size="16" />
          <span class="toggle-label">{{ t('ing.viewTable') }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <Loader2 class="spinner" :size="36" />
      <span>{{ t('ing.loading') }}</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="ingredients.length === 0" class="empty-state card">
      <PackageX :size="52" class="empty-icon" />
      <h3>{{ t('ing.noIngredients') }}</h3>
      <p>{{ t('ing.noIngredientsSub') }}</p>
      <button class="btn btn-primary" style="margin-top: 1rem;" @click="openAddModal">
        <Plus :size="16" />
        <span>{{ t('ing.addBtn') }}</span>
      </button>
    </div>

    <!-- MAIN CONTENT: CARD GRID VIEW (Default) -->
    <div v-else-if="viewMode === 'grid'" class="ingredients-card-grid">
      <div
        v-for="item in ingredients"
        :key="item.id"
        class="ingredient-card"
        :class="{
          'card-critical': getStockStatusType(item) === 'critical',
          'card-warning': getStockStatusType(item) === 'warning'
        }"
      >
        <!-- Card Header Badges -->
        <div class="card-top-row">
          <span class="category-pill">{{ translateCategory(item.category) }}</span>
          
          <span
            class="status-pill"
            :class="{
              'status-critical': getStockStatusType(item) === 'critical',
              'status-warning': getStockStatusType(item) === 'warning',
              'status-healthy': getStockStatusType(item) === 'healthy'
            }"
          >
            <AlertTriangle v-if="getStockStatusType(item) === 'critical'" :size="12" />
            <AlertCircle v-else-if="getStockStatusType(item) === 'warning'" :size="12" />
            <CheckCircle2 v-else :size="12" />
            <span>{{ getStockStatusType(item) === 'critical' ? t('ing.stockCritical') : getStockStatusType(item) === 'warning' ? t('ing.stockWarning') : t('ing.stockHealthy') }}</span>
          </span>
        </div>

        <!-- Ingredient Title & Emoji Info -->
        <div class="card-identity">
          <div class="ingredient-avatar">
            <span class="avatar-emoji">{{ item.icon || '📦' }}</span>
          </div>
          <div class="ingredient-info">
            <h3 class="ingredient-name" :title="item.name">{{ item.name }}</h3>
            <span class="ingredient-uom-tag">{{ item.uom.toUpperCase() }} Unit</span>
          </div>
        </div>

        <!-- Stock Health Progress Meter -->
        <div class="stock-meter-block">
          <div class="stock-meter-header">
            <span class="meter-label">{{ t('ing.stockLevel') }}</span>
            <span class="stock-number font-mono">
              <strong>{{ item.stock.toLocaleString() }}</strong> <span class="uom-text">{{ item.uom }}</span>
            </span>
          </div>

          <div class="stock-progress-track">
            <div
              class="stock-progress-fill"
              :class="{
                'fill-critical': getStockStatusType(item) === 'critical',
                'fill-warning': getStockStatusType(item) === 'warning',
                'fill-healthy': getStockStatusType(item) === 'healthy'
              }"
              :style="{ width: `${getStockPercent(item)}%` }"
            ></div>
          </div>

          <div class="stock-meter-footer">
            <span class="min-threshold-info">
              <TrendingDown :size="12" />
              {{ t('ing.minAlertThreshold') }}: &lt; {{ item.minStock.toLocaleString() }} {{ item.uom }}
            </span>
          </div>
        </div>

        <!-- Cost & Valuation Metric Tiles -->
        <div class="metric-tiles-row">
          <div class="metric-tile">
            <span class="tile-label">{{ t('ing.costPer') }}</span>
            <span class="tile-value font-mono">${{ item.costPerUnit.toFixed(4) }}</span>
            <span class="tile-sub">per {{ item.uom }}</span>
          </div>
          <div class="metric-tile">
            <span class="tile-label">{{ t('ing.totalVal') }}</span>
            <span class="tile-value font-mono valuation-val">${{ (item.stock * item.costPerUnit).toFixed(2) }}</span>
            <span class="tile-sub">on hand</span>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="card-action-bar">
          <button
            class="btn btn-restock-action"
            @click="openRestockModal(item)"
            :title="t('ing.restock')"
          >
            <PlusCircle :size="15" />
            <span>{{ t('ing.restock') }}</span>
          </button>
          <div class="side-actions">
            <button
              class="icon-btn edit-icon-btn"
              :title="t('ing.save')"
              @click="openEditModal(item)"
            >
              <Edit3 :size="15" />
            </button>
            <button
              class="icon-btn delete-icon-btn"
              :title="t('ing.deleteTitle')"
              @click="confirmDelete(item)"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ALTERNATIVE CONTENT: TABLE VIEW -->
    <div v-else class="card table-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('ing.tblName') }}</th>
              <th>{{ t('ing.tblCat') }}</th>
              <th>{{ t('ing.tblStock') }}</th>
              <th>{{ t('ing.tblCost') }}</th>
              <th>{{ t('ing.tblValue') }}</th>
              <th>{{ t('ing.tblAlert') }}</th>
              <th>{{ t('ing.tblStatus') }}</th>
              <th style="text-align: right;">{{ t('ing.tblActions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in ingredients" :key="item.id">
              <td>
                <div class="product-cell">
                  <span class="product-icon">{{ item.icon || '📦' }}</span>
                  <div class="product-name">{{ item.name }}</div>
                </div>
              </td>
              <td>
                <span class="category-tag">{{ translateCategory(item.category) }}</span>
              </td>
              <td class="font-bold font-mono">
                {{ item.stock.toLocaleString() }} {{ item.uom }}
              </td>
              <td class="font-mono text-muted">
                ${{ item.costPerUnit.toFixed(4) }} / {{ item.uom }}
              </td>
              <td class="font-bold font-mono text-dark">
                ${{ (item.stock * item.costPerUnit).toFixed(2) }}
              </td>
              <td class="font-mono text-muted">
                &lt; {{ item.minStock.toLocaleString() }} {{ item.uom }}
              </td>
              <td>
                <span
                  class="badge"
                  :class="item.stock <= item.minStock ? 'badge-danger' : item.stock <= item.minStock * 1.8 ? 'badge-warning' : 'badge-success'"
                >
                  {{ item.stock <= item.minStock ? t('ing.stockCritical') : item.stock <= item.minStock * 1.8 ? t('ing.stockWarning') : t('ing.stockHealthy') }}
                </span>
              </td>
              <td style="text-align: right;">
                <div class="action-buttons">
                  <button class="btn btn-secondary restock-btn" @click="openRestockModal(item)" :title="t('ing.restock')">
                    <PlusCircle :size="14" />
                    <span>{{ t('ing.restock') }}</span>
                  </button>
                  <button class="action-btn edit-btn" :title="t('ing.save')" @click="openEditModal(item)">
                    <Edit3 :size="16" />
                  </button>
                  <button class="action-btn delete-btn" :title="t('ing.deleteTitle')" @click="confirmDelete(item)">
                    <Trash2 :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- RESTOCK MODAL WITH PRESETS -->
    <div v-if="showRestockModal && itemToRestock" class="modal-backdrop" @click.self="showRestockModal = false">
      <div class="product-modal restock-modal">
        <div class="modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-badge">
              <PlusCircle :size="24" />
            </div>
            <div>
              <h2 class="modal-title">{{ t('ing.modalRestockTitle') }}</h2>
              <p class="modal-subtitle">{{ itemToRestock.name }} ({{ t('ing.currentStock') }}: {{ itemToRestock.stock.toLocaleString() }} {{ itemToRestock.uom }})</p>
            </div>
          </div>
          <button class="close-btn" @click="showRestockModal = false">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="executeRestock" class="modal-form">
          <!-- Quick Preset Chips -->
          <div class="preset-section">
            <label class="preset-title">{{ t('ing.quickRestock') }}</label>
            <div class="preset-chips-row">
              <button type="button" class="preset-chip" @click="addPresetQty(100)">{{ t('ing.preset100') }}</button>
              <button type="button" class="preset-chip" @click="addPresetQty(500)">{{ t('ing.preset500') }}</button>
              <button type="button" class="preset-chip" @click="addPresetQty(1000)">{{ t('ing.preset1k') }}</button>
              <button type="button" class="preset-chip" @click="addPresetQty(2000)">{{ t('ing.preset2k') }}</button>
              <button type="button" class="preset-chip" @click="addPresetQty(5000)">{{ t('ing.preset5k') }}</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('ing.qtyToAdd') }} ({{ itemToRestock.uom }}) *</label>
            <input
              type="number"
              step="any"
              min="0.1"
              v-model.number="restockAmount"
              required
              class="input-field font-mono input-lg"
              placeholder="e.g. 1000"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('ing.deliveryNotes') }}</label>
            <input
              type="text"
              v-model="restockNotes"
              placeholder="e.g. Weekly supplier shipment"
              class="input-field"
            />
          </div>

          <div class="restock-summary">
            <div class="restock-summary-row">
              <span>{{ t('ing.currentStock') }}:</span>
              <strong class="font-mono">{{ itemToRestock.stock.toLocaleString() }} {{ itemToRestock.uom }}</strong>
            </div>
            <div class="restock-summary-row highlight">
              <span>{{ t('ing.newProjectedStock') }}</span>
              <strong class="font-mono">{{ (itemToRestock.stock + (restockAmount || 0)).toLocaleString() }} {{ itemToRestock.uom }}</strong>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showRestockModal = false">{{ t('ing.cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="restocking || !restockAmount">
              <Loader2 v-if="restocking" class="spinner" :size="16" />
              <Check v-else :size="16" />
              <span>{{ t('ing.confirmRestock') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ADD / EDIT INGREDIENT MODAL -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="product-modal">
        <div class="modal-header">
          <div class="modal-title-group">
            <div class="modal-icon-badge">
              <PlusCircle v-if="isCreating" :size="24" />
              <Edit3 v-else :size="24" />
            </div>
            <div>
              <h2 class="modal-title">{{ isCreating ? t('ing.modalAddTitle') : t('ing.modalEditTitle') }}</h2>
              <p class="modal-subtitle">{{ isCreating ? t('ing.modalAddSub') : t('ing.modalEditSub') }}</p>
            </div>
          </div>
          <button class="close-btn" @click="showModal = false">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="saveIngredient" class="modal-form">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">{{ t('ing.name') }}</label>
              <input
                type="text"
                v-model="formData.name"
                required
                placeholder="e.g. Almond Milk"
                class="input-field"
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('ing.category') }}</label>
              <input
                type="text"
                v-model="formData.category"
                required
                placeholder="e.g. Dairy & Milk, Syrups"
                class="input-field"
                list="ing-category-suggestions"
              />
              <datalist id="ing-category-suggestions">
                <option v-for="cat in availableCategories" :key="cat" :value="cat" />
              </datalist>
            </div>
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">{{ t('ing.currentStock') }}</label>
              <input
                type="number"
                step="any"
                min="0"
                v-model.number="formData.stock"
                required
                class="input-field font-mono"
              />
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('ing.uom') }}</label>
              <select v-model="formData.uom" required class="input-field">
                <option value="g">Grams (g)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="oz">Ounces (oz)</option>
                <option value="pc">Pieces (pc)</option>
                <option value="scoop">Scoop</option>
                <option value="slice">Slice</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('prod.iconEmoji') }}</label>
              <input
                type="text"
                v-model="formData.icon"
                placeholder="🥛"
                class="input-field text-center"
              />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">{{ t('ing.costPerUnit') }}</label>
              <input
                type="number"
                step="0.0001"
                min="0"
                v-model.number="formData.costPerUnit"
                required
                placeholder="0.0021"
                class="input-field font-mono"
              />
              <span class="input-hint">Unit price per {{ formData.uom || 'unit' }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">{{ t('ing.minThreshold') }}</label>
              <input
                type="number"
                step="any"
                min="0"
                v-model.number="formData.minStock"
                required
                placeholder="500"
                class="input-field font-mono"
              />
              <span class="input-hint">Trigger low stock alert</span>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">{{ t('ing.cancel') }}</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <Loader2 v-if="saving" class="spinner" :size="16" />
              <Check v-else :size="16" />
              <span>{{ isCreating ? t('ing.create') : t('ing.save') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div v-if="showDeleteModal && itemToDelete" class="modal-backdrop" @click.self="showDeleteModal = false">
      <div class="delete-modal">
        <div class="delete-modal-icon">
          <Trash2 :size="32" />
        </div>
        <h3 class="delete-title">{{ t('ing.deleteTitle') }}</h3>
        <p class="delete-desc">
          {{ t('ing.deleteConfirm') }} <strong>{{ itemToDelete.name }}</strong>? {{ t('ing.deleteWarning') }}
        </p>
        <div class="delete-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">{{ t('ing.cancel') }}</button>
          <button class="btn btn-danger" @click="executeDelete" :disabled="deleting">
            <Loader2 v-if="deleting" class="spinner" :size="16" />
            <span>{{ t('common.delete') || 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Boxes,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  PackageX,
  PlusCircle,
  X,
  Check,
  Loader2,
  LayoutGrid,
  List,
  TrendingDown,
} from 'lucide-vue-next';
import { posApi, Ingredient } from '../services/api';
import { usePosStore } from '../stores/posStore';
import { useI18n } from '../i18n';

const { locale, t, translateCategory } = useI18n();
const posStore = usePosStore();
const ingredients = ref<Ingredient[]>([]);
const categories = ref<string[]>(['All']);
const selectedCategory = ref(
  (typeof localStorage !== 'undefined' ? localStorage.getItem('ingredients_selected_category') : null) || 'All'
);
const searchQuery = ref('');
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const restocking = ref(false);

// View Mode: 'grid' (Cards) or 'table'
const viewMode = ref<'grid' | 'table'>(
  ((typeof localStorage !== 'undefined' ? localStorage.getItem('ingredients_view_mode') : null) as 'grid' | 'table') || 'grid'
);

const setViewMode = (mode: 'grid' | 'table') => {
  viewMode.value = mode;
  try {
    localStorage.setItem('ingredients_view_mode', mode);
  } catch (e) {}
};

// Add / Edit Modal
const showModal = ref(false);
const isCreating = ref(true);
const editingIngredientId = ref<string | null>(null);

const formData = ref({
  name: '',
  category: 'Coffee Beans',
  stock: 1000,
  uom: 'g',
  costPerUnit: 0.012,
  minStock: 200,
  icon: '☕',
});

// Restock Modal
const showRestockModal = ref(false);
const itemToRestock = ref<Ingredient | null>(null);
const restockAmount = ref<number | null>(null);
const restockNotes = ref('');

// Delete Modal
const showDeleteModal = ref(false);
const itemToDelete = ref<Ingredient | null>(null);

// Calculations
const totalStockValuation = computed(() => {
  return ingredients.value.reduce((sum, i) => sum + (i.stock * i.costPerUnit), 0);
});

const lowStockCount = computed(() => {
  return ingredients.value.filter((i) => i.stock <= i.minStock).length;
});

const availableCategories = computed(() => {
  return categories.value.filter((c) => c !== 'All');
});

// Helper for Card Stock Percentage & Status
const getStockPercent = (item: Ingredient) => {
  if (!item.minStock || item.minStock <= 0) return 100;
  const target = item.minStock * 2.5;
  const pct = Math.round((item.stock / target) * 100);
  return Math.min(100, Math.max(6, pct));
};

const getStockStatusType = (item: Ingredient): 'critical' | 'warning' | 'healthy' => {
  if (item.stock <= item.minStock) return 'critical';
  if (item.stock <= item.minStock * 1.8) return 'warning';
  return 'healthy';
};

const addPresetQty = (amount: number) => {
  restockAmount.value = (restockAmount.value || 0) + amount;
};

const loadData = async () => {
  loading.value = true;
  try {
    const [cats, ings] = await Promise.all([
      posApi.getIngredientCategories(),
      posApi.getIngredients(selectedCategory.value, searchQuery.value),
    ]);
    categories.value = cats;
    if (selectedCategory.value !== 'All' && !categories.value.includes(selectedCategory.value)) {
      selectedCategory.value = 'All';
      try { localStorage.setItem('ingredients_selected_category', 'All'); } catch (e) {}
    }
    ingredients.value = ings;
  } catch (err) {
    console.error('Failed to load ingredients', err);
  } finally {
    loading.value = false;
  }
};

let debounceTimer: any = null;
const filterIngredients = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    posApi.getIngredients(selectedCategory.value, searchQuery.value).then((res) => {
      ingredients.value = res;
    });
  }, 250);
};

const selectCategory = (cat: string) => {
  selectedCategory.value = cat;
  try {
    localStorage.setItem('ingredients_selected_category', cat);
  } catch (e) {}
  filterIngredients();
};

// Modal Handlers
const openAddModal = () => {
  isCreating.value = true;
  editingIngredientId.value = null;
  formData.value = {
    name: '',
    category: availableCategories.value[0] || 'Coffee Beans',
    stock: 2000,
    uom: 'g',
    costPerUnit: 0.015,
    minStock: 300,
    icon: '📦',
  };
  showModal.value = true;
};

const openEditModal = (item: Ingredient) => {
  isCreating.value = false;
  editingIngredientId.value = item.id;
  formData.value = {
    name: item.name,
    category: item.category,
    stock: item.stock,
    uom: item.uom,
    costPerUnit: item.costPerUnit,
    minStock: item.minStock,
    icon: item.icon || '📦',
  };
  showModal.value = true;
};

const saveIngredient = async () => {
  saving.value = true;
  try {
    if (isCreating.value) {
      await posStore.addIngredient(formData.value);
    } else if (editingIngredientId.value) {
      await posStore.editIngredient(editingIngredientId.value, formData.value);
    }
    await loadData();
    showModal.value = false;
  } catch (err) {
    alert('Failed to save ingredient.');
  } finally {
    saving.value = false;
  }
};

// Restock Handlers
const openRestockModal = (item: Ingredient) => {
  itemToRestock.value = item;
  restockAmount.value = null;
  restockNotes.value = '';
  showRestockModal.value = true;
};

const executeRestock = async () => {
  if (!itemToRestock.value || !restockAmount.value) return;
  restocking.value = true;
  try {
    await posStore.restockIngredient(itemToRestock.value.id, restockAmount.value, restockNotes.value);
    await loadData();
    showRestockModal.value = false;
    itemToRestock.value = null;
  } catch (err) {
    alert('Failed to restock ingredient.');
  } finally {
    restocking.value = false;
  }
};

// Delete Handlers
const confirmDelete = (item: Ingredient) => {
  itemToDelete.value = item;
  showDeleteModal.value = true;
};

const executeDelete = async () => {
  if (!itemToDelete.value) return;
  deleting.value = true;
  try {
    await posStore.removeIngredient(itemToDelete.value.id);
    await loadData();
    showDeleteModal.value = false;
    itemToDelete.value = null;
  } catch (err) {
    alert('Failed to delete ingredient.');
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.ingredients-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
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

.add-ingredient-btn {
  padding: 0.65rem 1.25rem;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* KPI Summary Grid */
.summary-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.kpi-card {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.kpi-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-warm-coffee { background: var(--primary-100); color: var(--primary); }
.bg-gold { background: var(--warning-light); color: var(--accent-gold); }
.bg-danger-tint { background: var(--danger-light); color: var(--danger); }
.bg-success-tint { background: var(--success-light); color: var(--success); }

.kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.kpi-val {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--gray-900);
  line-height: 1.2;
}

.kpi-sub {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.text-success { color: var(--success) !important; }
.text-warning { color: var(--warning) !important; }
.text-danger { color: var(--danger) !important; }
.text-dark { color: var(--dark) !important; }
.text-muted { color: var(--gray-500) !important; }

/* Filter & Control Toolbar */
.filter-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-and-cats {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 1;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--gray-400);
}

.search-box .input-field {
  padding-left: 2.35rem;
}

.category-filter-bar {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
  max-width: 100%;
}

.category-chip {
  padding: 0.4rem 0.9rem;
  border-radius: var(--border-radius-full);
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-700);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.category-chip:hover {
  background: var(--primary-50);
  border-color: var(--primary-border);
  color: var(--primary);
}

.category-chip.active {
  background: var(--primary);
  color: var(--white);
  border-color: var(--primary);
  box-shadow: 0 2px 6px rgba(121, 64, 34, 0.25);
}

/* View Switcher */
.view-toggle-bar {
  display: flex;
  background: var(--gray-200);
  padding: 3px;
  border-radius: var(--border-radius-sm);
  gap: 2px;
}

.view-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--gray-600);
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-toggle-btn:hover {
  color: var(--gray-900);
}

.view-toggle-btn.active {
  background: var(--white);
  color: var(--primary);
  box-shadow: var(--shadow-xs);
}

/* CARD GRID STYLES */
.ingredients-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.25rem;
}

.ingredient-card {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.ingredient-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-border);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.ingredient-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-border);
}

.ingredient-card:hover::before {
  opacity: 1;
}

.ingredient-card.card-critical {
  border-color: var(--danger-border);
  background: linear-gradient(180deg, var(--danger-light) 0%, var(--white) 15%);
}

.ingredient-card.card-critical::before {
  background: var(--danger);
  opacity: 1;
}

.ingredient-card.card-warning {
  border-color: var(--warning-border);
}

.ingredient-card.card-warning::before {
  background: var(--warning);
  opacity: 1;
}

/* Card Top Badges */
.card-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.category-pill {
  font-size: 0.725rem;
  font-weight: 600;
  color: var(--gray-600);
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  padding: 0.2rem 0.55rem;
  border-radius: var(--border-radius-full);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.725rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: var(--border-radius-full);
}

.status-healthy {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid var(--success-border);
}

.status-warning {
  background: var(--warning-light);
  color: var(--warning-dark);
  border: 1px solid var(--warning-border);
}

.status-critical {
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid var(--danger-border);
}

/* Card Identity (Emoji + Name) */
.card-identity {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.ingredient-avatar {
  width: 50px;
  height: 50px;
  background: var(--primary-50);
  border: 1.5px solid var(--primary-border);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.65rem;
  flex-shrink: 0;
  box-shadow: inset 0 1px 2px rgba(121, 64, 34, 0.08);
}

.ingredient-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ingredient-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ingredient-uom-tag {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  margin-top: 2px;
}

/* Stock Health Meter */
.stock-meter-block {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.stock-meter-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.meter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stock-number {
  font-size: 1.15rem;
  color: var(--gray-900);
}

.stock-number strong {
  font-weight: 800;
}

.uom-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-500);
}

.stock-progress-track {
  width: 100%;
  height: 7px;
  background: var(--gray-200);
  border-radius: 9999px;
  overflow: hidden;
}

.stock-progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.fill-healthy {
  background: linear-gradient(90deg, #2D6A4F, #52B788);
}

.fill-warning {
  background: linear-gradient(90deg, #D99937, #F59E0B);
}

.fill-critical {
  background: linear-gradient(90deg, #B9381E, #EF4444);
}

.stock-meter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
  color: var(--gray-500);
}

.min-threshold-info {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

/* Metric Tiles Row */
.metric-tiles-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}

.metric-tile {
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius-sm);
  padding: 0.55rem 0.65rem;
  display: flex;
  flex-direction: column;
}

.tile-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
}

.tile-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-top: 1px;
}

.valuation-val {
  color: var(--primary);
}

.tile-sub {
  font-size: 0.68rem;
  color: var(--gray-400);
}

/* Card Action Bar */
.card-action-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.25rem;
}

.btn-restock-action {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid var(--primary-border);
  padding: 0.55rem 0.75rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-restock-action:hover {
  background: var(--primary);
  color: var(--white);
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(121, 64, 34, 0.2);
}

.side-actions {
  display: inline-flex;
  gap: 0.35rem;
}

.icon-btn {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-sm);
  padding: 0.55rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  transition: all 0.2s ease;
}

.edit-icon-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-50);
}

.delete-icon-btn:hover {
  border-color: var(--danger);
  color: var(--danger);
  background: var(--danger-light);
}

/* Table Card */
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
  white-space: nowrap;
}

.data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--gray-200);
  color: var(--gray-800);
  vertical-align: middle;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.product-icon {
  font-size: 1.5rem;
  background: var(--primary-50);
  border: 1px solid var(--primary-border);
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.product-name {
  font-weight: 600;
  color: var(--gray-900);
}

.category-tag {
  background: var(--gray-100);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-700);
}

.action-buttons {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.restock-btn {
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  gap: 0.35rem;
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid var(--primary-border);
}

.restock-btn:hover {
  background: var(--primary);
  color: var(--white);
}

.action-btn {
  background: none;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 0.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-600);
  transition: all 0.2s;
}

.action-btn.edit-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.action-btn.delete-btn:hover {
  border-color: var(--danger);
  color: var(--danger);
  background: var(--danger-light);
}

.font-mono { font-family: monospace; }
.font-bold { font-weight: 700; }

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(44, 34, 33, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
}

.product-modal {
  background: var(--white);
  width: 540px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
}

.restock-modal {
  width: 460px;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modal-icon-badge {
  background: var(--primary-light);
  color: var(--primary);
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--primary-border);
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--gray-900);
}

.modal-subtitle {
  font-size: 0.8rem;
  color: var(--gray-500);
}

.close-btn {
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
}

.close-btn:hover {
  color: var(--gray-700);
  background: var(--gray-100);
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Quick Restock Preset Section */
.preset-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.preset-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--gray-600);
  text-transform: uppercase;
}

.preset-chips-row {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.preset-chip {
  background: var(--primary-50);
  border: 1px solid var(--primary-border);
  color: var(--primary);
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-chip:hover {
  background: var(--primary);
  color: var(--white);
}

.form-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-700);
}

.input-hint {
  font-size: 0.7rem;
  color: var(--gray-500);
}

.input-lg {
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.75rem 1rem;
}

.restock-summary {
  background: var(--primary-50);
  border: 1px solid var(--primary-border);
  padding: 0.85rem 1rem;
  border-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.875rem;
}

.restock-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--gray-700);
}

.restock-summary-row.highlight {
  color: var(--primary);
  font-size: 0.95rem;
  border-top: 1px dashed var(--primary-border);
  padding-top: 0.4rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Delete Modal */
.delete-modal {
  background: var(--white);
  width: 420px;
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: var(--shadow-xl);
}

.delete-modal-icon {
  background: var(--danger-light);
  color: var(--danger);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  border: 1px solid var(--danger-border);
}

.delete-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.delete-desc {
  font-size: 0.85rem;
  color: var(--gray-600);
  line-height: 1.4;
  margin-bottom: 1.5rem;
}

.delete-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.delete-actions .btn {
  flex: 1;
}

.loading-container, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3.5rem 1rem;
  gap: 0.75rem;
  color: var(--gray-500);
}

.empty-icon {
  color: var(--gray-400);
  margin-bottom: 0.5rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-grid-2, .form-grid-3 {
    grid-template-columns: 1fr;
  }
  .ingredients-card-grid {
    grid-template-columns: 1fr;
  }
  .filter-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    width: 100%;
  }
  .view-toggle-bar {
    align-self: flex-end;
  }
}
</style>
