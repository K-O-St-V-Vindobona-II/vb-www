import './style.css'
import { createApp } from 'vue'
import App from './App.vue'

// No router: App.vue is a single long page with anchor-based section
// navigation, not a multi-view SPA (see README.md's Architektur section).
createApp(App).mount('#app')
