import { createRouter, createWebHistory } from 'vue-router'
import InstanceList from '../views/InstanceList.vue'
import ModelList from '../views/ModelList.vue'
import SceneList from '../views/SceneList.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/app/mccs/visualsys/model/list' },
    { path: '/app/mccs/visualsys/instance/list', name: 'instance-list', component: InstanceList },
    { path: '/app/mccs/visualsys/instance/card', redirect: '/app/mccs/visualsys/instance/list' },
    { path: '/app/mccs/visualsys/scene/list', name: 'scene-list', component: SceneList },
    { path: '/app/mccs/visualsys/model/list', name: 'model-list', component: ModelList },
  ],
})
