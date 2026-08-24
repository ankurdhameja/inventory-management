import { ref } from 'vue'

// Shared sidebar collapsed state (singleton pattern)
const isCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true')

export function useSidebar() {
  // Flip collapsed state and persist to localStorage
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('sidebar-collapsed', isCollapsed.value)
  }

  return {
    isCollapsed,
    toggleSidebar
  }
}
