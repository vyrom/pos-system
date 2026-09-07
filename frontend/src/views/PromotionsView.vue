<template>
  <div class="promotions-page">
    <!-- Header with Title & Action Buttons -->
    <div class="page-header">
      <div>
        <div class="title-with-badge">
          <h1 class="page-title">{{ t('promo.adminTitle') }}</h1>
          <span class="admin-badge">Admin Only</span>
        </div>
        <p class="page-subtitle">{{ t('promo.adminSubtitle') }}</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" @click="handleResetDefaults" type="button">
          <RotateCcw :size="16" />
          <span>{{ t('promo.resetDefaults') }}</span>
        </button>
        <button class="btn btn-primary" @click="openCreateModal" type="button">
          <Plus :size="16" />
          <span>{{ t('promo.create') }}</span>
        </button>
      </div>
    </div>

    <!-- KPI Summary Cards -->
    <div class="kpi-grid">
      <div class="kpi-card total-card">
        <div class="kpi-icon-wrap bg-blue">
          <Sparkles :size="20" />
        </div>
        <div class="kpi-meta">
          <span class="kpi-label">{{ t('promo.totalDeals') }}</span>
          <span class="kpi-value">{{ store.promotions.length }}</span>
        </div>
      </div>

      <div class="kpi-card active-card">
        <div class="kpi-icon-wrap bg-emerald">
          <CheckCircle2 :size="20" />
        </div>
        <div class="kpi-meta">
          <span class="kpi-label">{{ t('promo.activeDeals') }}</span>
          <div class="kpi-value-row">
            <span class="kpi-value text-emerald">{{ activeCount }}</span>
            <span class="live-dot-pulse"></span>
          </div>
        </div>
      </div>

      <div class="kpi-card upcoming-card">
        <div class="kpi-icon-wrap bg-amber">
          <CalendarClock :size="20" />
        </div>
        <div class="kpi-meta">
          <span class="kpi-label">{{ t('promo.upcomingDeals') }}</span>
          <span class="kpi-value text-amber">{{ upcomingCount }}</span>
        </div>
      </div>

      <div class="kpi-card expired-card">
        <div class="kpi-icon-wrap bg-rose">
          <AlertCircle :size="20" />
        </div>
        <div class="kpi-meta">
          <span class="kpi-label">{{ t('promo.expiredDeals') }}</span>
          <span class="kpi-value text-rose">{{ expiredCount }}</span>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="toolbar-card">
      <div class="search-box">
        <Search :size="18" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="locale === 'km' ? 'ស្វែងរកប្រូម៉ូសិន...' : 'Search promotions by name or badge...'"
          class="search-input"
        />
        <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">✕</button>
      </div>

      <div class="filter-tabs">
        <button
          v-for="status in statusFilters"
          :key="status.key"
          class="filter-tab-btn"
          :class="{ active: selectedStatusFilter === status.key }"
          @click="selectedStatusFilter = status.key"
          type="button"
        >
          <span>{{ status.label }}</span>
          <span class="tab-badge">{{ status.count }}</span>
        </button>
      </div>
    </div>

    <!-- Promotions Cards Grid -->
    <div v-if="filteredPromotions.length > 0" class="promo-grid">
      <div
        v-for="promo in filteredPromotions"
        :key="promo.id"
        class="promo-card"
        :class="{
          'is-active': getPromotionStatus(promo) === 'ACTIVE',
          'is-disabled': !promo.isActive,
          'is-expired': getPromotionStatus(promo) === 'EXPIRED',
          'is-upcoming': getPromotionStatus(promo) === 'UPCOMING',
        }"
      >
        <!-- Card Top Bar -->
        <div class="card-top-bar">
          <span class="promo-badge-pill">{{ promo.badge || '🎁 Deal' }}</span>
          <div class="status-indicator-pill" :class="getPromotionStatus(promo).toLowerCase()">
            <span class="status-dot"></span>
            <span>{{ getStatusLabel(getPromotionStatus(promo)) }}</span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="card-content">
          <h3 class="promo-title">{{ getPromoName(promo) }}</h3>
          <p class="promo-sub-title">{{ getPromoAltName(promo) }}</p>
          <p class="promo-desc">{{ getPromoDesc(promo) }}</p>

          <!-- Type info & categories -->
          <div class="promo-type-meta">
            <span class="type-tag">
              <Tag :size="13" />
              <span>{{ getTypeLabel(promo.type) }}</span>
            </span>
            <span v-if="promo.discountValue" class="discount-tag">
              {{ promo.type === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `$${promo.discountValue.toFixed(2)} OFF` }}
            </span>
          </div>

          <!-- Eligible Categories if custom -->
          <div v-if="promo.eligibleCategories && promo.eligibleCategories.length > 0" class="categories-wrap">
            <span class="cat-label">{{ t('promo.targetCategories') }}:</span>
            <div class="cat-chips">
              <span v-for="cat in promo.eligibleCategories" :key="cat" class="cat-chip">{{ cat }}</span>
            </div>
          </div>

          <!-- Schedule Box -->
          <div class="schedule-box">
            <div class="schedule-row">
              <Calendar :size="14" class="sched-icon" />
              <div class="sched-dates">
                <span class="sched-label">{{ t('promo.startDate') }}:</span>
                <strong>{{ promo.startDate || t('promo.noDateLimit') }}</strong>
              </div>
            </div>
            <div class="schedule-row">
              <Clock :size="14" class="sched-icon" />
              <div class="sched-dates">
                <span class="sched-label">{{ t('promo.endDate') }}:</span>
                <strong>{{ promo.endDate || t('promo.noDateLimit') }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="card-actions-bar">
          <!-- Active Toggle Switch -->
          <label class="toggle-switch-label" :title="promo.isActive ? 'Turn Off' : 'Turn On'">
            <input
              type="checkbox"
              :checked="promo.isActive"
              @change="store.togglePromotionActive(promo.id)"
              class="toggle-checkbox"
            />
            <span class="toggle-slider"></span>
            <span class="toggle-text">{{ promo.isActive ? t('promo.statusActive') : t('promo.statusDisabled') }}</span>
          </label>

          <div class="action-buttons-group">
            <button class="icon-action-btn edit-btn" @click="openEditModal(promo)" :title="t('promo.edit')">
              <Edit3 :size="16" />
            </button>
            <button class="icon-action-btn delete-btn" @click="confirmDelete(promo)" :title="t('promo.delete')">
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state-card">
      <div class="empty-icon-wrap">
        <Sparkles :size="40" />
      </div>
      <h3>{{ locale === 'km' ? 'រកមិនឃើញប្រូម៉ូសិនទេ' : 'No promotions found' }}</h3>
      <p>{{ locale === 'km' ? 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬបង្កើតការផ្តល់ជូនថ្មី។' : 'Try adjusting your search filter or create a new promotion.' }}</p>
      <button class="btn btn-primary" @click="openCreateModal" style="margin-top: 1rem;">
        <Plus :size="16" />
        <span>{{ t('promo.create') }}</span>
      </button>
    </div>

    <!-- ==================== CREATE / EDIT PROMOTION MODAL ==================== -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-dialog promo-edit-modal">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <div class="modal-icon-badge">
              <Sparkles :size="20" />
            </div>
            <div>
              <h3 class="modal-title">{{ isEditing ? t('promo.edit') : t('promo.create') }}</h3>
              <p class="modal-subtitle">{{ locale === 'km' ? 'កំណត់លក្ខខណ្ឌ និងកាលបរិច្ឆេទប្រូម៉ូសិន' : 'Configure deal rules, discount, and date validity' }}</p>
            </div>
          </div>
          <button class="btn-close" @click="showModal = false">✕</button>
        </div>

        <form @submit.prevent="savePromotionForm" class="modal-body">
          <!-- Promotion Type Selection -->
          <div class="form-group">
            <label class="form-label">{{ t('promo.type') }} <span class="required">*</span></label>
            <div class="type-selection-grid">
              <label
                v-for="tOpt in typeOptions"
                :key="tOpt.value"
                class="type-option-card"
                :class="{ selected: form.type === tOpt.value }"
              >
                <input
                  type="radio"
                  name="promoType"
                  :value="tOpt.value"
                  v-model="form.type"
                  class="type-radio"
                />
                <div class="type-icon">{{ tOpt.icon }}</div>
                <div class="type-meta">
                  <div class="type-name">{{ tOpt.label }}</div>
                  <div class="type-desc">{{ tOpt.desc }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Bilingual Names -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">{{ t('promo.nameKm') }} <span class="required">*</span></label>
              <input
                v-model="form.nameKm"
                type="text"
                required
                placeholder="ឧ. ទិញ ១ ថែម ១ គ្រប់មុខ"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('promo.nameEn') }} <span class="required">*</span></label>
              <input
                v-model="form.nameEn"
                type="text"
                required
                placeholder="e.g. Buy 1 Get 1 All Drinks"
                class="form-control"
              />
            </div>
          </div>

          <!-- Badge & Discount Value (if applicable) -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">{{ t('promo.badge') }}</label>
              <input
                v-model="form.badge"
                type="text"
                placeholder="ឧ. 🎁 BOGO Deal"
                class="form-control"
              />
            </div>

            <div v-if="form.type === 'PERCENTAGE' || form.type === 'FIXED'" class="form-group">
              <label class="form-label">
                {{ t('promo.discountVal') }}
                <span v-if="form.type === 'PERCENTAGE'">(%)</span>
                <span v-else>($)</span>
                <span class="required">*</span>
              </label>
              <input
                v-model.number="form.discountValue"
                type="number"
                min="1"
                :max="form.type === 'PERCENTAGE' ? 100 : 1000"
                step="any"
                required
                placeholder="20"
                class="form-control"
              />
            </div>
          </div>

          <!-- Buy Quantity & Free Quantity Configuration (For BOGO / Buy X Get Y Deals) -->
          <div v-if="form.type === 'BOGO_ALL' || form.type === 'BOGO_CUSTOM' || form.type === 'BUY_2_GET_1'" class="form-row-2">
            <div class="form-group">
              <label class="form-label">
                {{ t('promo.buyQty') }}
                <span class="required">*</span>
              </label>
              <input
                v-model.number="form.buyQty"
                type="number"
                min="1"
                max="50"
                required
                placeholder="1"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                {{ t('promo.getQty') }}
                <span class="required">*</span>
              </label>
              <input
                v-model.number="form.getQty"
                type="number"
                min="1"
                max="50"
                required
                placeholder="1"
                class="form-control"
              />
            </div>
          </div>

          <!-- Target Categories (For Custom BOGO) -->
          <div v-if="form.type === 'BOGO_CUSTOM'" class="form-group">
            <label class="form-label">{{ t('promo.targetCategories') }}</label>
            <div class="categories-select-grid">
              <label
                v-for="cat in availableCategories"
                :key="cat"
                class="cat-select-label"
                :class="{ selected: form.eligibleCategories.includes(cat) }"
              >
                <input
                  type="checkbox"
                  :value="cat"
                  v-model="form.eligibleCategories"
                  class="cat-checkbox"
                />
                <span>{{ cat }}</span>
              </label>
            </div>
          </div>

          <!-- Date Validity Schedule -->
          <div class="schedule-form-section">
            <h4 class="section-subtitle">
              <Calendar :size="16" />
              <span>{{ t('promo.period') }}</span>
            </h4>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">{{ t('promo.startDate') }}</label>
                <input
                  v-model="form.startDate"
                  type="date"
                  class="form-control"
                />
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('promo.endDate') }}</label>
                <input
                  v-model="form.endDate"
                  type="date"
                  class="form-control"
                />
              </div>
            </div>
          </div>

          <!-- Bilingual Descriptions -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">{{ t('promo.descKm') }}</label>
              <textarea
                v-model="form.descKm"
                rows="2"
                placeholder="ឧ. ទិញ ១ កែវ ថែម ១ កែវ គ្រប់ភេសជ្ជៈ"
                class="form-control"
              ></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('promo.descEn') }}</label>
              <textarea
                v-model="form.descEn"
                rows="2"
                placeholder="e.g. Buy 1 drink, get 1 free on all menu items"
                class="form-control"
              ></textarea>
            </div>
          </div>

          <!-- Active Toggle -->
          <div class="form-group active-toggle-wrap">
            <label class="active-toggle-label">
              <input
                type="checkbox"
                v-model="form.isActive"
                class="toggle-checkbox"
              />
              <span class="toggle-slider"></span>
              <span class="form-label-bold">{{ t('promo.isActive') }}</span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">
              {{ locale === 'km' ? 'បោះបង់' : 'Cancel' }}
            </button>
            <button type="submit" class="btn btn-primary">
              <Check :size="16" />
              <span>{{ isEditing ? (locale === 'km' ? 'កែប្រែ' : 'Update') : (locale === 'km' ? 'បង្កើត' : 'Create') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import {
  Sparkles,
  Plus,
  RotateCcw,
  CheckCircle2,
  CalendarClock,
  AlertCircle,
  Search,
  Tag,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Check,
} from 'lucide-vue-next';
import {
  usePosStore,
  Promotion,
  PromotionType,
  PromotionStatus,
  getPromotionStatus,
} from '../stores/posStore';
import { useI18n } from '../i18n';

const store = usePosStore();
const { locale, t } = useI18n();

const searchQuery = ref('');
const selectedStatusFilter = ref<string>('ALL');
const showModal = ref(false);
const isEditing = ref(false);
const editingPromoId = ref<string | null>(null);

const availableCategories = [
  'Ice Coffee',
  'Hot Coffee',
  'Frappe & Blended',
  'Tea & Milk Tea',
  'Soda & Refreshers',
  'កាហ្វេទឹកកក',
  'កាហ្វេក្តៅ',
  'ក្រឡុក / ហ្វ្រាប៉េ',
  'តែ & តែទឹកដោះគោ',
  'សូដា & ភេសជ្ជៈស្រស់ថ្លា',
];

const form = reactive({
  type: 'BOGO_ALL' as PromotionType,
  nameEn: '',
  nameKm: '',
  badge: '🎁 BOGO All',
  descEn: '',
  descKm: '',
  isActive: true,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '2026-12-31',
  discountValue: 20,
  buyQty: 1,
  getQty: 1,
  eligibleCategories: [] as string[],
});

// KPI Calculations
const activeCount = computed(() =>
  store.promotions.filter((p) => getPromotionStatus(p) === 'ACTIVE').length
);

const upcomingCount = computed(() =>
  store.promotions.filter((p) => getPromotionStatus(p) === 'UPCOMING').length
);

const expiredCount = computed(() =>
  store.promotions.filter((p) => getPromotionStatus(p) === 'EXPIRED').length
);

const disabledCount = computed(() =>
  store.promotions.filter((p) => !p.isActive).length
);

const statusFilters = computed(() => [
  { key: 'ALL', label: locale.value === 'km' ? 'ទាំងអស់' : 'All', count: store.promotions.length },
  { key: 'ACTIVE', label: t('promo.statusActive'), count: activeCount.value },
  { key: 'UPCOMING', label: t('promo.statusUpcoming'), count: upcomingCount.value },
  { key: 'EXPIRED', label: t('promo.statusExpired'), count: expiredCount.value },
  { key: 'DISABLED', label: t('promo.statusDisabled'), count: disabledCount.value },
]);

const typeOptions = computed(() => [
  {
    value: 'BOGO_ALL' as PromotionType,
    icon: '🎁',
    label: t('promo.typeBogoAll'),
    desc: locale.value === 'km' ? 'ទិញ ១ កែវ ថែម ១ កែវដោយឥតគិតថ្លៃ គ្រប់មុខទំនិញ' : 'Buy 1 Get 1 free across all items',
  },
  {
    value: 'BOGO_CUSTOM' as PromotionType,
    icon: '☕',
    label: t('promo.typeBogoCustom'),
    desc: locale.value === 'km' ? 'ទិញ ១ ថែម ១ សម្រាប់តែមុខទំនិញ ឬប្រភេទដែលបានជ្រើសរើស' : 'Buy 1 Get 1 free on selected categories',
  },
  {
    value: 'BUY_2_GET_1' as PromotionType,
    icon: '🎉',
    label: t('promo.typeBuy2Get1'),
    desc: locale.value === 'km' ? 'ទិញ ២ កែវ ទទួលបាន ១ កែវដោយឥតគិតថ្លៃ' : 'Every 2 drinks purchased gets 3rd drink free',
  },
  {
    value: 'PERCENTAGE' as PromotionType,
    icon: '⚡',
    label: t('promo.typePercentage'),
    desc: locale.value === 'km' ? 'បញ្ចុះតម្លៃជាភាគរយលើវិក្កយបត្រសរុប (ឧ. 20% Off)' : 'Percentage discount on order bill',
  },
  {
    value: 'FIXED' as PromotionType,
    icon: '💵',
    label: t('promo.typeFixed'),
    desc: locale.value === 'km' ? 'បញ្ចុះតម្លៃជាទឹកប្រាក់ដុល្លារថេរ (ឧ. $2.00 Off)' : 'Fixed dollar discount deduction',
  },
]);

// Helper text formatters
const getPromoName = (promo: Promotion) =>
  locale.value === 'km' ? promo.name.km || promo.name.en : promo.name.en || promo.name.km;

const getPromoAltName = (promo: Promotion) =>
  locale.value === 'km' ? promo.name.en : promo.name.km;

const getPromoDesc = (promo: Promotion) =>
  locale.value === 'km' ? promo.description.km || promo.description.en : promo.description.en || promo.description.km;

const getTypeLabel = (type: PromotionType) => {
  if (type === 'BOGO_ALL') return t('promo.typeBogoAll');
  if (type === 'BOGO_CUSTOM') return t('promo.typeBogoCustom');
  if (type === 'BUY_2_GET_1') return t('promo.typeBuy2Get1');
  if (type === 'PERCENTAGE') return t('promo.typePercentage');
  if (type === 'FIXED') return t('promo.typeFixed');
  return type;
};

const getStatusLabel = (status: PromotionStatus) => {
  if (status === 'ACTIVE') return t('promo.statusActive');
  if (status === 'UPCOMING') return t('promo.statusUpcoming');
  if (status === 'EXPIRED') return t('promo.statusExpired');
  return t('promo.statusDisabled');
};

// Filtered Promotions
const filteredPromotions = computed(() => {
  let list = store.promotions;

  // 1. Status Filter
  if (selectedStatusFilter.value !== 'ALL') {
    if (selectedStatusFilter.value === 'DISABLED') {
      list = list.filter((p) => !p.isActive);
    } else {
      list = list.filter((p) => getPromotionStatus(p) === selectedStatusFilter.value);
    }
  }

  // 2. Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.en.toLowerCase().includes(q) ||
        p.name.km.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
    );
  }

  return list;
});

