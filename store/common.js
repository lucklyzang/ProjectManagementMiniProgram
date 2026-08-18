import { setCache, getCache } from '@/common/js/utils'
import { getDefaultCommonState } from '@/common/js/resetStore/resetStore.js'
export default {	
	state: getDefaultCommonState(),
	getters: {
		statusBarHeight:(state) => {
			state.statusBarHeight = getCache('statusBarHeight') ? getCache('statusBarHeight') : 47;
			return state.statusBarHeight
		},
		navigationBarHeight:(state) => {
			state.navigationBarHeight = getCache('navigationBarHeight') ? getCache('navigationBarHeight') : 40;
			return state.navigationBarHeight
		},
		capsuleMessage:(state) => {
			state.capsuleMessage = getCache('capsuleMessage') ? getCache('capsuleMessage') : {};
			return state.capsuleMessage
		},
		departmentMessage:(state) => {
			state.departmentMessage = getCache('departmentMessage') ? getCache('departmentMessage') : {};
			return state.departmentMessage
		},
		baseURL:(state) => {
			return state.baseURL
		}
	},
	mutations: {
		storeStatusBarHeight(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('statusBarHeight', playLoad);
				state.statusBarHeight = playLoad
			}
		},
		storeNavigationBarHeight(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('navigationBarHeight', playLoad);
				state.navigationBarHeight = playLoad
			}
		},
		storeCapsuleMessage(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('capsuleMessage', playLoad);
				state.capsuleMessage = playLoad
			}
		},
		storeDepartmentMessage(state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('departmentMessage', playLoad);
				state.departmentMessage = playLoad
			}
		},
		//重置公共信息的状态
		resetCommonInfoState(state) {
				Object.assign(state, getDefaultCommonState())
		}
	},
	actions: {
		resetCommitState({ commit }) {
			commit('resetCommonInfoState')
		}
	}
}
