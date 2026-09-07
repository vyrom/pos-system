<template>
  <aside class="admin-sidebar">
    <!-- Brand Header -->
    <div class="sidebar-brand">
      <div class="brand-logo-wrap">
        <img :src="logoIcon" alt="តស់កាហ្វេ TOS CAFE" class="admin-brand-logo" />
        <div class="brand-titles">
          <div class="shop-name-kh">តស់កាហ្វេ</div>
          <div class="shop-name-en">TOS CAFE</div>
        </div>
      </div>
      <div class="admin-role-badge">
        <ShieldCheck :size="13" />
        <span>{{ t('admin.backoffice') }}</span>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <div class="nav-section-label">{{ t('admin.mainMenu') }}</div>
      <router-link to="/dashboard" class="sidebar-link">
        <TrendingUp :size="18" class="link-icon" />
        <span class="link-text">{{ t('nav.dashboard') }}</span>
      </router-link>
      <router-link to="/reports" class="sidebar-link">
        <BarChart3 :size="18" class="link-icon" />
        <span class="link-text">{{ t('nav.reports') }}</span>
      </router-link>
      <router-link to="/expenses" class="sidebar-link">
        <Receipt :size="18" class="link-icon" />
        <span class="link-text">{{ t('nav.expenses') }}</span>
      </router-link>

      <div class="nav-section-label">{{ t('admin.storeMgmt') }}</div>
      <router-link to="/products" class="sidebar-link">
        <Coffee :size="18" class="link-icon" />
        <span class="link-text">{{ t('nav.products') }}</span>
      </router-link>
      <router-link to="/ingredients" class="sidebar-link">
        <Boxes :size="18" class="link-icon" />
        <span class="link-text">{{ t('nav.ingredients') }}</span>
      </router-link>
      <router-link to="/promotions" class="sidebar-link">
        <Sparkles :size="18" class="link-icon" />
        <span class="link-text">{{ t('nav.promotions') }}</span>
      </router-link>
    </nav>

    <!-- Bottom Footer Area -->
    <div class="sidebar-footer">
      <!-- Switch to Cashier Mode Button -->
      <button class="switch-seller-btn" @click="switchToSeller" type="button">
        <User :size="15" />
        <span>{{ t('admin.switchSeller') }}</span>
      </button>

      <!-- Language Switcher -->
      <div class="sidebar-lang-switch">
        <button
          class="lang-pill"
          :class="{ active: locale === 'km' }"
          @click="setLocale('km')"
          type="button"
        >
          🇰🇭 ខ្មែរ
        </button>
        <button
          class="lang-pill"
          :class="{ active: locale === 'en' }"
          @click="setLocale('en')"
          type="button"
        >
          🇬🇧 EN
        </button>
      </div>

      <!-- Backend Connection Status -->
      <div class="sidebar-status">
        <div class="status-dot" :class="{ online: isOnline }"></div>
        <span class="status-label">{{ isOnline ? t('admin.systemOnline') : t('nav.connecting') }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  TrendingUp,
  BarChart3,
  Receipt,
  Coffee,
  Boxes,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-vue-next';
import { posApi } from '../services/api';
import { useI18n } from '../i18n';
import { useAuth } from '../composables/useAuth';
import logoIcon from '../assets/logo-icon.jpg';

const router = useRouter();
const { locale, setLocale, t } = useI18n();
const { setRole } = useAuth();
const isOnline = ref(false);

const switchToSeller = () => {
  setRole('seller');
  router.push('/');
};

const checkHealth = async () => {
  try {
    const res = await posApi.getHealth();
    isOnline.value = res.status === 'ok';
  } catch (err) {
    isOnline.value = false;
  }
};

onMounted(() => {
  checkHealth();
  setInterval(checkHealth, 10000);
});
</script>

<style scoped>
.admin-sidebar {
  width: var(--sidebar-width, 260px);
  min-width: var(--sidebar-width, 260px);
  height: 100vh;
  background: #0f172a; /* Dark Navy Executive Theme */
  color: #f8fafc;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #1e293b;
  flex-shrink: 0;
  z-index: 50;
}

/* Brand Header */
.sidebar-brand {
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.brand-logo-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.admin-brand-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  background: #ffffff;
  border: 2px solid #334155;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.brand-titles {
  display: flex;
  flex-direction: column;
}

.shop-name-kh {
  font-weight: 800;
  font-size: 1.15rem;
  color: #ffffff;
  line-height: 1.15;
}

.shop-name-en {
  font-size: 0.78rem;
  font-weight: 800;
  color: #DEAC76;
  letter-spacing: 0.5px;
}

.admin-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(222, 172, 118, 0.15);
  border: 1px solid rgba(222, 172, 118, 0.35);
  color: #DEAC76;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

/* Navigation Links */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-section-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 0.75rem 0.75rem 0.25rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.sidebar-link.router-link-active {
  background: var(--primary);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.link-icon {
  flex-shrink: 0;
}

.link-text {
  flex: 1;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1rem 0.85rem;
  border-top: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: #0b1120;
}

.switch-seller-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.switch-seller-btn:hover {
  background: var(--success);
  border-color: var(--success-dark);
  color: #ffffff;
}

.sidebar-lang-switch {
  display: flex;
  background: #1e293b;
  padding: 2px;
  border-radius: 16px;
}

.lang-pill {
  flex: 1;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-pill.active {
  background: var(--primary);
  color: #ffffff;
}

.sidebar-status {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.72rem;
  color: #64748b;
  padding: 0 0.25rem;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f59e0b;
}

.status-dot.online {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}
</style>
