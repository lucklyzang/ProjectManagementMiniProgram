import { setCache, getCache } from '@/common/js/utils'
import { getDefaultLoginState } from '@/common/js/resetStore/resetStore.js'
export default {	
	state: getDefaultLoginState(),
	getters: {
		userInfo:(state) => {
			state.userInfo = getCache('userInfo') ? getCache('userInfo') : {};
			return state.userInfo
		},
		isLogin: (state) => {
			state.isLogin = getCache('isLogin') ? getCache('isLogin') === 'false' ? false : true : false;
			return state.isLogin
		},
		token:(state) => {
			state.token = getCache('token') ? getCache('token') : null;
			return state.token
		},
		affairToken:(state) => {
			state.affairToken = getCache('affairToken') ? getCache('affairToken') : null;
			return state.affairToken
		},
		overDueWay: state => state.overDueWay,
		newTaskName:(state) => {
			state.newTaskName = getCache('newTaskList') ? JSON.parse(getCache('newTaskList'))['taskName'] : [];
			return state.newTaskName
		},
		globalTimer: state => state.globalTimer
	},
	mutations: {
		changeIsMedicalMan (state, playLoad) {
			setCache('isMedicalMan', playLoad);
		  state.isMedicalMan = playLoad
		},
		storeUserInfo(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('userInfo', playLoad);
				state.userInfo = playLoad
			}
		},
		// 改变全局定时器的状态
		changeGlobalTimer (state, playLoad) {
			state.globalTimer = playLoad
		},
		// 改变新任务列表状态
		changeNewTaskList (state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('newTaskList',{taskName:playLoad})
				state.newTaskName = playLoad
			}
		},
		// 修改token状态
		changeToken(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('token', playLoad);
				state.token = playLoad
			}
		},
		// 修改事务接口token状态
		changeAffairToken(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('affairToken', playLoad);
				state.affairToken = playLoad
			}
		},
		// 修改是否登录状态
		changeIsLogin(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('isLogin', playLoad);
				state.isLogin = playLoad
			}
		},
		// 修改过期方式
		changeOverDueWay(state, playLoad) {
			state.overDueWay = playLoad
		},
		//重置登录信息的状态
		resetLoginInfoState(state) {
				Object.assign(state, getDefaultLoginState())
		}
	},
	actions: {
		resetLoginState({ commit }) {
			commit('resetLoginInfoState')
		}
	}
}
