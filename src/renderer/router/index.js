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
      path: '/stream_play',
      name: 'stream-player',
      component: require('@/components/StreamPlayer').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
