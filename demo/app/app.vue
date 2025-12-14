<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <header class="app-header">
      <div class="app-header__container">
        <h1 class="app-header__title">Grad-Vue Component Library</h1>
        <p class="app-header__subtitle">Demo & Documentation</p>
      </div>
    </header>
    
    <div class="app-layout">
      <nav class="app-nav">
        <ul class="app-nav__list">
          <li><NuxtLink to="/" class="app-nav__link">Home</NuxtLink></li>
          <li><NuxtLink to="/button" class="app-nav__link">GButton</NuxtLink></li>
          <li><NuxtLink to="/text-input" class="app-nav__link">GTextInput</NuxtLink></li>
          <li><NuxtLink to="/select" class="app-nav__link">GSelect</NuxtLink></li>
          <li><NuxtLink to="/select-button" class="app-nav__link">GSelectButton</NuxtLink></li>
          <li><NuxtLink to="/search" class="app-nav__link">GSearch</NuxtLink></li>
          <li><NuxtLink to="/progress" class="app-nav__link">GProgress</NuxtLink></li>
          <li><NuxtLink to="/popover" class="app-nav__link">GPopover</NuxtLink></li>
          <li><NuxtLink to="/alert-dialog" class="app-nav__link">GAlertDialog</NuxtLink></li>
          <li><NuxtLink to="/app-header" class="app-nav__link">GAppHeader</NuxtLink></li>
        </ul>
      </nav>
      
      <main class="app-main">
        <NuxtPage />
      </main>
    </div>
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
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #1f2937;
  color: white;
  padding: 2rem 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.app-header__container {
  max-width: 1400px;
  margin: 0 auto;
}

.app-header__title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.app-header__subtitle {
  margin: 0;
  font-size: 1.125rem;
  color: #d1d5db;
}

.app-layout {
  display: flex;
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.app-nav {
  width: 250px;
  background: white;
  padding: 1.5rem 0;
  box-shadow: 1px 0 3px 0 rgba(0, 0, 0, 0.1);
}

.app-nav__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-nav__list li {
  margin: 0;
}

.app-nav__link {
  display: block;
  padding: 0.75rem 1.5rem;
  color: #374151;
  text-decoration: none;
  transition: all 0.2s;
}

.app-nav__link:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.app-nav__link.router-link-active {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
  border-left: 3px solid #1e40af;
  padding-left: calc(1.5rem - 3px);
}

.app-main {
  flex: 1;
  padding: 2rem;
}
</style>
