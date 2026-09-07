<template>
  <div class="app-root-layout" :class="{ 'is-admin': isAdmin, 'is-seller': isSeller }">
    <!-- 1. Admin Left Sidebar Layout -->
    <template v-if="isAdmin">
      <div class="admin-app-layout">
        <AdminSidebar />
        <div class="admin-main-viewport">
          <AdminHeader />
          <main class="page-wrapper admin-page-wrapper">
            <router-view />
          </main>
        </div>
      </div>
    </template>

    <!-- 2. Seller Current Top Navbar Layout -->
    <template v-else>
      <div class="seller-app-layout">
        <Navbar />
        <main class="page-wrapper seller-page-wrapper">
          <router-view />
        </main>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth';
import Navbar from './components/Navbar.vue';
import AdminSidebar from './components/AdminSidebar.vue';
import AdminHeader from './components/AdminHeader.vue';

const { isAdmin, isSeller } = useAuth();
</script>

<style scoped>
.app-root-layout {
  min-height: 100vh;
  width: 100%;
}

.admin-app-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #f1f5f9;
}

.admin-main-viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  min-width: 0;
}

.admin-page-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: #f8fafc;
}

.seller-app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.seller-page-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 0;
}
</style>
