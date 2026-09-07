<template>
  <header class="header-nav">
    <div class="brand-logo">
      <img :src="logoIcon" alt="តស់កាហ្វេ TOS CAFE" class="logo-badge-img" />
      <div>
        <div class="brand-name">
          <span class="kh-name">តស់កាហ្វេ</span>
          <span class="en-name">TOS CAFE</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--gray-500); font-weight: 500;">{{ t('nav.brandSubtitle') }}</div>
      </div>
    </div>

    <nav class="nav-links">
      <router-link to="/" class="nav-item">
        <LayoutGrid :size="18" />
        <span>{{ t('nav.pos') }}</span>
      </router-link>
      <template v-if="isAdmin">
        <router-link to="/products" class="nav-item">
          <Coffee :size="18" />
          <span>{{ t('nav.products') }}</span>
        </router-link>
        <router-link to="/ingredients" class="nav-item">
          <Boxes :size="18" />
          <span>{{ t('nav.ingredients') }}</span>
        </router-link>
      </template>
      <router-link to="/dashboard" class="nav-item">
        <TrendingUp :size="18" />
        <span>{{ isAdmin ? t('nav.dashboard') : t('dash.sellerTab') }}</span>
      </router-link>
    </nav>

    <div class="header-right">
      <!-- Role Switcher (Admin / Seller) -->
      <div class="role-switch-wrap">
        <button
          class="role-btn admin"
          :class="{ active: isAdmin }"
          @click="handleRoleChange('admin')"
          :title="t('nav.adminBadge')"
        >
          <ShieldCheck :size="14" />
          <span>{{ t('nav.roleAdmin') }}</span>
        </button>
        <button
          class="role-btn seller"
          :class="{ active: isSeller }"
          @click="handleRoleChange('seller')"
          :title="t('nav.sellerBadge')"
        >
          <ShoppingBag :size="14" />
          <span>{{ t('nav.roleSeller') }}</span>
        </button>
      </div>

      <!-- Language Switcher Button -->
      <div class="lang-switch-wrap">
        <button
          class="lang-btn"
          :class="{ active: locale === 'km' }"
          @click="setLocale('km')"
          title="ប្តូរទៅជាភាសាខ្មែរ"
        >
          🇰🇭 ខ្មែរ
        </button>
        <button
          class="lang-btn"
          :class="{ active: locale === 'en' }"
          @click="setLocale('en')"
          title="Switch to English"
        >
          🇬🇧 EN
        </button>
      </div>

      <!-- Fullscreen Mode Toggle -->
      <button
        class="fullscreen-btn"
        @click="toggleFullscreen"
        :title="isFullscreen ? 'Exit Fullscreen' : 'Full Screen POS Mode'"
        type="button"
      >
        <Minimize :size="15" v-if="isFullscreen" />
        <Maximize :size="15" v-else />
        <span>{{ isFullscreen ? 'Normal' : 'Full Screen' }}</span>
      </button>

      <!-- Backend Connection Status -->
      <div class="system-status">
        <div class="status-indicator" :class="{ online: isOnline }"></div>
        <span class="status-text">{{ isOnline ? t('nav.connected') : t('nav.connecting') }}</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { LayoutGrid, Coffee, Boxes, TrendingUp, ShieldCheck, ShoppingBag, Maximize, Minimize } from 'lucide-vue-next';
import { posApi } from '../services/api';
import { useI18n } from '../i18n';
import { useAuth, UserRole } from '../composables/useAuth';
import logoIcon from '../assets/logo-icon.jpg';

const router = useRouter();
const route = useRoute();
const { locale, setLocale, t } = useI18n();
const { isAdmin, isSeller, setRole } = useAuth();
const isOnline = ref(false);
const isFullscreen = ref(false);

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true;
    }).catch((err) => {
      console.error('Fullscreen request failed:', err);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        isFullscreen.value = false;
      });
    }
  }
};

const handleRoleChange = (newRole: UserRole) => {
  setRole(newRole);
  if (newRole === 'admin') {
    router.push('/dashboard');
  } else if (newRole === 'seller' && (route.path === '/products' || route.path === '/ingredients')) {
    router.push('/');
  }
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
.logo-badge-img {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 12px;
  border: 1.5px solid var(--gray-200);
  box-shadow: var(--shadow-xs);
  background: #ffffff;
}

.brand-name {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.kh-name {
  font-weight: 800;
  font-size: 1.15rem;
  line-height: 1.2;
  color: var(--gray-900);
}

.en-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.role-switch-wrap {
  display: flex;
  background: var(--gray-100);
  padding: 3px;
  border-radius: var(--border-radius-full);
  border: 1px solid var(--gray-200);
}

.role-btn {
  border: none;
  background: transparent;
  padding: 0.32rem 0.75rem;
  border-radius: var(--border-radius-full);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.role-btn:hover {
  color: var(--gray-900);
}

.role-btn.active.admin {
  background: var(--dark);
  color: var(--white);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.2);
}

.role-btn.active.seller {
  background: linear-gradient(135deg, #794022 0%, #591F0B 100%);
  color: var(--white);
  box-shadow: 0 2px 8px rgba(121, 64, 34, 0.28);
}

.lang-switch-wrap {
  display: flex;
  background: var(--gray-100);
  padding: 3px;
  border-radius: var(--border-radius-full);
  border: 1px solid var(--gray-200);
}

.lang-btn {
  border: none;
  background: transparent;
  padding: 0.32rem 0.65rem;
  border-radius: var(--border-radius-full);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.lang-btn:hover {
  color: var(--gray-900);
}

.lang-btn.active {
  background: var(--white);
  color: var(--primary);
  box-shadow: var(--shadow-xs);
}

.system-status {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--gray-700);
  background: var(--white);
  padding: 0.38rem 0.8rem;
  border-radius: var(--border-radius-full);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-xs);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--warning);
  transition: background-color 0.3s ease;
}

.status-indicator.online {
  background-color: #2D6A4F;
  box-shadow: 0 0 6px rgba(45, 106, 79, 0.4);
}

.fullscreen-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.38rem 0.75rem;
  border-radius: var(--border-radius-full);
  border: 1px solid var(--gray-200);
  background: var(--white);
  color: var(--gray-700);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-xs);
  transition: all 0.2s ease;
}

.fullscreen-btn:hover {
  background: #FAF7F2;
  border-color: #DEAC76;
  color: #794022;
}
</style>
