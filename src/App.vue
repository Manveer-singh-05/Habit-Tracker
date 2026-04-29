<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="route-fade">
      <component :is="Component" :key="route.fullPath" />
    </Transition>
  </router-view>
</template>

<script setup>
import { onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

function isAuthPath(path) {
  return path === '/login' || path === '/signup'
}

watch(
  () => route.path,
  (path) => {
    document.body.classList.toggle('auth-route', isAuthPath(path))
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.classList.remove('auth-route')
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.route-fade-enter-active,
.route-fade-leave-active {
  transition: transform 0.2s ease;
}

.route-fade-enter-from,
.route-fade-leave-to {
  transform: translateY(6px);
}

.route-fade-enter-to,
.route-fade-leave-from {
  transform: translateY(0);
}

body.auth-route {
  background: #0b1320;
}
</style>
