import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import '@/assets/css/reset.css'
import '@/assets/css/common.scss'
import lodash from 'lodash'
createApp(App).use(lodash).mount('#app')
