<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <main class="app-main">
      <div class="demo-page">
        <div class="demo-page__intro">
          <h1>Grad-Vue Component Library</h1>
          <p class="demo-page__description">
            Interactive demos showcasing all components available in the Grad-Vue library.
            Scroll down to explore each component with customizable props and live examples.
          </p>
        </div>

        <GButtonDemo />
        <GTextInputDemo />
        <GSelectDemo />
        <GSelectButtonDemo />
        <GSearchDemo />
        <GProgressDemo />
        <GPopoverDemo />
        <GAlertDialogDemo />
        <GAppHeaderDemo />
      </div>
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

.demo-page {
  max-width: 1200px;
  margin: 0 auto;
}

.demo-page__intro {
  margin-bottom: 3rem;
}

.demo-page__intro h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  color: #1f2937;
}

.demo-page__description {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #4b5563;
  margin: 0;
}

.demo-section {
  margin-bottom: 4rem;
  scroll-margin-top: 2rem;
}

.demo-section__title {
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  font-size: 1.875rem;
  color: #1f2937;
}
</style>
