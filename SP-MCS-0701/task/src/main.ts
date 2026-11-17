import { createApp } from 'vue'
import { ElLoading } from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import { productName } from './version'
document.title = productName
import router from './router'
import './styles/theme.css'
import './style.css'

const app = createApp(App)
app.use(ElLoading).use(router).mount('#app')
