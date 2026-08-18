import App from './App'
import store from './store'
import moment from 'moment'
import { getCache } from '@/common/js/utils'
import { noMultipleClicks } from '@/common/js/utils'
Vue.prototype.$noMultipleClicks = noMultipleClicks;
moment.locale('zh-cn');
Vue.prototype.$moment = moment;
import uView from "uview-ui";
Vue.use(uView);
// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App,
	store
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif