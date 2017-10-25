import Vue from 'vue'
import axios from 'axios'
import WebTorrent from 'webtorrent'

import App from './App'
import router from './router'
import store from './store'

import {
  task,
  setting
} from './datastore'

// dev
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
Vue.use(MuseUI)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

const client = new WebTorrent()

client.on('error', err => {
  if (err) console.log(err)
})

Vue.prototype.$btClient = client
Vue.prototype.$db = {
  task,
  setting
}

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
