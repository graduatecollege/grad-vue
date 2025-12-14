<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <main class="app-main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f3f4f6;
}

.app {
  min-height: 100vh;
}

.app-main {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
</style>
