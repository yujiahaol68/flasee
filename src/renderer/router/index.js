import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'task-process-page',
      component: require('@/pages/TaskProcessPage').default
    },
    {
      path: '/done',
      name: 'processing-task',
      component: require('@/components/ProcessingTask').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
