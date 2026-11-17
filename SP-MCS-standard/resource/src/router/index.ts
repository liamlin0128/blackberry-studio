import { createRouter, createWebHistory } from 'vue-router'
import OpticalPayloadView from '../views/OpticalPayloadView.vue'
import AntennaListView from '../views/AntennaListView.vue'
import SatelliteListView from '../views/SatelliteListView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/app/mccs/resourcesys/satellite/list' },
    { path: '/app/mccs/resourcesys/satellite/list', name: 'satellite-management', component: SatelliteListView },
    { path: '/app/mccs/resourcesys/payload/list', name: 'optical-payload-management', component: OpticalPayloadView },
    { path: '/app/mccs/resourcesys/antenna/list', name: 'antenna-management', component: AntennaListView },
  ],
})
