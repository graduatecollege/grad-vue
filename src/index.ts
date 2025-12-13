import type { App } from 'vue'
import GButton from './components/GButton.vue'

// Export individual components
export { GButton }

// Export a plugin for installing all components
export default {
  install(app: App) {
    app.component('GButton', GButton)
  }
}
