import { createRouter, createWebHistory } from 'vue-router'
import { excluded0701, is0701 } from '../version'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/app/mccs/tasksys/requirement/list' },
    { path: '/app/mccs/tasksys/requirement/list', name: 'requirement-list', component: () => import('../views/RequirementListView.vue') },
    { path: '/app/mccs/tasksys/requirement/plan', name: 'planning-compute', component: () => import('../views/PlanningComputeView.vue') },
    { path: '/app/mccs/tasksys/requirement/area-project', name: 'area-planning', component: () => import('../views/AreaPlanningView.vue') },
    { path: '/app/mccs/tasksys/requirement/meta-task', name: 'meta-task-list', component: () => import('../views/MetaTaskListView.vue') },
    { path: '/app/mccs/tasksys/schedule/compute', name: 'schedule-compute', component: () => import('../views/ScheduleComputeView.vue') },
    { path: '/app/mccs/tasksys/schedule/config', name: 'schedule-config', component: () => import('../views/ScheduleConfigView.vue') },
    { path: '/app/mccs/tasksys/schedule/algorithm', name: 'algorithm-management', component: () => import('../views/AlgorithmManagementView.vue') },
    { path: '/app/mccs/tasksys/schedule/emergency', name: 'emergency-task-handling', component: is0701 ? () => import('../views/OnboardTaskHandlingView.vue') : () => import('../views/EmergencyTaskHandlingView.vue') },
    { path: '/app/mccs/tasksys/schedule/parameter', name: 'parameter-management', component: () => import('../views/ParameterManagementView.vue') },
    { path: '/app/mccs/tasksys/task/schedule', name: 'task-plan-list', component: () => import('../views/TaskPlanListView.vue') },
    { path: '/app/mccs/tasksys/task/gant', name: 'task-plan-gantt', component: () => import('../views/TaskPlanGanttView.vue') },
    { path: '/app/mccs/tasksys/task/ttc', name: 'manual-pass-management', component: () => import('../views/ManualPassView.vue') },
    { path: '/app/mccs/tasksys/task/transmission-record', name: 'transmission-records', component: () => import('../views/TransmissionRecordsView.vue') },
    { path: '/app/mccs/tasksys/data/taskPlan', name: 'space-task-status', component: () => import('../views/DataReceptionView.vue'), meta: { kind: 'status' } },
    { path: '/app/mccs/tasksys/data/urgentRecord', name: 'emergency-planning-records', component: () => import('../views/DataReceptionView.vue'), meta: { kind: 'urgent' } },
    { path: '/app/mccs/tasksys/data/ipuRecord', name: 'ipu-statistics', component: () => import('../views/DataReceptionView.vue'), meta: { kind: 'ipu' } },
    { path: '/app/mccs/tasksys/data/taskLog', name: 'space-task-logs', component: () => import('../views/DataReceptionView.vue'), meta: { kind: 'logs' } },
    { path: '/app/mccs/tasksys/data/fileTabel', name: 'space-file-list', component: () => import('../views/SpaceFileListView.vue') },
    { path: '/app/mccs/tasksys/uploadFile/uploadFileTable', name: 'upload-registration', component: () => import('../views/UploadRegistrationView.vue') },
    { path: '/app/mccs/tasksys/resource/satellite/list', name: 'resource-satellite-management', component: () => import('../views/ResourceManagementView.vue') },
    { path: '/app/mccs/tasksys/resource/payload/list', name: 'resource-payload-management', component: () => import('../views/ResourceManagementView.vue') },
    { path: '/app/mccs/tasksys/resource/antenna/list', name: 'resource-antenna-management', component: () => import('../views/ResourceManagementView.vue') },
    { path: '/app/mccs/tasksys/system/dict', name: 'dictionary-management', component: () => import('../views/DictionaryManagementView.vue') },
    { path: '/app/mccs/tasksys/system/syslog', name: 'system-logs', component: () => import('../views/SystemLogView.vue'), meta: { kind: 'system' } },
    { path: '/app/mccs/tasksys/system/sys-operation-log', name: 'operation-logs', component: () => import('../views/SystemLogView.vue'), meta: { kind: 'operation' } },
    { path: '/app/mccs/tasksys/project/requirement-submit', name: 'project-requirement-submit', component: () => import('../views/ProjectRequirementSubmitView.vue'), meta: { projectOnly: true } },
    { path: '/app/mccs/tasksys/project/requirement-submissions', name: 'project-requirement-submissions', component: () => import('../views/ProjectRequirementListView.vue'), meta: { projectOnly: true } },
    { path: '/app/mccs/tasksys/project/semi-automatic-planning', redirect: '/app/mccs/tasksys/schedule/compute?dialog=semi' },
    { path: '/app/mccs/tasksys/project/data-transmission-planning', redirect: '/app/mccs/tasksys/schedule/compute?dialog=semi&mode=data' },
    { path: '/app/mccs/tasksys/project/:feature', name: 'project-placeholder', component: () => import('../views/ProjectPlaceholderView.vue'), meta: { projectOnly: true } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/ProjectPlaceholderView.vue'), meta: { title: '页面不存在' } },
  ],
})
router.beforeEach((to) => {
  if (is0701 && excluded0701.has(String(to.name))) return { name: 'not-found', params: { pathMatch: ['not-available-in-0701'] } }
  if (!is0701 && to.meta.projectOnly) return { name: 'not-found', params: { pathMatch: ['project-only'] } }
})
export default router