// Modal Actions
const openCreateModal = () => {
  isEditing.value = false;
  editingPromoId.value = null;
  form.type = 'BOGO_ALL';
  form.nameKm = '';
  form.nameEn = '';
  form.badge = '🎁 BOGO Deal';
  form.descKm = '';
  form.descEn = '';
  form.isActive = true;
  form.startDate = new Date().toISOString().slice(0, 10);
  form.endDate = '2026-12-31';
  form.discountValue = 20;
  form.buyQty = 1;
  form.getQty = 1;
  form.eligibleCategories = ['Ice Coffee', 'Tea & Milk Tea'];
  showModal.value = true;
};

const openEditModal = (promo: Promotion) => {
  isEditing.value = true;
  editingPromoId.value = promo.id;
  form.type = promo.type;
  form.nameKm = promo.name.km;
  form.nameEn = promo.name.en;
  form.badge = promo.badge;
  form.descKm = promo.description.km;
  form.descEn = promo.description.en;
  form.isActive = promo.isActive;
  form.startDate = promo.startDate || '';
  form.endDate = promo.endDate || '';
  form.discountValue = promo.discountValue || 20;
  form.buyQty = promo.buyQty || (promo.type === 'BUY_2_GET_1' ? 2 : 1);
  form.getQty = promo.getQty || 1;
  form.eligibleCategories = promo.eligibleCategories ? [...promo.eligibleCategories] : [];
  showModal.value = true;
};

