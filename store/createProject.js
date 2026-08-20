import { setCache, getCache } from '@/common/js/utils'
import { getDefaultProjectState } from '@/common/js/resetStore/resetStore.js'
export default {
  state: getDefaultProjectState(),
	
  getters:{
		repairsWorkOrderMsg:(state) => {
			state.repairsWorkOrderMsg = getCache('repairsWorkOrderMsg') ? getCache('repairsWorkOrderMsg') : {};
			return state.repairsWorkOrderMsg
		}
  },

  mutations:{
		// 保存工程订单详情的信息
		changeRepairsWorkOrderMsg (state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('repairsWorkOrderMsg', playLoad);
				state.repairsWorkOrderMsg = playLoad
			}
		}
  },
  
  actions:{}
}
