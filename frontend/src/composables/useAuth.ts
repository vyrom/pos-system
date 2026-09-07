import { ref, computed } from 'vue';

export type UserRole = 'admin' | 'seller';

const ROLE_STORAGE_KEY = 'pos_user_role';

const currentRole = ref<UserRole>(
  (typeof localStorage !== 'undefined' && (localStorage.getItem(ROLE_STORAGE_KEY) as UserRole)) || 'admin'
);

export function useAuth() {
  const role = computed(() => currentRole.value);
  const isAdmin = computed(() => currentRole.value === 'admin');
  const isSeller = computed(() => currentRole.value === 'seller');

  const setRole = (newRole: UserRole) => {
    currentRole.value = newRole;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(ROLE_STORAGE_KEY, newRole);
      } catch (e) {
        console.error('Failed to save role to localStorage', e);
      }
    }
  };

  const toggleRole = () => {
    setRole(currentRole.value === 'admin' ? 'seller' : 'admin');
  };

  return {
    role,
    isAdmin,
    isSeller,
    setRole,
    toggleRole,
  };
}
