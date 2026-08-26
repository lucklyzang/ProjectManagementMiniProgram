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
			state.isCompleteRepairsWorkOrderPhotoList = getCache('completPhotoInfo') ? getCache('completPhotoInfo')['photoInfo'] : [];
			return state.isCompleteRepairsWorkOrderPhotoList
		},
		isFillMaterialList:(state) => {
			state.isFillMaterialList = getCache('isFillMaterialList') ? getCache('isFillMaterialList')['number'] : [];
			return state.isFillMaterialList
		},
		departmentServiceMsg:(state) => {
			state.departmentServiceMsg = getCache('departmentServiceMsg') ? getCache('departmentServiceMsg') : {};
			return state.departmentServiceMsg
		},
		isCurrentDepartmentServiceVerifySweepCode:(state) => {
			state.isCurrentDepartmentServiceVerifySweepCode = getCache('isCurrentDepartmentServiceVerifySweepCode') ? getCache('isCurrentDepartmentServiceVerifySweepCode')['number'] : [];
			return state.isCurrentDepartmentServiceVerifySweepCode
		},
		completeDepartmentServiceOfficeInfo:(state) => {
			state.completeDepartmentServiceOfficeInfo = getCache('isCompleteDepartmentServiceOfficeInfo') ? getCache('isCompleteDepartmentServiceOfficeInfo')['sweepCodeInfo'] : [];
			return state.completeDepartmentServiceOfficeInfo
		},
		isDepartmentServiceVerifySweepCode:(state) => {
			state.isDepartmentServiceVerifySweepCode = getCache('isDepartmentServiceVerifySweepCode') ? getCache('isDepartmentServiceVerifySweepCode')['sweepCodeInfo'] : [];
			return state.isDepartmentServiceVerifySweepCode
		},
		departmentServiceOfficeId:(state) => {
			state.departmentServiceOfficeId = getCache('departmentServiceId') ? getCache('departmentServiceId'): '';
			return state.departmentServiceOfficeId
		},
		isSingleDepartmentSignature: state => state.isSingleDepartmentSignature,
		completeDepartmentServiceCheckedItemList:(state) => {
			state.completeDepartmentServiceCheckedItemList = getCache('isCompleteDepartmentServiceCheckedItemList') ? getCache('isCompleteDepartmentServiceCheckedItemList')['sweepCodeInfo'] : [];
			return state.completeDepartmentServiceCheckedItemList
		},
		currentDepartmentServiceCheckedItemId: state => {
			state.currentDepartmentServiceCheckedItemId = getCache('checkedItemId') ? getCache('checkedItemId') : null;
			return state.currentDepartmentServiceCheckedItemId
		},
		completeRoomList:(state) => {
			state.completeRoomList = getCache('completeRoomList') ? getCache('completeRoomList')['sweepCodeInfo'] : [];
			return state.completeRoomList
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
		},
		// 改变巡检任务信息的状态
		changeDepartmentServiceMsg (state, playLoad) {
			setCache('departmentServiceMsg', playLoad)
			state.departmentServiceMsg = playLoad
		},
		// 改变当前巡检任务扫码校验通过的科室id
		changeIsCurrentDepartmentServiceVerifySweepCode (state, playLoad) {
			setCache('isCurrentDepartmentServiceVerifySweepCode',{"number": playLoad});
			state.isCurrentDepartmentServiceVerifySweepCode = playLoad
		},
		// 改变完成巡检任务的科室信息
		changeCompleteDepartmentServiceOfficeInfo (state, playLoad) {
			setCache('isCompleteDepartmentServiceOfficeInfo', {"sweepCodeInfo": playLoad});
			state.completeDepartmentServiceOfficeInfo = playLoad
		},
		// 改变巡检任务扫码校验通过的科室编号
		changeIsDepartmentServiceVerifySweepCode (state, playLoad) {
			setCache('isDepartmentServiceVerifySweepCode', {"sweepCodeInfo": playLoad});
			state.isDepartmentServiceVerifySweepCode = playLoad
		},
		// 改变当前巡检任务扫码校验通过的科室编号
		changeDepartmentServiceOfficeId (state, playLoad) {
			setCache('departmentServiceId',playLoad);
			state.departmentServiceOfficeId = playLoad
		},
		// 改变是否是单个科室的签字状态
		changeIsSingleDepartmentSignature (state, playLoad) {
			state.isSingleDepartmentSignature = playLoad
		},
		// 改变当前完成问题上报的检查项id
		changeCompleteDepartmentServiceCheckedItemList (state, playLoad) {
			setCache('isCompleteDepartmentServiceCheckedItemList', {"sweepCodeInfo": playLoad})
			state.completeDepartmentServiceCheckedItemList = playLoad
		},
		// 改变当前点击过的检查项id
		changeCurrentDepartmentServiceCheckedItemId (state, playLoad) {
			setCache("checkedItemId",playLoad);
			state.currentDepartmentServiceCheckedItemId = playLoad
		},
		// 改变完成房间检修的状态
		changeCompleteRoomList (state, playLoad) {
			setStore('completeRoomList', {"sweepCodeInfo": playLoad})
			state.completeRoomList = playLoad
		}
  },
  
  actions:{}
}