const savePromotionForm = () => {
  const promoData: Promotion = {
    id: isEditing.value && editingPromoId.value ? editingPromoId.value : `promo_${Date.now()}`,
    name: {
      en: form.nameEn.trim(),
      km: form.nameKm.trim(),
    },
    type: form.type,
    badge: form.badge.trim() || '🎁 Deal',
    description: {
      en: form.descEn.trim(),
      km: form.descKm.trim(),
    },
    isActive: form.isActive,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    buyQty: form.type === 'BOGO_ALL' || form.type === 'BOGO_CUSTOM' || form.type === 'BUY_2_GET_1' ? form.buyQty : undefined,
    getQty: form.type === 'BOGO_ALL' || form.type === 'BOGO_CUSTOM' || form.type === 'BUY_2_GET_1' ? form.getQty : undefined,
    discountValue: form.type === 'PERCENTAGE' || form.type === 'FIXED' ? form.discountValue : undefined,
    eligibleCategories: form.type === 'BOGO_CUSTOM' ? form.eligibleCategories : undefined,
  };

  if (isEditing.value) {
    store.updatePromotion(promoData);
  } else {
    store.addPromotion(promoData);
  }

  showModal.value = false;
};

const confirmDelete = (promo: Promotion) => {
  const name = getPromoName(promo);
  if (confirm(`${t('promo.deleteConfirm')}\n\n"${name}"`)) {
    store.deletePromotion(promo.id);
  }
};

