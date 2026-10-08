import { setCache, getCache } from '@/common/js/utils'
import { getDefaultTaskSchedulingState } from '@/common/js/resetStore/resetStore.js'

export default {
	state: getDefaultTaskSchedulingState(),
	getters:{
		schedulingTaskType: (state) => {
		  return state.schedulingTaskType
		},
		schedulingTaskDetails: (state) => {
		  return state.schedulingTaskDetails
		},
		schedulingTaskAboutMessage: (state) => {
		  return state.schedulingTaskAboutMessage
		},
		operateBtnClickRecord: (state) => {
		  return state.operateBtnClickRecord
		},
		temporaryStorageCreateRepairsTaskMessage: (state) => {
		  return state.temporaryStorageCreateRepairsTaskMessage
		}
	},

  mutations:{

    // 保存任务调度切换类型
    changeSchedulingTaskType (state, payLoad) {
      state.schedulingTaskType = payLoad
    },

    // 保存任务调度详情
    changeSchedulingTaskDetails (state, payLoad) {
      state.schedulingTaskDetails = payLoad
    },

     // 保存任务调度相关信息
     changeSchedulingTaskAboutMessage (state, payLoad) {
      state.schedulingTaskAboutMessage = payLoad
    },

    // 保存操作按钮点击记录
    changeOperateBtnClickRecord (state, payLoad) {
      state.operateBtnClickRecord = payLoad
    },

    // 保存暂存创建维修任务的信息
    changeTemporaryStorageCreateRepairsTaskMessage (state, payLoad) {
      state.temporaryStorageCreateRepairsTaskMessage = payLoad
    },
		
		//重置调度管理状态
		resetTaskSchedulingState(state) {
			Object.assign(state, getDefaultTaskSchedulingState())
		}
  },
  
  actions:{
		resetTaskSchedulingStateAction({ commit }) {
			commit('resetTaskSchedulingState')
		}
	}
}
