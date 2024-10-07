<template>
    <aside class="w-64 h-screen bg-white shadow-md">
      <div class="p-4 flex items-center space-x-2">
        <svg class="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
        <h1 class="text-xl font-semibold text-gray-800">Muse Dashboard</h1>
      </div>
  
      <nav class="mt-6">
        <div class="px-4 py-2">
          <div @click="toggleDashboards" class="flex items-center justify-between p-2 bg-blue-500 text-white rounded-md cursor-pointer">
            <div class="flex items-center space-x-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              <span class="font-medium">Dashboards</span>
            </div>
            <svg :class="{ 'transform rotate-180': dashboardsOpen }" class="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <div v-if="dashboardsOpen" class="mt-2 ml-4 space-y-2">
            <div class="flex items-center space-x-2 text-gray-700 hover:text-blue-500">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Default</span>
            </div>
            <div class="flex items-center space-x-2 text-gray-500 hover:text-blue-500">
              <div class="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span>CRM</span>
            </div>
          </div>
        </div>
  
        <div class="mt-6">
          <h2 class="px-4 text-xs font-semibold text-gray-500 uppercase">PAGES</h2>
          <div class="mt-2 space-y-2">
            <div v-for="(item, index) in pages" :key="index" class="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer">
              <div class="flex items-center space-x-2">
                <component :is="item.icon" class="w-5 h-5 text-gray-500" />
                <span class="text-gray-700">{{ item.name }}</span>
              </div>
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>
        </div>
  
        <div class="mt-6">
          <h2 class="px-4 text-xs font-semibold text-gray-500 uppercase">DOCS</h2>
          <div class="mt-2 space-y-2">
            <div v-for="(item, index) in docs" :key="index" class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
              <component :is="item.icon" class="w-5 h-5 text-gray-500" />
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const dashboardsOpen = ref(true)
  
  const toggleDashboards = () => {
    dashboardsOpen.value = !dashboardsOpen.value
  }
  
  const pages = [
    { name: 'Pages', icon: 'DocumentIcon' },
    { name: 'Applications', icon: 'ViewGridIcon' },
    { name: 'Ecommerce', icon: 'CurrencyDollarIcon' },
    { name: 'Authentication', icon: 'LockClosedIcon' },
  ]
  
  const docs = [
    { name: 'Getting Started', icon: 'BookOpenIcon' },
    { name: 'Components', icon: 'PuzzleIcon' },
    { name: 'Changelog', icon: 'ClipboardListIcon' },
  ]
  </script>
  