const handleResetDefaults = () => {
  if (confirm(t('promo.resetConfirm'))) {
    store.resetPromotions();
  }
};
</script>

<style scoped>
.promotions-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 3rem;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--gray-900);
  margin: 0;
}

.admin-badge {
  background: #ede9fe;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  text-transform: uppercase;
}

.page-subtitle {
  font-size: 0.88rem;
  color: var(--gray-500);
  margin: 0.35rem 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.kpi-card {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 14px;
  padding: 1.15rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.kpi-icon-wrap {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-blue {
  background: #eff6ff;
  color: #2563eb;
}

.bg-emerald {
  background: #ecfdf5;
  color: #059669;
}

.bg-amber {
  background: #fffbeb;
  color: #d97706;
}

.bg-rose {
  background: #fff1f2;
  color: #e11d48;
}

.kpi-meta {
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--gray-500);
}

.kpi-value-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.kpi-value {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--gray-900);
}

.text-emerald {
  color: #059669;
}

.text-amber {
  color: #d97706;
}

.text-rose {
  color: #e11d48;
}

.live-dot-pulse {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

/* Toolbar */
.toolbar-card {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 14px;
  padding: 0.85rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
}

.search-input {
  width: 100%;
  padding: 0.6rem 2.2rem 0.6rem 2.5rem;
  border: 1px solid var(--gray-300);
  border-radius: 10px;
  font-size: 0.88rem;
  outline: none;
  background: var(--gray-50);
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--primary);
  background: var(--white);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.clear-search-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  font-weight: 700;
}

.filter-tabs {
  display: flex;
  background: var(--gray-100);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--gray-300);
  gap: 2px;
  overflow-x: auto;
}

