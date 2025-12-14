<template>
  <div class="home">
    <h1>Welcome to Grad-Vue Component Library</h1>
    <p class="home__intro">
      This is a demo site showcasing all the components available in the Grad-Vue library.
      Navigate through the sidebar to explore each component with interactive examples.
    </p>

    <div class="home__features">
      <div class="home__feature">
        <h3>🎨 Interactive Demos</h3>
        <p>Test each component with customizable props in real-time</p>
      </div>
      <div class="home__feature">
        <h3>♿ Accessibility First</h3>
        <p>All components are built with accessibility as a primary concern</p>
      </div>
      <div class="home__feature">
        <h3>🧪 Test Results</h3>
        <p>View test status for each component (placeholder for now)</p>
      </div>
    </div>

    <div class="home__components">
      <h2>Available Components</h2>
      <ul class="home__component-list">
        <li><NuxtLink to="/button">GButton</NuxtLink> - Customizable button component</li>
        <li><NuxtLink to="/text-input">GTextInput</NuxtLink> - Text input with label and validation</li>
        <li><NuxtLink to="/select">GSelect</NuxtLink> - Dropdown select component</li>
        <li><NuxtLink to="/select-button">GSelectButton</NuxtLink> - Button-style select</li>
        <li><NuxtLink to="/search">GSearch</NuxtLink> - Search input component</li>
        <li><NuxtLink to="/progress">GProgress</NuxtLink> - Progress indicator</li>
        <li><NuxtLink to="/popover">GPopover</NuxtLink> - Popover overlay component</li>
        <li><NuxtLink to="/alert-dialog">GAlertDialog</NuxtLink> - Alert dialog modal</li>
        <li><NuxtLink to="/app-header">GAppHeader</NuxtLink> - Application header</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.home {
  max-width: 900px;
}

.home__intro {
  font-size: 1.125rem;
  line-height: 1.7;
  color: #4b5563;
  margin-bottom: 2rem;
}

.home__features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.home__feature {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.home__feature h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #1f2937;
}

.home__feature p {
  margin: 0;
  color: #6b7280;
}

.home__components {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-top: 2rem;
}

.home__components h2 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.home__component-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.home__component-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.home__component-list li:last-child {
  border-bottom: none;
}

.home__component-list a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

.home__component-list a:hover {
  text-decoration: underline;
}
</style>
