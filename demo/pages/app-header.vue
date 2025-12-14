<template>
  <div>
    <h1>GAppHeader Component</h1>
    
    <ComponentDemo
      name="Basic App Header"
      description="An application header component for branding and navigation."
    >
      <GAppHeader>
        <template #logo>
          <div style="font-size: 1.5rem; font-weight: bold;">Logo</div>
        </template>
        <template #default>
          <nav style="display: flex; gap: 1rem;">
            <a href="#" style="color: inherit;">Home</a>
            <a href="#" style="color: inherit;">About</a>
            <a href="#" style="color: inherit;">Contact</a>
          </nav>
        </template>
      </GAppHeader>
    </ComponentDemo>
  </div>
</template>
