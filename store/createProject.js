import { setCache, getCache } from '@/common/js/utils'
import { getDefaultProjectState } from '@/common/js/resetStore/resetStore.js'
export default {
  state: getDefaultProjectState(),
	
  getters:{
		projectTaskMessage:(state) => {
			state.projectTaskMessage = getCache('projectTaskMessage') ? getCache('projectTaskMessage') : {};
			return state.projectTaskMessage
		}
  },

  mutations:{
		// 保存工程订单详情的信息
		changeProjectTaskMessage (state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('projectTaskMessage', playLoad);
				state.projectTaskMessage = playLoad
			}
		}
  },
  
  actions:{}
}
