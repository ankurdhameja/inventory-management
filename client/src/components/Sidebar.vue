<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <div class="sidebar-header">
      <div class="logo">
        <h1 class="logo-title">{{ t('nav.companyName') }}</h1>
        <span v-if="!isCollapsed" class="subtitle">{{ t('nav.subtitle') }}</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navigation"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        active-class="nav-item--active"
        :title="t(item.labelKey)"
      >
        <span class="nav-icon">
          <svg
            v-if="item.icon === 'home'"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M4 11L12 4L20 11" />
            <path d="M6 10V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V10" />
            <path d="M10 20V14H14V20" />
          </svg>
          <svg
            v-else-if="item.icon === 'box'"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M4 8L12 4L20 8V16L12 20L4 16V8Z" />
            <path d="M4 8L12 12L20 8" />
            <path d="M12 12V20" />
          </svg>
          <svg
            v-else-if="item.icon === 'cart'"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M3 4H5L7.5 15H18L20 7H6.5" />
            <circle cx="9" cy="19" r="1.4" />
            <circle cx="17" cy="19" r="1.4" />
          </svg>
          <svg
            v-else-if="item.icon === 'dollar'"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" />
            <path d="M12 5.5V7" />
            <path d="M12 17V18.5" />
          </svg>
          <svg
            v-else-if="item.icon === 'trending-up'"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M4 17L10 11L14 15L20 8" />
            <path d="M14 8H20V14" />
          </svg>
          <svg
            v-else-if="item.icon === 'bar-chart'"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M5 20V12" />
            <path d="M12 20V4" />
            <path d="M19 20V15" />
          </svg>
        </span>
        <span v-if="!isCollapsed" class="nav-label">{{ t(item.labelKey) }}</span>
      </router-link>
    </nav>

    <button
      class="collapse-toggle"
      type="button"
      :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      @click="toggleSidebar"
    >
      <svg
        width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        :class="{ 'collapse-toggle-icon--flipped': isCollapsed }"
      >
        <path d="M10 3L5 8L10 13" />
      </svg>
    </button>

    <div class="sidebar-footer">
      <LanguageSwitcher />
      <ProfileMenu
        @show-profile-details="$emit('show-profile-details')"
        @show-tasks="$emit('show-tasks')"
      />
    </div>
  </aside>
</template>

<script setup>
import { useI18n } from '../composables/useI18n'
import { useSidebar } from '../composables/useSidebar'
import { navigation } from '../config/navigation.js'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ProfileMenu from './ProfileMenu.vue'

defineEmits(['show-profile-details', 'show-tasks'])

const { t } = useI18n()
const { isCollapsed, toggleSidebar } = useSidebar()
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  height: 100vh;
  position: sticky;
  top: 0;
  background: var(--color-sidebar-bg);
  border-right: 1px solid var(--color-sidebar-border);
  transition: width 0.2s ease;
}

.sidebar--collapsed {
  width: var(--sidebar-width-collapsed);
}

.sidebar-header {
  padding: var(--space-5) var(--space-4);
  border-bottom: 1px solid var(--color-sidebar-border);
}

.logo {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
}

.logo-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-sidebar-text-active);
  letter-spacing: -0.025em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subtitle {
  font-size: var(--text-xs);
  color: var(--color-sidebar-text);
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-3);
  overflow-y: auto;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-sidebar-text);
  text-decoration: none;
  font-weight: 500;
  font-size: var(--text-sm);
  transition: background-color 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}

.sidebar--collapsed .nav-item {
  justify-content: center;
}

.nav-item:hover {
  color: var(--color-sidebar-text-active);
  background: rgba(255, 255, 255, 0.06);
}

.nav-item--active {
  color: var(--color-sidebar-text-active);
  background: var(--color-sidebar-active-bg);
}

.nav-item--active::before {
  content: '';
  position: absolute;
  left: calc(-1 * var(--space-3));
  top: var(--space-2);
  bottom: var(--space-2);
  width: 3px;
  border-radius: var(--radius-full);
  background: var(--color-sidebar-active-bar);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 var(--space-3) var(--space-3);
  padding: var(--space-2);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--color-sidebar-border);
  border-radius: var(--radius-md);
  color: var(--color-sidebar-text);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.collapse-toggle:hover {
  color: var(--color-sidebar-text-active);
  background: rgba(255, 255, 255, 0.12);
}

.collapse-toggle-icon--flipped {
  transform: rotate(180deg);
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border-top: 1px solid var(--color-sidebar-border);
}

.sidebar--collapsed .sidebar-footer {
  align-items: center;
}

@media (max-width: 1024px) {
  .sidebar {
    width: var(--sidebar-width-collapsed);
  }
  .sidebar .subtitle,
  .sidebar .nav-label {
    display: none;
  }
  .sidebar .nav-item {
    justify-content: center;
  }
  .sidebar .collapse-toggle {
    display: none;
  }
}
</style>
