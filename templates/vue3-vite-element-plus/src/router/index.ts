import { createRouter, createWebHistory } from 'vue-router'
import OperationsOverview from '../views/OperationsOverview.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', name: 'operations-overview', component: OperationsOverview }],
})
