import { setCache, getCache } from '@/common/js/utils'
import { getDefaultProjectState } from '@/common/js/resetStore/resetStore.js'
export default {
  state: getDefaultProjectState(),
  getters:{
		repairsWorkOrderMsg:(state) => {
			state.repairsWorkOrderMsg = getCache('repairsWorkOrderMsg') ? getCache('repairsWorkOrderMsg') : {};
			return state.repairsWorkOrderMsg
		},
		isCompleteRepairsWorkOrderPhotoList:(state) => {
			state.isCompleteRepairsWorkOrderPhotoList = getCache('completPhotoInfo') ? JSON.parse(getCache('completPhotoInfo'))['photoInfo'] : [];
			return state.isCompleteRepairsWorkOrderPhotoList
		},
		isFillMaterialList:(state) => {
			state.isFillMaterialList = getCache('isFillMaterialList') ? JSON.parse(getCache('isFillMaterialList'))['number'] : [];
			return state.isFillMaterialList
		},
  },

  mutations:{
		// 保存工程订单详情的信息
		changeRepairsWorkOrderMsg (state, playLoad) {
			if (playLoad && playLoad != 'null') {
				setCache('repairsWorkOrderMsg', playLoad);
				state.repairsWorkOrderMsg = playLoad
			}
		},
		// 改变已完成上传图片的状态
		changeIsCompletePhotoList (state, playLoad) {
			setCache('completPhotoInfo', {"photoInfo": photoInfo});
			state.isCompleteRepairsWorkOrderPhotoList = playLoad
		},
		// 改变是否填写耗材的状态
		 changeisFillMaterialList (state, playLoad) {
			setCache('isFillMaterialList', {"number": playLoad})
			state.isFillMaterialList = playLoad
		}
  },
  
  actions:{}
}
