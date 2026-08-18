import Vue from 'vue';
import Vuex from 'vuex';
import login from './login.js';
import common from './common.js';
import createProject from './createProject.js';
Vue.use(Vuex);
export default new Vuex.Store({
  modules:{
    login,
		common,
		createProject
  }
});