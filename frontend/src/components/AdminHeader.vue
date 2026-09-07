<template>
  <header class="admin-header">
    <div class="header-left">
      <div class="breadcrumb-trail">
        <span class="breadcrumb-root">{{ t('admin.backoffice') }}</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ currentRouteTitle }}</span>
      </div>
    </div>

    <div class="header-right">
      <!-- Role Indicator Badge -->
      <div class="admin-user-pill">
        <div class="avatar-circle">👑</div>
        <div class="admin-user-meta">
          <span class="admin-name">{{ t('nav.roleAdmin') }}</span>
          <span class="admin-scope">{{ t('nav.adminBadge') }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from '../i18n';

const route = useRoute();
const { t } = useI18n();

const currentRouteTitle = computed(() => {
  const path = route.path;
  if (path === '/dashboard') return t('nav.dashboard');
  if (path === '/products') return t('nav.products');
  if (path === '/ingredients') return t('nav.ingredients');
  if (path === '/promotions') return t('nav.promotions');
  return (route.meta?.title as string) || '';
});
</script>

<style scoped>
.admin-header {
  height: 64px;
  background: var(--white);
  border-bottom: 1px solid var(--gray-300);
  padding: 0 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.breadcrumb-trail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
}

.breadcrumb-root {
  color: var(--gray-500);
  font-weight: 600;
}

.breadcrumb-sep {
  color: var(--gray-400);
}

.breadcrumb-current {
  color: var(--gray-900);
  font-weight: 800;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-user-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.3rem 0.65rem;
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 20px;
}

.avatar-circle {
  width: 28px;
  height: 28px;
  background: #F7EFE8;
  border: 1px solid #DEAC76;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
}

.admin-user-meta {
  display: flex;
  flex-direction: column;
}

.admin-name {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--gray-900);
  line-height: 1.1;
}

.admin-scope {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--primary);
}
</style>
