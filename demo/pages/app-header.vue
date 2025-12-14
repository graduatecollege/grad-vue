<template>
  <div>
    <h1>GAppHeader Component</h1>
    
    <ComponentDemo
      name="Basic App Header"
      description="An application header component with Block I branding and Illinois styling."
    >
      <GAppHeader>
        <template #title>
          <span style="font-size: 1.25rem; font-weight: 600;">Graduate College Portal</span>
        </template>
        <template #app-controls>
          <nav style="display: flex; gap: 1rem; align-items: center;">
            <a href="#" style="color: inherit; text-decoration: none;">Profile</a>
            <a href="#" style="color: inherit; text-decoration: none;">Settings</a>
            <GButton size="small">Logout</GButton>
          </nav>
        </template>
      </GAppHeader>
    </ComponentDemo>
  </div>
</template>
