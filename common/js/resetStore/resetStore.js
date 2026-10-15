// 登录信息store的初始值
export function getDefaultLoginState() {
	return {
		userInfo: {},
		token: null, //请求token,
		affairToken: null, //事务订单专用token
		isLogin: false,
		overDueWay: false,
		globalTimer: null,
		newTaskName: [],
		currentElectronicSignature: null
	}	
}

// 公共信息store的初始值
export function getDefaultCommonState() {
	return {
		//状态栏高度
		statusBarHeight: 0,
		//导航栏栏高度
		navigationBarHeight: 0,
		// 胶囊信息
		capsuleMessage: {},
		// 科室信息
		departmentMessage: {},
		ossMessage: {},
		timeMessage: {},
		// 生产域名 https://blinktech.cn
		// 开发域名 https://blink.blinktech.cn
		// 准生产域名 https://ver.blinktech.cn
		// 测试域名 https://show.blinktech.cn
		// 新测试域名 https://act.blinktech.cn
		baseURL: 'https://ver.blinktech.cn'
	}	
}

// 工程订单信息store的初始值
export function getDefaultProjectState() {
	return {
		// 报修工单详情
		repairsWorkOrderMsg: {},
		isCompleteRepairsWorkOrderPhotoList: [],
		isFillMaterialList: [],
		departmentServiceMsg: {},
		isCurrentDepartmentServiceVerifySweepCode: [],
		completeDepartmentServiceOfficeInfo: [],
		isDepartmentServiceVerifySweepCode: [],
		departmentServiceOfficeId: '',
		isSingleDepartmentSignature: true,
		completeDepartmentServiceCheckedItemList: [],
		currentDepartmentServiceCheckedItemId: null,
		completeRoomList: []
	}	
}

// 自主任务模块store的初始值
export function getDefaultAutoRepairTaskState() {
	return {
		createAutoRepairTaskMessage: {}, //创建自主报修任务信息(暂存)
		submitAutoRepairTaskMessage: {} //提交自主报修任务信息
	}
}

// 调度管理模块store的初始值
export function getDefaultTaskSchedulingState() {
	return {
		// 任务调度类型
		schedulingTaskType: {},
		// 任务调度详情
		schedulingTaskDetails: {},
		// 任务调度相关信息
		schedulingTaskAboutMessage: {},
		//操作按钮点击记录
		operateBtnClickRecord: {
			allocationBtnClick: false,
			delayBtnClick: false,
			cancelBtnClick: false
		},
		// 暂存创建维修任务的信息
		temporaryStorageCreateRepairsTaskMessage: {}
	}
}