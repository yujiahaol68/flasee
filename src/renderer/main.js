import Vue from 'vue'
import axios from 'axios'
import WebTorrent from 'webtorrent'

import App from './App'
import router from './router'
import store from './store'

// dev
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
Vue.use(MuseUI)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

const client = new WebTorrent()
Object.defineProperty(Vue.prototype, '$btClient', { value: client })

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