.filter-tab-btn {
  border: none;
  background: transparent;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-tab-btn:hover {
  color: var(--gray-900);
}

.filter-tab-btn.active {
  background: var(--white);
  color: var(--primary);
  font-weight: 700;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.tab-badge {
  font-size: 0.7rem;
  background: var(--gray-200);
  padding: 0.1rem 0.35rem;
  border-radius: 6px;
  font-weight: 700;
}

.filter-tab-btn.active .tab-badge {
  background: rgba(79, 70, 229, 0.12);
  color: var(--primary);
}

/* Promotions Grid */
.promo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.promo-card {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.promo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  border-color: var(--primary-light);
}

.promo-card.is-active {
  border-top: 4px solid #10b981;
}

.promo-card.is-upcoming {
  border-top: 4px solid #f59e0b;
}

.promo-card.is-expired {
  border-top: 4px solid #f43f5e;
  opacity: 0.85;
}

.promo-card.is-disabled {
  border-top: 4px solid #94a3b8;
  background: #fafafa;
  opacity: 0.75;
}

/* Card Top Bar */
.card-top-bar {
  padding: 1rem 1.25rem 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.promo-badge-pill {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--gray-900);
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
}

.status-indicator-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
}

.status-indicator-pill.active {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.status-indicator-pill.upcoming {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.status-indicator-pill.expired {
  background: #fff1f2;
  color: #e11d48;
  border: 1px solid #fecdd3;
}

.status-indicator-pill.disabled {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #cbd5e1;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* Card Body */
.card-content {
  padding: 0.5rem 1.25rem 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.promo-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--gray-900);
  margin: 0;
  line-height: 1.25;
}

.promo-sub-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray-400);
  margin: -0.4rem 0 0;
}

.promo-desc {
  font-size: 0.82rem;
  color: var(--gray-600);
  line-height: 1.4;
  margin: 0;
}

.promo-type-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.type-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #f3f4f6;
  color: var(--gray-700);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.discount-tag {
  background: #eff6ff;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}

.categories-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.78rem;
}

.cat-label {
  color: var(--gray-500);
  font-weight: 600;
}

.cat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.cat-chip {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}

.schedule-box {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.schedule-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.sched-icon {
  color: var(--gray-400);
  flex-shrink: 0;
}

.sched-dates {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--gray-700);
}

.sched-label {
  color: var(--gray-400);
}

/* Card Actions Footer */
.card-actions-bar {
  padding: 0.75rem 1.25rem;
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

/* Toggle Switch */
.toggle-switch-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.toggle-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  width: 36px;
  height: 20px;
  background: #cbd5e1;
  border-radius: 20px;
  position: relative;
  transition: all 0.2s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: white;
  top: 3px;
  left: 3px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-checkbox:checked + .toggle-slider {
  background: #10b981;
}

.toggle-checkbox:checked + .toggle-slider::before {
  transform: translateX(16px);
}

.toggle-text {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--gray-700);
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.icon-action-btn {
  border: 1px solid var(--gray-300);
  background: var(--white);
  color: var(--gray-600);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-action-btn:hover {
  border-color: var(--gray-400);
  color: var(--gray-900);
}

.icon-action-btn.edit-btn:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #2563eb;
}

.icon-action-btn.delete-btn:hover {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #e11d48;
}

/* Empty State */
.empty-state-card {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.empty-state-card h3 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gray-800);
  margin: 0;
}

.empty-state-card p {
  font-size: 0.88rem;
  color: var(--gray-500);
  margin: 0.35rem 0 0;
}

/* Modal Dialog */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.promo-edit-modal {
  background: var(--white);
  border-radius: 20px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modal-icon-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #ede9fe;
  color: #6d28d9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gray-900);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.78rem;
  color: var(--gray-500);
  margin: 0.15rem 0 0;
}

.btn-close {
  border: none;
  background: var(--gray-100);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  color: var(--gray-500);
  font-weight: 700;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: var(--gray-200);
  color: var(--gray-900);
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--gray-700);
}

.form-label-bold {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--gray-900);
}

.required {
  color: #e11d48;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--gray-300);
  border-radius: 10px;
  font-size: 0.88rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

/* Type Grid */
.type-selection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}

.type-option-card {
  border: 1.5px solid var(--gray-300);
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--gray-50);
}

.type-option-card:hover {
  border-color: var(--primary-light);
  background: var(--white);
}

.type-option-card.selected {
  border-color: var(--primary);
  background: #f5f3ff;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.12);
}

.type-radio {
  margin-top: 0.2rem;
}

.type-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.type-meta {
  display: flex;
  flex-direction: column;
}

.type-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--gray-900);
}

.type-desc {
  font-size: 0.72rem;
  color: var(--gray-500);
  line-height: 1.3;
}

/* Categories selector */
.categories-select-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cat-select-label {
  border: 1px solid var(--gray-300);
  background: var(--gray-50);
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--gray-700);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cat-select-label.selected {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.schedule-form-section {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-subtitle {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.active-toggle-wrap {
  background: var(--gray-100);
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.active-toggle-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gray-200);
}

@media (max-width: 768px) {
  .form-row-2,
  .type-selection-grid {
    grid-template-columns: 1fr;
  }
}
</style>
